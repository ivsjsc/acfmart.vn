import { Link, useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { useCartStore } from "../../../stores/cart-store"
import { formatCurrency } from "../../../lib/format"

export default function CartScreen() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clear = useCartStore((s) => s.clear)
  const subtotal = useCartStore((s) => s.subtotal())

  const shippingFee = items.length > 0 ? 30000 : 0
  const total = subtotal + shippingFee

  // Group items by shop
  const shopGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = []
    acc[item.shopId].push(item)
    return acc
  }, {})

  if (items.length === 0) {
    return (
      <div className="container-acf py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <ShoppingCart size={48} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-neutral-900">
            Giỏ hàng đang trống
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Bạn chưa thêm sản phẩm nào. Khám phá ngay các sản phẩm chính hãng!
          </p>
          <Link to="/" className="btn-primary mt-6 inline-flex">
            Bắt đầu mua sắm
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">
          Giỏ hàng ({items.length})
        </h1>
        <button
          onClick={() => {
            if (confirm("Xoá toàn bộ giỏ hàng?")) {
              clear()
              toast.success("Đã xoá giỏ hàng")
            }
          }}
          className="text-sm text-neutral-500 hover:text-brand-red-600"
        >
          Xoá tất cả
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Items by shop */}
        <div className="space-y-4">
          {Object.entries(shopGroups).map(([shopId, shopItems]) => (
            <div key={shopId} className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
                <span className="text-sm font-semibold text-neutral-900">
                  {shopItems[0].shopName}
                </span>
                {shopItems[0].isVerified && (
                  <span className="badge-verified">
                    <ShieldCheck size={10} /> Chính hãng
                  </span>
                )}
              </div>

              <div className="divide-y divide-neutral-100">
                {shopItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.productId}`}
                        className="line-clamp-2 text-sm font-medium text-neutral-900 hover:text-brand-red-600"
                      >
                        {item.title}
                      </Link>
                      <div className="mt-1 text-sm font-bold text-brand-red-600">
                        {formatCurrency(item.price)}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-0 rounded-lg border border-neutral-300">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                            aria-label="Giảm"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                            aria-label="Tăng"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            removeItem(item.id)
                            toast("Đã xoá khỏi giỏ hàng")
                          }}
                          className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-brand-red-600"
                          aria-label="Xoá"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tạm tính</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Phí vận chuyển</span>
                <span className="font-medium">{formatCurrency(shippingFee)}</span>
              </div>
              <div className="my-3 border-t border-neutral-200" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-xl font-extrabold text-brand-red-600">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                Bao gồm VAT (nếu có)
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary mt-5 w-full justify-center text-base"
            >
              Tiến hành thanh toán
              <ArrowRight size={16} />
            </button>

            <Link
              to="/"
              className="mt-2 block text-center text-sm text-neutral-500 hover:text-brand-red-600"
            >
              Tiếp tục mua sắm
            </Link>

            <div className="mt-5 flex items-center gap-2 rounded-lg bg-brand-gold-50 p-3 text-xs text-brand-gold-800">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Tất cả sản phẩm đã được xác thực bởi Quỹ Chống Hàng Giả VN</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
