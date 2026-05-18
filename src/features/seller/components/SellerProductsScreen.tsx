import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  Search,
  Eye,
  Pencil,
  MoreVertical,
  Archive,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Package,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  Send,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import {
  useArchiveProduct,
  useDeleteDraftProduct,
  useSaveDraftProduct,
  useSellerProducts,
  useSubmitProductsForReview,
} from "../../../hooks/use-products"
import { useShopVouchers } from "../../../hooks/use-vouchers"
import type {
  ProductDoc,
  ProductPromotionSettings,
  ProductStatus,
} from "../../../lib/product-service"
import type { VoucherDoc } from "../../../lib/voucher-service"
import { useMyVendor } from "../../../hooks/use-vendor"
import { PRODUCT_CATEGORIES } from "../../../lib/product-categories"

const TABS: { id: ProductStatus | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "approved", label: "Đang bán" },
  { id: "rejected", label: "Bị từ chối" },
  { id: "draft", label: "Nháp" },
  { id: "archived", label: "Đã ẩn" },
]

const STATUS_BADGE: Record<
  ProductStatus,
  { label: string; cls: string; icon: any }
> = {
  draft: {
    label: "Nháp",
    cls: "bg-neutral-100 text-neutral-700",
    icon: Pencil,
  },
  pending: {
    label: "Chờ duyệt",
    cls: "bg-amber-100 text-amber-800",
    icon: Clock,
  },
  approved: {
    label: "Đang bán",
    cls: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Từ chối",
    cls: "bg-rose-100 text-rose-700",
    icon: XCircle,
  },
  archived: {
    label: "Đã ẩn",
    cls: "bg-neutral-200 text-neutral-600",
    icon: Archive,
  },
}

type ImportRowIssue = {
  line: number
  title: string
  reason: string
}

function canBulkSubmitForReview(product: ProductDoc): boolean {
  return product.status === "draft" || product.status === "rejected"
}

const CSV_TEMPLATE_HEADERS = [
  "title",
  "description",
  "brand",
  "category",
  "price",
  "stock",
  "sku",
  "variant",
  "image",
  "weight",
  "promotion_scope",
  "voucher_codes",
  "affiliate_commission_percent",
]

const CSV_TEMPLATE_ROWS = [
  [
    "Son Dưỡng SPF 15 Natural Beauty 4g",
    "Mô tả ngắn gọn về thành phần, công dụng và hướng dẫn sử dụng",
    "Natural Beauty",
    "Mỹ phẩm",
    "180000",
    "50",
    "NB-LIP-SPF15",
    "Hồng nude",
    "https://example.com/product-image.jpg",
    "120",
    "product",
    "NBSALE10;FREESHIP",
    "8",
  ],
  [
    "Sữa rửa mặt trà xanh 120ml",
    "Sản phẩm chính hãng, phù hợp da dầu",
    "Green Care",
    "Mỹ phẩm",
    "220000",
    "35",
    "GC-CLEANSER-120",
    "Mặc định",
    "https://example.com/cleanser.jpg",
    "180",
    "category",
    "BEAUTY15",
    "5",
  ],
]

const MARKETPLACE_GUIDES = [
  {
    name: "Shopee",
    steps: "Kênh Người Bán > Sản phẩm > Tất cả sản phẩm > Xuất dữ liệu sản phẩm.",
    url: "https://banhang.shopee.vn/",
  },
  {
    name: "Lazada",
    steps: "Seller Center > Products > Manage Products > Export.",
    url: "https://sellercenter.lazada.vn/",
  },
  {
    name: "TikTok Shop",
    steps: "Seller Center > Products > Manage Products > Export products.",
    url: "https://seller-vn.tiktok.com/",
  },
  {
    name: "Tiki/Sendo",
    steps: "Seller Center > Quản lý sản phẩm > Xuất danh sách sản phẩm.",
    url: "https://sellercenter.tiki.vn/",
  },
]

