import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  MoreVertical,
  Archive,
  Copy,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Package,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { MOCK_SELLER_PRODUCTS } from "../mock-data"
import type { SellerProduct } from "../types"

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang bán" },
  { id: "out_of_stock", label: "Hết hàng" },
  { id: "draft", label: "Nháp" },
  { id: "archived", label: "Đã ẩn" },
] as const

type TabId = (typeof TABS)[number]["id"]

const STATUS_BADGE: Record<SellerProduct["status"], { label: string; color: string }> = {
  active: { label: "Đang bán", color: "bg-emerald-100 text-emerald-700" },
  out_of_stock: { label: "Hết hàng", color: "bg-amber-100 text-amber-700" },
  draft: { label: "Nháp", color: "bg-neutral-100 text-neutral-700" },
  archived: { label: "Đã ẩn", color: "bg-rose-100 text-rose-700" },
}

export default function SellerProductsScreen() {
  const [products, setProducts] = useState(MOCK_SELLER_PRODUCTS)
  const [tab, setTab] = useState<TabId>("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = products
    if (tab !== "all") list = list.filter((p) => p.status === tab)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      )
    }
    return list
  }, [products, tab, search])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((p) => p.id)))
    }
  }

  function bulkArchive() {
    if (!confirm(`Ẩn ${selected.size} sản phẩm đã chọn?`)) return
    setProducts((prev) =>
      prev.map((p) =>
        selected.has(p.id) ? { ...p, status: "archived" as const } : p
      )
    )
    setSelected(new Set())
    toast.success(`Đã ẩn ${selected.size} sản phẩm`)
  }

  function duplicateProduct(id: string) {
    const original = products.find((p) => p.id === id)
    if (!original) return
    const copy: SellerProduct = {
      ...original,
      id: `${original.id}-copy-${Date.now()}`,
      title: `${original.title} (bản sao)`,
      handle: `${original.handle}-copy`,
      status: "draft",
      totalSold: 0,
      reviewCount: 0,
      views: 0,
      createdAt: new Date().toISOString(),
    }
    setProducts((prev) => [copy, ...prev])
    setActionMenuId(null)
    toast.success("Đã sao chép sản phẩm (lưu thành Nháp)")
  }

  function deleteProduct(id: string) {
    if (!confirm("Xoá vĩnh viễn sản phẩm này?")) return
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setActionMenuId(null)
    toast.success("Đã xoá sản phẩm")
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
        <Link to="/seller/products/new" className="btn-primary">
          <Plus size={14} />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex overflow-x-auto border-b border-neutral-200">
        {TABS.map((t) => {
          const count = t.id === "all" ? products.length : products.filter((p) => p.status === t.id).length
          return (
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
              <span className="ml-1 text-xs text-neutral-400">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, thương hiệu, SKU..."
            className="input pl-9"
          />
        </div>
        <button className="btn-secondary">
          <Filter size={14} />
          Lọc
        </button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-brand-red-50 px-3 py-2 text-sm">
          <span className="font-semibold text-brand-red-700">
            Đã chọn {selected.size} sản phẩm
          </span>
          <div className="flex gap-2">
            <button onClick={bulkArchive} className="btn-secondary text-xs">
              <Archive size={12} />
              Ẩn
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-700"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded text-brand-red-500"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-3 text-right font-medium">Giá</th>
                <th className="px-4 py-3 text-right font-medium">Kho</th>
                <th className="px-4 py-3 text-right font-medium">Đã bán</th>
                <th className="px-4 py-3 text-right font-medium">Đánh giá</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Package size={32} className="mx-auto text-neutral-300" />
                    <div className="mt-2 text-sm font-semibold">
                      Không có sản phẩm
                    </div>
                    <div className="text-xs text-neutral-500">
                      {search ? "Thử từ khoá khác" : "Thêm sản phẩm đầu tiên ngay"}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const status = STATUS_BADGE[p.status]
                  const isLowStock = p.totalStock > 0 && p.totalStock < 10
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="h-4 w-4 rounded text-brand-red-500"
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
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
                              {p.acfVerified && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-brand-gold-100 px-1 py-0.5 text-brand-gold-800">
                                  <ShieldCheck size={10} />
                                  ACF
                                </span>
                              )}
                              <span>{p.brand}</span>
                              <span>·</span>
                              <span>{p.variants > 0 ? `${p.variants} mẫu` : "Chưa có mẫu"}</span>
                            </div>
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
                          {isLowStock && (
                            <AlertTriangle size={12} className="text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{p.totalSold.toLocaleString("vi-VN")}</td>
                      <td className="px-4 py-3 text-right">
                        {p.rating > 0 ? (
                          <span>
                            ⭐ {p.rating}
                            <span className="ml-0.5 text-xs text-neutral-400">({p.reviewCount})</span>
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setActionMenuId(actionMenuId === p.id ? null : p.id)
                            }
                            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100"
                            aria-label="Hành động"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {actionMenuId === p.id && (
                            <>
                              <button
                                onClick={() => setActionMenuId(null)}
                                className="fixed inset-0 z-30"
                                aria-label="Đóng"
                              />
                              <div className="absolute right-0 z-40 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
                                <Link
                                  to={`/products/${p.handle}`}
                                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  <Eye size={12} />
                                  Xem trên store
                                </Link>
                                <Link
                                  to={`/seller/products/${p.id}`}
                                  className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50"
                                >
                                  <Pencil size={12} />
                                  Chỉnh sửa
                                </Link>
                                <button
                                  onClick={() => duplicateProduct(p.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-neutral-50"
                                >
                                  <Copy size={12} />
                                  Nhân bản
                                </button>
                                <button
                                  onClick={() => deleteProduct(p.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 size={12} />
                                  Xoá
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
