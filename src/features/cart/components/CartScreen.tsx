import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { cartItemRequiresShipping, useCartStore } from '../../../stores/cart-store';
import { formatCurrency } from '../../../lib/format';

export default function CartScreen() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const removeItems = useCartStore((s) => s.removeItems);
  const selectedIds = useCartStore((s) => s.selectedIds);
  const toggleSelected = useCartStore((s) => s.toggleSelected);
  const selectItems = useCartStore((s) => s.selectItems);
  const unselectItems = useCartStore((s) => s.unselectItems);
  const selectShop = useCartStore((s) => s.selectShop);
  const unselectShop = useCartStore((s) => s.unselectShop);
  const clearSelection = useCartStore((s) => s.clearSelection);
  const clear = useCartStore((s) => s.clear);
  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const selectedItems = useMemo(() => {
    const idSet = new Set(selectedIds);
    return items.filter((item) => idSet.has(item.id));
  }, [items, selectedIds]);
  const subtotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [selectedItems]
  );

  const selectedUnits = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedIdSet = new Set(selectedIds);
  const allVisibleSelected = items.length > 0 && items.every((item) => selectedIdSet.has(item.id));
  const hasShippableSelection = selectedItems.some(cartItemRequiresShipping);
  const shippingFee = hasShippableSelection ? 30000 : 0;
  const total = subtotal + shippingFee;

  // Group items by shop
  const shopGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  function handleUpdateQuantity(id: string, quantity: number) {
    const result = updateQuantity(id, quantity);
    if (!result.ok && result.message) {
      toast.error(result.message);
    }
  }

  function handleSelectAll() {
    selectItems(items.map((item) => item.id));
  }

  function handleUnselectAll() {
    clearSelection();
  }

  function handleRemoveSelected() {
    if (selectedIds.length === 0) {
      toast.error('Chưa chọn sản phẩm cần xóa.');
      return;
    }
    if (!confirm(`Xóa ${selectedIds.length} món đã chọn khỏi giỏ hàng?`)) return;
    removeItems(selectedIds);
    toast.success('Đã xóa sản phẩm đã chọn');
  }

  function handleCheckout() {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.');
      return;
    }
    navigate('/checkout');
  }

  if (items.length === 0) {
    return (
      <div className="container-acf py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <ShoppingCart size={48} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-neutral-900">Giỏ hàng đang trống</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Bạn chưa thêm sản phẩm nào. Khám phá ngay các sản phẩm chính hãng!
          </p>
          <Link to="/" className="btn-primary mt-6 inline-flex">
            Bắt đầu mua sắm
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Giỏ hàng ({items.length})</h1>
        <button
          onClick={() => {
            if (confirm('Xoá toàn bộ giỏ hàng?')) {
              clear();
              toast.success('Đã xoá giỏ hàng');
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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="inline-flex items-center gap-2 font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={allVisibleSelected ? handleUnselectAll : handleSelectAll}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-red-600 focus:ring-brand-red-500"
                />
                {allVisibleSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </label>
              <button
                onClick={handleUnselectAll}
                disabled={selectedIds.length === 0}
                className="text-neutral-500 hover:text-brand-red-600 disabled:opacity-50"
              >
                Bỏ chọn
              </button>
              <span className="text-neutral-500">
                Đã chọn <strong className="text-neutral-900">{selectedItems.length}</strong> món,{' '}
                <strong className="text-neutral-900">{selectedUnits}</strong> sản phẩm
              </span>
              <span className="text-xs text-neutral-400">Giỏ hàng {totalItems}/100 sản phẩm</span>
            </div>
            <button
              onClick={handleRemoveSelected}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 size={14} />
              Xóa đã chọn
            </button>
          </div>

          {Object.entries(shopGroups).map(([shopId, shopItems]) => (
            <div key={shopId} className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
                <label className="inline-flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shopItems.every((item) => selectedIdSet.has(item.id))}
                    onChange={(event) => {
                      if (event.target.checked) {
                        selectShop(shopId);
                      } else {
                        unselectShop(shopId);
                      }
                    }}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-red-600 focus:ring-brand-red-500"
                  />
                  <span className="truncate text-sm font-semibold text-neutral-900">
                    {shopItems[0].shopName}
                  </span>
                  {shopItems[0].isVerified && (
                    <span className="badge-verified">
                      <ShieldCheck size={10} /> Chính hãng
                    </span>
                  )}
                </label>
                <span className="shrink-0 text-xs text-neutral-500">
                  {shopItems.filter((item) => selectedIdSet.has(item.id)).length}/{shopItems.length}{' '}
                  món đã chọn
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {shopItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4">
                    <input
                      type="checkbox"
                      checked={selectedIdSet.has(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      aria-label={`Chọn ${item.title}`}
                      className="mt-8 h-4 w-4 rounded border-neutral-300 text-brand-red-600 focus:ring-brand-red-500"
                    />
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
                      {!cartItemRequiresShipping(item) && (
                        <div className="mt-1 inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                          Không cần vận chuyển
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-0 rounded-lg border border-neutral-300">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                            aria-label="Giảm"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                            aria-label="Tăng"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast('Đã xoá khỏi giỏ hàng');
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
            <h2 className="mb-4 text-lg font-bold text-neutral-900">Tóm tắt đơn hàng</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tạm tính đã chọn</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Phí vận chuyển</span>
                <span className="font-medium">
                  {selectedItems.length > 0 && !hasShippableSelection
                    ? 'Không áp dụng'
                    : formatCurrency(shippingFee)}
                </span>
              </div>
              <div className="my-3 border-t border-neutral-200" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-xl font-extrabold text-brand-red-600">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                {selectedItems.length > 0
                  ? `Bao gồm ${selectedItems.length} món đã chọn, VAT nếu có`
                  : 'Chọn sản phẩm để tính thanh toán'}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="btn-primary mt-5 w-full justify-center text-base disabled:opacity-50"
            >
              Thanh toán sản phẩm đã chọn
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
  );
}