export default function SellerProductsScreen() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<ProductStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [csvHelpOpen, setCsvHelpOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const vendor = useMyVendor()
  const shopId = vendor.data?.vendor?.firebase_uid ?? null
  const shopVouchers = useShopVouchers(shopId)
  const list = useSellerProducts({
    status: tab === "all" ? undefined : tab,
    q: search || undefined,
  })

  const archiveProductM = useArchiveProduct()
  const deleteDraftProductM = useDeleteDraftProduct()
  const saveDraftM = useSaveDraftProduct()
  const submitProductsForReviewM = useSubmitProductsForReview()

  const products = list.data?.products ?? []
  const selectedProducts = products.filter((product) => selectedIds.has(product.id))
  const selectedCount = selectedProducts.length
  const reviewableSelectedProducts = selectedProducts.filter(canBulkSubmitForReview)
  const ignoredSelectedCount = selectedCount - reviewableSelectedProducts.length
  const allVisibleSelected =
    products.length > 0 && products.every((product) => selectedIds.has(product.id))

  function downloadCsvTemplate() {
    const rows = [
      CSV_TEMPLATE_HEADERS,
      ...CSV_TEMPLATE_ROWS,
      [],
      ["# Danh mục gợi ý - copy một dòng bên dưới vào cột category"],
      ...PRODUCT_CATEGORIES.slice(0, 120).map((category) => [
        "",
        "",
        "",
        category.label,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]),
    ]
    const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n")
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "acfmart-product-import-template.csv"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  async function handleArchive(id: string, title: string) {
    if (!confirm(`Ẩn sản phẩm "${title}"?`)) return
    try {
      await archiveProductM.mutateAsync(id)
      toast.success("Đã ẩn sản phẩm")
      setActionMenuId(null)
    } catch (err: any) {
      toast.error(err?.message ?? "Ẩn thất bại")
    }
  }

  async function handleDeleteDraft(id: string, title: string) {
    if (!confirm(`Xóa vĩnh viễn sản phẩm nháp "${title}"?`)) return
    try {
      await deleteDraftProductM.mutateAsync(id)
      toast.success("Đã xóa sản phẩm nháp")
      setActionMenuId(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Xóa sản phẩm nháp thất bại. Vui lòng thử lại sau."))
    }
  }

  function toggleProductSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleMarkAllVisible() {
    setSelectedIds(new Set(products.map((product) => product.id)))
  }

  function handleUnmarkAll() {
    setSelectedIds(new Set())
  }

  async function handleSubmitMarkedForReview() {
    if (reviewableSelectedProducts.length === 0) {
      toast.error("Chưa chọn sản phẩm nháp hoặc bị từ chối để gửi duyệt.")
      return
    }
    if (!confirm(`Gửi ${reviewableSelectedProducts.length} sản phẩm đã chọn để admin duyệt?`)) {
      return
    }

    try {
      const result = await submitProductsForReviewM.mutateAsync(
        reviewableSelectedProducts.map((product) => product.id)
      )

      if (result.succeeded > 0) {
        toast.success(
          `Đã gửi ${result.succeeded} sản phẩm để admin duyệt${ignoredSelectedCount ? `, bỏ qua ${ignoredSelectedCount} sản phẩm không phù hợp` : ""}.`
        )
      }
      if (result.errors.length > 0) {
        const first = result.errors[0]
        toast.error(
          `${first.title}: ${sanitizeUserError(first.reason, "Không gửi duyệt được sản phẩm này.")}`,
          { duration: 8000 }
        )
      }
      if (result.succeeded === 0 && result.errors.length === 0) {
        toast.error("Không có sản phẩm nào được gửi duyệt.")
      }

      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const product of reviewableSelectedProducts) next.delete(product.id)
        return next
      })
      void list.refetch().catch((err) => {
        console.info("[SellerProductsScreen] Product list refresh skipped:", err)
      })
    } catch (err) {
      toast.error(sanitizeUserError(err, "Gửi duyệt hàng loạt thất bại. Vui lòng thử lại sau."))
    }
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const shop = vendor.data?.vendor
    if (!file || !shop) return

    const fileName = file.name.toLowerCase()
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      toast.error("Vui lòng mở file bằng Excel rồi Save As CSV UTF-8 trước khi nhập.")
      e.target.value = ""
      return
    }

    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length === 0) {
        toast.error("File không có dữ liệu sản phẩm. Kiểm tra hàng tiêu đề và các dòng bên dưới.")
        return
      }

      let imported = 0
      let skipped = 0
      let firstRowError: unknown = null
      const rowIssues: ImportRowIssue[] = []
      for (const [index, row] of rows.entries()) {
        const line = index + 2
        const title = rowValue(row, "title", "name", "product_name", "ten_san_pham", "Tên sản phẩm")
        const price = parseCsvNumber(rowValue(row, "price", "basePrice", "gia", "price_vnd", "Giá"))
        const stock = parseCsvNumber(rowValue(row, "stock", "quantity", "ton_kho", "Tồn kho"))
        if (!title || !Number.isFinite(price) || price <= 0) {
          rowIssues.push({
            line,
            title: title || "Không có tên",
            reason: !title ? "thiếu title" : "price phải là số lớn hơn 0",
          })
          skipped += 1
          continue
        }

        const promotion = buildPromotionFromCsv(row, shopVouchers.vouchers)
        const image = rowValue(row, "image", "thumbnail", "image_url", "Ảnh")
        const weight = parseCsvNumber(rowValue(row, "weight", "weight_grams", "can_nang", "Cân nặng"))

        try {
          await saveDraftM.mutateAsync({
            shopId: shop.firebase_uid,
            vendorId: shop.id,
            shopName: shop.shop_name,
            shopSlug: shop.shop_slug,
            title,
            description: rowValue(row, "description", "mo_ta", "Mô tả") || undefined,
            brand: rowValue(row, "brand", "thuong_hieu", "Thương hiệu") || "Chưa cập nhật",
            category: rowValue(row, "category", "danh_muc", "Danh mục") || "Chưa phân loại",
            thumbnail:
              image ||
              "https://placehold.co/600x600/f5f5f5/a3a3a3?text=ACFMart",
            images: image ? [image] : [],
            basePrice: price,
            variants: [
              {
                id: `bulk-${Date.now()}-${index}`,
                title: rowValue(row, "variant", "phan_loai", "Phân loại") || "Mặc định",
                sku: rowValue(row, "sku", "SKU") || `SKU-${Date.now()}-${index}`,
                price,
                stock: Number.isFinite(stock) ? stock : 0,
              },
            ],
            promotion,
            weightGrams: Number.isFinite(weight) && weight > 0 ? weight : undefined,
          })
          imported += 1
        } catch (err) {
          console.info("[SellerProductsScreen] Bulk import row failed:", {
            line,
            title,
            error: err,
          })
          firstRowError ??= err
          rowIssues.push({
            line,
            title,
            reason: sanitizeUserError(err, "Không lưu được dòng sản phẩm này."),
          })
          skipped += 1
        }
      }

      if (imported === 0) {
        toast.error(
          firstRowError
            ? sanitizeUserError(firstRowError, "Không nhập được sản phẩm nào. Vui lòng kiểm tra quyền shop và dữ liệu file.")
            : "Không có dòng sản phẩm hợp lệ. Mỗi dòng cần có title và price > 0."
        )
        return
      }
      toast.success(`Đã nhập ${imported} sản phẩm vào kho nháp${skipped ? `, bỏ qua ${skipped} dòng tham khảo/lỗi` : ""}.`)
      if (rowIssues.length > 0) {
        const firstIssue = rowIssues[0]
        toast.error(
          `Dòng ${firstIssue.line} (${firstIssue.title}) bị bỏ qua: ${firstIssue.reason}`,
          { duration: 8000 }
        )
      }
      setTab("draft")
      void list.refetch().catch((err) => {
        console.info("[SellerProductsScreen] Product list refresh skipped:", err)
      })
    } catch (err) {
      toast.error(sanitizeUserError(err, "Nhập file thất bại. Vui lòng lưu lại dạng CSV UTF-8 và thử lại."))
    } finally {
      e.target.value = ""
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
            Sản phẩm
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {products.length} sản phẩm trong gian hàng
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadCsvTemplate}
            className="btn-secondary"
          >
            <Download size={14} />
            Tải bảng mẫu CSV
          </button>
          <button
            onClick={() => setCsvHelpOpen((open) => !open)}
            className="btn-secondary"
          >
            <HelpCircle size={14} />
            Hướng dẫn nhập nhanh
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
            onChange={handleBulkUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!vendor.data?.vendor || saveDraftM.isPending}
            className="btn-secondary disabled:opacity-50"
          >
            <Upload size={14} />
            Nhập file vào kho
          </button>
          <Link to="/seller/products/new" className="btn-primary">
            <Plus size={14} />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {csvHelpOpen && (
        <div className="card mb-5 overflow-hidden">
          <div className="border-b border-neutral-100 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Nhập CSV vào kho nháp
                </h2>
                <p className="text-xs text-neutral-500">
                  Tải file mẫu, dán dữ liệu từ sàn khác vào đúng cột, rồi nhập CSV để tạo sản phẩm nháp.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
            <div>
              <h3 className="mb-2 text-sm font-bold text-neutral-900">
                Cột dữ liệu cần dùng
              </h3>
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-50 text-neutral-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Cột</th>
                      <th className="px-3 py-2 text-left font-medium">Cách điền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {[
                      ["title", "Tên sản phẩm, bắt buộc"],
                      ["category", "Danh mục theo danh sách gợi ý trong file mẫu; có thể tìm trong form thêm sản phẩm"],
                      ["price", "Giá bán VND, bắt buộc"],
                      ["stock", "Tồn kho của SKU/phân loại"],
                      ["sku / variant", "Mã SKU và tên phân loại"],
                      ["image", "URL ảnh sản phẩm; có thể đổi ảnh sau"],
                      ["promotion_scope", "none, product hoặc category"],
                      ["voucher_codes", "Mã voucher cách nhau bằng dấu ;"],
                      ["affiliate_commission_percent", "% hoa hồng riêng, ví dụ 8"],
                    ].map(([column, guide]) => (
                      <tr key={column}>
                        <td className="px-3 py-2 font-mono font-semibold text-brand-red-600">
                          {column}
                        </td>
                        <td className="px-3 py-2 text-neutral-600">{guide}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold text-neutral-900">
                Lấy file từ sàn khác
              </h3>
              <div className="space-y-2">
                {MARKETPLACE_GUIDES.map((guide) => (
                  <a
                    key={guide.name}
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 text-sm transition-colors hover:border-brand-red-300 hover:bg-brand-red-50"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900">{guide.name}</div>
                      <div className="mt-0.5 text-xs text-neutral-500">
                        {guide.steps}
                      </div>
                    </div>
                    <ExternalLink size={14} className="mt-0.5 text-neutral-400" />
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Sau khi xuất file, copy các cột tên sản phẩm, mô tả, giá, tồn kho, SKU và ảnh sang bảng mẫu ACFMart.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex overflow-x-auto border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              setSelectedIds(new Set())
            }}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-brand-red-500 text-brand-red-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {products.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={allVisibleSelected ? handleUnmarkAll : handleMarkAllVisible}
              className="rounded-md border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
            >
              {allVisibleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
            <button
              type="button"
              onClick={handleUnmarkAll}
              disabled={selectedCount === 0}
              className="rounded-md border border-neutral-200 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Bỏ chọn
            </button>
            <span className="text-neutral-500">
              Đã chọn <strong className="text-neutral-900">{selectedCount}</strong> sản phẩm
            </span>
            {ignoredSelectedCount > 0 && (
              <span className="text-xs text-amber-700">
                {ignoredSelectedCount} sản phẩm không ở trạng thái nháp/bị từ chối sẽ bị bỏ qua
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmitMarkedForReview}
            disabled={reviewableSelectedProducts.length === 0 || submitProductsForReviewM.isPending}
            className="btn-primary disabled:opacity-50"
          >
            <Send size={14} />
            Gửi duyệt đã chọn ({reviewableSelectedProducts.length})
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, thương hiệu, danh mục..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Loading */}
      {list.isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-brand-red-500" size={28} />
        </div>
      )}

      {/* Error */}
      {list.isError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Không tải được danh sách sản phẩm.{" "}
          <button
            onClick={() => list.refetch()}
            className="underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty */}
      {!list.isLoading && products.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <Package size={32} className="mx-auto text-neutral-300" />
          <div className="mt-2 text-sm font-semibold">Không có sản phẩm</div>
          <div className="text-xs text-neutral-500">
            {search ? "Thử từ khoá khác" : "Bấm 'Thêm sản phẩm' để bắt đầu"}
          </div>
        </div>
      )}

      {/* Table */}
      {products.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="w-10 px-4 py-3 text-left font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={allVisibleSelected ? handleUnmarkAll : handleMarkAllVisible}
                      aria-label="Chọn tất cả sản phẩm đang hiển thị"
                      className="h-4 w-4 rounded border-neutral-300 text-brand-red-600 focus:ring-brand-red-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                  <th className="px-4 py-3 text-right font-medium">Giá</th>
                  <th className="px-4 py-3 text-right font-medium">Kho</th>
                  <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    actionMenuOpen={actionMenuId === p.id}
                    onToggleMenu={() =>
                      setActionMenuId(actionMenuId === p.id ? null : p.id)
                    }
                    selected={selectedIds.has(p.id)}
                    onToggleSelected={() => toggleProductSelection(p.id)}
                    onCloseMenu={() => setActionMenuId(null)}
                    onArchive={() => handleArchive(p.id, p.title)}
                    onDeleteDraft={() => handleDeleteDraft(p.id, p.title)}
                    archiving={archiveProductM.isPending}
                    deleting={deleteDraftProductM.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductRow({
  product: p,
  selected,
  actionMenuOpen,
  onToggleSelected,
  onToggleMenu,
  onCloseMenu,
  onArchive,
  onDeleteDraft,
  archiving,
  deleting,
}: {
  product: ProductDoc
  selected: boolean
  actionMenuOpen: boolean
  onToggleSelected: () => void
  onToggleMenu: () => void
  onCloseMenu: () => void
  onArchive: () => void
  onDeleteDraft: () => void
  archiving: boolean
  deleting: boolean
}) {
  const status = STATUS_BADGE[p.status]
  const isLowStock = p.totalStock > 0 && p.totalStock < 10
  const StatusIcon = status.icon

  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-4 py-3 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelected}
          aria-label={`Chọn ${p.title}`}
          className="h-4 w-4 rounded border-neutral-300 text-brand-red-600 focus:ring-brand-red-500"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={p.thumbnail}
            alt={p.title}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <Link
              to={`/seller/products/${p.id}`}
              className="line-clamp-2 max-w-xs font-medium text-neutral-900 hover:text-brand-red-600"
            >
              {p.title}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
              {p.acfVerifyStatus !== "none" && (
                <span className="inline-flex items-center gap-0.5 rounded bg-brand-gold-100 px-1 py-0.5 text-brand-gold-800">
                  <ShieldCheck size={10} />
                  ACF {p.acfVerifyStatus === "approved" ? "✓" : "…"}
                </span>
              )}
              <span>{p.brand}</span>
              <span>·</span>
              <span>
                {p.variants.length > 0
                  ? `${p.variants.length} mẫu`
                  : "Chưa có mẫu"}
              </span>
              {p.promotion.voucherScope !== "none" && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-brand-red-600">
                    {p.promotion.voucherScope === "product" ? "Voucher SP" : "Voucher danh mục"}
                  </span>
                </>
              )}
              {p.promotion.affiliateCommissionBps !== null && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-emerald-700">
                    Affiliate {(p.promotion.affiliateCommissionBps / 100).toFixed(1)}%
                  </span>
                </>
              )}
            </div>
            {p.status === "rejected" && p.rejectedReason && (
              <div className="mt-1 line-clamp-1 max-w-md text-[11px] text-rose-600">
                ✗ {p.rejectedReason}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-semibold">
        {formatCurrency(p.basePrice)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className={cn(p.totalStock === 0 && "text-rose-600")}>
            {p.totalStock}
          </span>
          {isLowStock && <AlertTriangle size={12} className="text-amber-500" />}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold",
            status.cls
          )}
        >
          <StatusIcon size={10} />
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="relative inline-block">
          <button
            onClick={onToggleMenu}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100"
            aria-label="Hành động"
          >
            <MoreVertical size={14} />
          </button>
          {actionMenuOpen && (
            <>
              <button
                onClick={onCloseMenu}
                className="fixed inset-0 z-30"
                aria-label="Đóng"
              />
              <div className="absolute right-0 z-40 mt-1 w-48 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
                {p.status === "approved" && (
                  <Link
                    to={`/products/${p.handle}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50"
                    onClick={onCloseMenu}
                  >
                    <Eye size={12} />
                    Xem trên store
                  </Link>
                )}
                <Link
                  to={`/seller/products/${p.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50"
                  onClick={onCloseMenu}
                >
                  <Pencil size={12} />
                  {p.status === "rejected" ? "Sửa & gửi lại" : "Chỉnh sửa"}
                </Link>
                {p.status === "draft" && (
                  <button
                    onClick={onDeleteDraft}
                    disabled={deleting}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Xóa nháp
                  </button>
                )}
                {p.status !== "draft" && p.status !== "archived" && p.status !== "pending" && (
                  <button
                    onClick={onArchive}
                    disabled={archiving}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Ẩn sản phẩm
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return []

  const delimiter = detectDelimiter(lines[0])
  const headers = splitDelimitedLine(lines[0], delimiter).map((header) =>
    header.trim().replace(/^\uFEFF/, "")
  )
  return lines.slice(1).map((line) => {
    const values = splitDelimitedLine(line, delimiter)
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index]?.trim() ?? ""
      return row
    }, {})
  })
}

function normalizeCsvKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "")
}

function rowValue(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key]) return row[key]
  }

  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [normalizeCsvKey(key), value])
  )
  for (const key of keys) {
    const value = normalized.get(normalizeCsvKey(key))
    if (value) return value
  }
  return ""
}

function parseCsvNumber(value: string | undefined): number {
  if (!value) return 0
  const normalized = value.trim().replace(/\s/g, "")
  if (!normalized) return 0
  if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
    return Number(normalized.replace(/\./g, ""))
  }
  if (/^\d{1,3}(,\d{3})+$/.test(normalized)) {
    return Number(normalized.replace(/,/g, ""))
  }
  return Number(normalized.replace(",", "."))
}

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`
}

function parseVoucherCodes(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(/[;,|]/)
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20)
}

function normalizePromotionScope(value: string | undefined): ProductPromotionSettings["voucherScope"] {
  const scope = value?.trim().toLowerCase()
  if (scope === "product" || scope === "category") return scope
  return "none"
}

function buildPromotionFromCsv(
  row: Record<string, string>,
  vouchers: VoucherDoc[]
): ProductPromotionSettings {
  const voucherCodes = parseVoucherCodes(rowValue(row, "voucher_codes", "vouchers", "voucher", "ma_voucher", "Mã voucher"))
  const voucherByCode = new Map(vouchers.map((voucher) => [voucher.code.toUpperCase(), voucher]))
  const matchedVouchers = voucherCodes
    .map((code) => voucherByCode.get(code))
    .filter((voucher): voucher is VoucherDoc => !!voucher)
  const rawCommission =
    rowValue(
      row,
      "affiliate_commission_percent",
      "affiliateCommissionPercent",
      "commission",
      "hoa_hong_affiliate",
      "Hoa hồng affiliate"
    )
  const commission = rawCommission === "" ? null : parseCsvNumber(rawCommission)
  const voucherScope = voucherCodes.length > 0
    ? normalizePromotionScope(rowValue(row, "promotion_scope", "promotionScope", "pham_vi_khuyen_mai", "Phạm vi khuyến mãi"))
    : "none"

  return {
    voucherScope,
    voucherIds: voucherScope === "none" ? [] : matchedVouchers.map((voucher) => voucher.id),
    voucherCodes: voucherScope === "none" ? [] : voucherCodes,
    affiliateCommissionBps:
      commission === null || Number.isNaN(commission)
        ? null
        : Math.max(0, Math.min(3000, Math.round(commission * 100))),
  }
}

function detectDelimiter(headerLine: string): "," | "\t" | ";" {
  const tabs = (headerLine.match(/\t/g) ?? []).length
  const semicolons = (headerLine.match(/;/g) ?? []).length
  const commas = (headerLine.match(/,/g) ?? []).length
  if (tabs >= semicolons && tabs > commas) return "\t"
  if (semicolons > commas) return ";"
  return ","
}

function splitDelimitedLine(line: string, delimiter: "," | "\t" | ";"): string[] {
  const values: string[] = []
  let current = ""
  let quoted = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]
    if (char === "\"" && quoted && next === "\"") {
      current += "\""
      i++
    } else if (char === "\"") {
      quoted = !quoted
    } else if (char === delimiter && !quoted) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}
