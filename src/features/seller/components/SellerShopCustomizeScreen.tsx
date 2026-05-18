import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Percent,
  Pin,
  Save,
  Ticket,
} from "lucide-react"
import toast from "react-hot-toast"
import { useSellerProducts } from "../../../hooks/use-products"
import { useMyVendor } from "../../../hooks/use-vendor"
import {
  useSaveShopProfile,
  useShopProfile,
} from "../../../hooks/use-shop-profile"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import {
  DEFAULT_SHOP_DISPLAY_CONFIG,
  SHOP_DISPLAY_MODULES,
  type ShopDisplayConfig,
  type ShopDisplayModuleId,
} from "../../../lib/shop-profile-service"

const MAX_PINNED_PRODUCTS = 8

export default function SellerShopCustomizeScreen() {
  const vendorQuery = useMyVendor()
  const vendor = vendorQuery.data?.vendor ?? null
  const shopId = vendor?.firebase_uid ?? null
  const shopProfile = useShopProfile(shopId)
  const saveProfile = useSaveShopProfile()
  const approved = useSellerProducts({ status: "approved", limit: 100 })

  const [displayConfig, setDisplayConfig] = useState<ShopDisplayConfig>(
    DEFAULT_SHOP_DISPLAY_CONFIG
  )
  const [commissionPercent, setCommissionPercent] = useState(5)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const profile = shopProfile.data
    setDisplayConfig(profile?.displayConfig ?? DEFAULT_SHOP_DISPLAY_CONFIG)
    setCommissionPercent(((profile?.affiliateCommissionBps ?? 500) / 100))
    setDirty(false)
  }, [shopProfile.data])

  const orderedModules = useMemo(() => {
    const configured = displayConfig.moduleOrder.filter((id) =>
      SHOP_DISPLAY_MODULES.some((module) => module.id === id)
    )
    const missing = SHOP_DISPLAY_MODULES.map((module) => module.id).filter(
      (id) => !configured.includes(id)
    )
    return [...configured, ...missing]
  }, [displayConfig.moduleOrder])

  const enabledSet = useMemo(
    () => new Set(displayConfig.enabledModules),
    [displayConfig.enabledModules]
  )
  const pinnedSet = useMemo(
    () => new Set(displayConfig.pinnedProductIds),
    [displayConfig.pinnedProductIds]
  )

  function patchConfig(patch: Partial<ShopDisplayConfig>) {
    setDisplayConfig((prev) => ({ ...prev, ...patch }))
    setDirty(true)
  }

  function moveModule(id: ShopDisplayModuleId, direction: -1 | 1) {
    const next = [...orderedModules]
    const index = next.indexOf(id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= next.length) return
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    patchConfig({ moduleOrder: next })
  }

  function toggleModule(id: ShopDisplayModuleId) {
    const next = new Set(displayConfig.enabledModules)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    patchConfig({ enabledModules: Array.from(next) })
  }

  function togglePinnedProduct(productId: string) {
    const next = new Set(displayConfig.pinnedProductIds)
    if (next.has(productId)) {
      next.delete(productId)
    } else {
      if (next.size >= MAX_PINNED_PRODUCTS) {
        toast.error(`Chỉ ghim tối đa ${MAX_PINNED_PRODUCTS} sản phẩm`)
        return
      }
      next.add(productId)
    }
    patchConfig({ pinnedProductIds: Array.from(next) })
  }

  async function handleSave() {
    if (!vendor || !shopId) return
    try {
      await saveProfile.mutateAsync({
        shopId,
        vendorId: vendor.id,
        shopName: vendor.shop_name,
        shopSlug: vendor.shop_slug,
        logoUrl: vendor.shop_logo,
        bannerUrl: vendor.shop_banner,
        displayConfig: {
          ...displayConfig,
          moduleOrder: orderedModules,
          pinnedProductIds: displayConfig.pinnedProductIds.slice(0, MAX_PINNED_PRODUCTS),
        },
        affiliateCommissionBps: Math.round(commissionPercent * 100),
      })
      toast.success("Đã lưu cấu hình trang trưng bày")
      setDirty(false)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không lưu được cấu hình. Vui lòng thử lại sau."))
    }
  }

  if (vendorQuery.isLoading || shopProfile.isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-neutral-500">
        <Loader2 size={16} className="mr-2 animate-spin" />
        Đang tải cấu hình shop...
      </div>
    )
  }

  if (!vendor || !shopId) {
    return (
      <div className="p-4 lg:p-8">
        <div className="card flex flex-col items-center py-16 text-center">
          <AlertCircle size={48} className="text-amber-500" />
          <h2 className="mt-3 text-lg font-bold">Chưa có hồ sơ shop</h2>
          <p className="mt-1 max-w-md text-sm text-neutral-500">
            Vui lòng hoàn tất đăng ký seller trước khi cấu hình trang trưng bày.
          </p>
        </div>
      </div>
    )
  }

  const products = approved.data?.products ?? []
  const saving = saveProfile.isPending

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-red-600">
            Trang trưng bày
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 lg:text-3xl">
            Cấu hình giao diện shop
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Sắp xếp module, chọn sản phẩm ghim, bật Flash Sale và cấu hình hoa hồng affiliate.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/seller/shop" className="btn-secondary">
            Ảnh logo/bìa
          </Link>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="btn-primary"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu cấu hình
          </button>
        </div>
      </div>

      {shopProfile.isError && (
        <div className="mb-5 card border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Chưa tải được cấu hình hiện tại. Bạn vẫn có thể lưu cấu hình mới từ mặc định.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="card overflow-hidden">
            <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                <LayoutGrid size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Bố cục và thứ tự module
                </h2>
                <p className="text-xs text-neutral-500">
                  Module đang bật sẽ hiển thị theo thứ tự bên dưới trên trang shop.
                </p>
              </div>
            </header>

            <div className="border-b border-neutral-100 p-4">
              <div className="inline-flex rounded-lg bg-neutral-100 p-1">
                {[
                  { id: "grid", label: "Lưới sản phẩm" },
                  { id: "carousel", label: "Carousel ngang" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      patchConfig({ layout: option.id as ShopDisplayConfig["layout"] })
                    }
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                      displayConfig.layout === option.id
                        ? "bg-white text-brand-red-600 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-neutral-100">
              {orderedModules.map((moduleId, index) => {
                const module = SHOP_DISPLAY_MODULES.find((item) => item.id === moduleId)
                if (!module) return null
                const enabled = enabledSet.has(moduleId)
                return (
                  <div key={moduleId} className="flex items-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleId)}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded border",
                        enabled
                          ? "border-brand-red-500 bg-brand-red-500 text-white"
                          : "border-neutral-300 text-transparent"
                      )}
                      aria-label={enabled ? "Tắt module" : "Bật module"}
                    >
                      <Check size={14} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-neutral-900">
                        {module.label}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {module.description}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <IconButton
                        title="Đưa lên"
                        disabled={index === 0}
                        onClick={() => moveModule(moduleId, -1)}
                      >
                        <ArrowUp size={14} />
                      </IconButton>
                      <IconButton
                        title="Đưa xuống"
                        disabled={index === orderedModules.length - 1}
                        onClick={() => moveModule(moduleId, 1)}
                      >
                        <ArrowDown size={14} />
                      </IconButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="card overflow-hidden">
            <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <div className="rounded-lg bg-brand-gold-50 p-2 text-brand-gold-700">
                <Pin size={18} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-neutral-900">
                  Sản phẩm ghim nổi bật
                </h2>
                <p className="text-xs text-neutral-500">
                  Chọn tối đa {MAX_PINNED_PRODUCTS} sản phẩm đã duyệt để ưu tiên hiển thị.
                </p>
              </div>
            </header>
            <div className="p-5">
              {approved.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={14} className="animate-spin" />
                  Đang tải sản phẩm đã duyệt...
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-600">
                  Shop chưa có sản phẩm được duyệt.
                  <Link
                    to="/seller/products/new"
                    className="ml-1 font-semibold text-brand-red-700 hover:underline"
                  >
                    Đăng sản phẩm mới
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {products.map((product) => {
                    const selected = pinnedSet.has(product.id)
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => togglePinnedProduct(product.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                          selected
                            ? "border-brand-red-400 bg-brand-red-50"
                            : "border-neutral-200 hover:border-brand-red-200"
                        )}
                      >
                        <div className="h-14 w-14 overflow-hidden rounded-lg bg-neutral-100">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-300">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-sm font-semibold text-neutral-900">
                            {product.title}
                          </div>
                          <div className="mt-0.5 text-xs text-neutral-500">
                            {formatCurrency(product.basePrice)} · đã bán {product.totalSold}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-brand-red-500 bg-brand-red-500 text-white"
                              : "border-neutral-300"
                          )}
                        >
                          {selected && <Check size={12} />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card overflow-hidden">
            <div className="relative aspect-[6/2] bg-gradient-to-r from-brand-red-500 to-brand-gold-500">
              {vendor.shop_banner && (
                <img
                  src={vendor.shop_banner}
                  alt={vendor.shop_name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                {vendor.shop_logo ? (
                  <img
                    src={vendor.shop_logo}
                    alt={vendor.shop_name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-red-100 font-bold text-brand-red-700">
                    {vendor.shop_name[0]?.toUpperCase() ?? "S"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-neutral-900">
                    {vendor.shop_name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {vendor.shop_slug || "Chưa có slug"}
                  </div>
                </div>
              </div>
              <Link to="/seller/shop" className="btn-secondary mt-4 w-full justify-center">
                <ImageIcon size={14} />
                Cập nhật logo/bìa
              </Link>
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Percent size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Affiliate Commission
                </h2>
                <p className="text-xs text-neutral-500">
                  Hoa hồng đề xuất cho affiliate khi quảng bá sản phẩm của shop.
                </p>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={commissionPercent}
                onChange={(event) => {
                  const next = Math.max(0, Math.min(30, Number(event.target.value)))
                  setCommissionPercent(next)
                  setDirty(true)
                }}
                className="input text-lg font-bold"
              />
              <span className="pb-2 text-sm font-semibold text-neutral-500">%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={commissionPercent}
              onChange={(event) => {
                setCommissionPercent(Number(event.target.value))
                setDirty(true)
              }}
              className="mt-4 w-full accent-red-600"
            />
            <div className="mt-2 flex justify-between text-[10px] text-neutral-500">
              <span>0%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Ticket size={16} className="text-brand-red-500" />
              <h2 className="text-sm font-bold text-neutral-900">Flash Sale</h2>
            </div>
            <p className="text-xs text-neutral-600">
              Module Flash Sale lấy dữ liệu từ voucher đang chạy hoặc đã lên lịch.
            </p>
            <Link to="/seller/vouchers" className="btn-secondary mt-4 w-full justify-center">
              Quản lý voucher
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

function IconButton({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
    >
      {children}
    </button>
  )
}

