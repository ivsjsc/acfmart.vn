import { Link } from "react-router-dom"
import {
  Image as ImageIcon,
  Pin,
  Tag,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { useSellerProducts } from "../../../hooks/use-products"
import { formatCurrency } from "../../../lib/format"

/**
 * Skeleton screen for "Quản lý trang trí trang trưng bày".
 *
 * Today this is intentionally lightweight: it surfaces the seller's approved
 * catalog and stubs four customisation modules. Full drag-and-drop sorting,
 * promotion scheduling and theme builder will arrive in follow-up PRs.
 */
export default function SellerShopCustomizeScreen() {
  const approved = useSellerProducts({ status: "approved" })

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-red-600">
            Trang trí trang trưng bày
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 lg:text-3xl">
            Cấu hình giao diện shop
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Sắp xếp module hiển thị, ghim sản phẩm nổi bật và đặt lịch khuyến
            mãi cho trang trưng bày.
          </p>
        </div>
        <Link to="/seller/shop" className="btn-secondary">
          Quay lại thông tin shop
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Module 1 — Banner & ảnh bìa */}
          <section className="card overflow-hidden">
            <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                <ImageIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Ảnh bìa & banner trang trưng bày
                </h2>
                <p className="text-xs text-neutral-500">
                  Tỉ lệ 6:1, ảnh chính hãng do shop sở hữu. Banner sẽ hiển thị
                  trên đầu trang shop.
                </p>
              </div>
            </header>
            <div className="p-5 text-sm text-neutral-700">
              <p>
                Cấu hình ảnh bìa, slogan và CTA trong{" "}
                <Link
                  to="/seller/shop"
                  className="font-semibold text-brand-red-700 hover:underline"
                >
                  Thông tin shop
                </Link>{" "}
                — phần "Ảnh banner shop".
              </p>
            </div>
          </section>

          {/* Module 2 — Sản phẩm ghim nổi bật */}
          <section className="card overflow-hidden">
            <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <div className="rounded-lg bg-brand-gold-50 p-2 text-brand-gold-700">
                <Pin size={18} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-neutral-900">
                  Ghim sản phẩm nổi bật
                </h2>
                <p className="text-xs text-neutral-500">
                  Lựa chọn các sản phẩm đã được kiểm duyệt để hiển thị đầu
                  trang trưng bày.
                </p>
              </div>
            </header>
            <div className="p-5">
              {approved.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={14} className="animate-spin" /> Đang tải sản
                  phẩm đã duyệt...
                </div>
              ) : (approved.data?.count ?? 0) === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-600">
                  Shop chưa có sản phẩm nào được duyệt.
                  <Link
                    to="/seller/products/new"
                    className="ml-1 font-semibold text-brand-red-700 hover:underline"
                  >
                    Đăng sản phẩm mới
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {approved.data?.products.slice(0, 8).map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-neutral-100">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                      <div className="flex-1">
                        <div className="line-clamp-1 text-sm font-medium text-neutral-900">
                          {product.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatCurrency(product.basePrice ?? 0)}
                        </div>
                      </div>
                      <label className="inline-flex cursor-not-allowed items-center gap-2 text-xs text-neutral-400">
                        <input
                          type="checkbox"
                          disabled
                          className="rounded border-neutral-300"
                        />
                        Ghim (sắp ra)
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-neutral-400">
                Lưu sắp xếp ghim sẽ sẵn sàng ở phiên bản tiếp theo.
              </p>
            </div>
          </section>

          {/* Module 3 — Khuyến mãi */}
          <section className="card overflow-hidden">
            <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <Tag size={18} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-neutral-900">
                  Khuyến mãi & Flash sale của shop
                </h2>
                <p className="text-xs text-neutral-500">
                  Đặt khung giờ giảm giá hiển thị trên trang trưng bày.
                </p>
              </div>
              <Link to="/seller/marketing" className="btn-secondary text-xs">
                Mở Marketing
              </Link>
            </header>
            <div className="p-5 text-sm text-neutral-700">
              <p>
                Tạo voucher, mã khuyến mãi và combo trong tab Marketing. Khi
                bật, các chương trình hợp lệ sẽ tự động hiện banner trên trang
                trưng bày.
              </p>
            </div>
          </section>

          {/* Module 4 — Layout module */}
          <section className="card overflow-hidden">
            <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                <LayoutGrid size={18} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-neutral-900">
                  Module hiển thị
                </h2>
                <p className="text-xs text-neutral-500">
                  Bật / tắt các khối nội dung trên trang trưng bày.
                </p>
              </div>
            </header>
            <ul className="divide-y divide-neutral-100 text-sm">
              {[
                { name: "Banner chính", enabled: true },
                { name: "Sản phẩm ghim nổi bật", enabled: true },
                { name: "Theo danh mục", enabled: true },
                { name: "Flash sale", enabled: false },
                { name: "Thương hiệu & câu chuyện shop", enabled: false },
                { name: "Đánh giá khách hàng", enabled: true },
              ].map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <span className="font-medium text-neutral-800">
                    {item.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.enabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {item.enabled ? "Đang bật" : "Đang tắt"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-neutral-100 p-4 text-[11px] text-neutral-400">
              Tuỳ chỉnh chi tiết từng module sẽ sẵn sàng ở phiên bản tiếp theo.
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card bg-gradient-to-br from-brand-red-50 to-brand-gold-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-white p-2 text-brand-gold-600 shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Gợi ý từ Aivy
                </h3>
                <p className="mt-1 text-xs text-neutral-700">
                  Hỏi Aivy gợi ý slogan, ảnh bìa và cách sắp xếp sản phẩm để
                  tăng tỉ lệ chuyển đổi cho trang trưng bày.
                </p>
                <Link
                  to="/aivy?topic=seller-shop"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-red-700 hover:underline"
                >
                  Chat với Aivy <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-neutral-900">Checklist</h3>
            <ul className="mt-2 space-y-1 text-xs text-neutral-600">
              <li>• Ảnh bìa ≥ 1920×400, không chứa watermark khác.</li>
              <li>• Mỗi danh mục có tối thiểu 4 sản phẩm chính hãng.</li>
              <li>• Voucher khuyến mãi đã được kích hoạt.</li>
              <li>• Mô tả shop ngắn gọn, có giấy phép kinh doanh.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
