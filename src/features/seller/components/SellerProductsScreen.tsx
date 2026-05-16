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
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import {
  useArchiveProduct,
  useSaveDraftProduct,
  useSellerProducts,
} from "../../../hooks/use-products"
import type { ProductDoc, ProductStatus } from "../../../lib/product-service"
import { useMyVendor } from "../../../hooks/use-vendor"

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

export default function SellerProductsScreen() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<ProductStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const vendor = useMyVendor()
  const list = useSellerProducts({
    status: tab === "all" ? undefined : tab,
    q: search || undefined,
  })

  const archiveProductM = useArchiveProduct()
  const saveDraftM = useSaveDraftProduct()

  const products = list.data?.products ?? []

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

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const shop = vendor.data?.vendor
    if (!file || !shop) return

    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length === 0) {
        toast.error("File CSV không có dữ liệu")
        return
      }

      for (const [index, row] of rows.entries()) {
        const title = row.title || row.name
        const price = Number(row.price || row.basePrice || 0)
        const stock = Number(row.stock || row.quantity || 0)
        if (!title || price <= 0) continue

        await saveDraftM.mutateAsync({
          shopId: shop.firebase_uid,
          vendorId: shop.id,
          shopName: shop.shop_name,
          shopSlug: shop.shop_slug,
          title,
          description: row.description || undefined,
          brand: row.brand || "Chưa cập nhật",
          category: row.category || "Chưa phân loại",
          thumbnail:
            row.image ||
            "https://placehold.co/600x600/f5f5f5/a3a3a3?text=ACFMart",
          images: row.image ? [row.image] : [],
          basePrice: price,
          variants: [
            {
              id: `bulk-${Date.now()}-${index}`,
              title: row.variant || "Mặc định",
              sku: row.sku || `SKU-${Date.now()}-${index}`,
              price,
              stock,
            },
          ],
          weightGrams: row.weight ? Number(row.weight) : undefined,
        })
      }

      toast.success("Đã nhập CSV vào kho nháp của shop")
      setTab("draft")
      list.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nhập CSV thất bại")
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleBulkUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!vendor.data?.vendor || saveDraftM.isPending}
            className="btn-secondary disabled:opacity-50"
          >
            <Upload size={14} />
            Nhập CSV vào kho
          </button>
          <Link to="/seller/products/new" className="btn-primary">
            <Plus size={14} />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex overflow-x-auto border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
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
                    onCloseMenu={() => setActionMenuId(null)}
                    onArchive={() => handleArchive(p.id, p.title)}
                    archiving={archiveProductM.isPending}
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
  actionMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onArchive,
  archiving,
}: {
  product: ProductDoc
  actionMenuOpen: boolean
  onToggleMenu: () => void
  onCloseMenu: () => void
  onArchive: () => void
  archiving: boolean
}) {
  const status = STATUS_BADGE[p.status]
  const isLowStock = p.totalStock > 0 && p.totalStock < 10
  const StatusIcon = status.icon

  return (
    <tr className="hover:bg-neutral-50">
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
                {p.status !== "archived" && p.status !== "pending" && (
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

  const headers = splitCsvLine(lines[0]).map((header) => header.trim())
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index]?.trim() ?? ""
      return row
    }, {})
  })
}

function splitCsvLine(line: string): string[] {
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
    } else if (char === "," && !quoted) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}
