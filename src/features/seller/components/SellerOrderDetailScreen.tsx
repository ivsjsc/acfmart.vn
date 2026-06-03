import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Truck,
  Printer,
  Copy,
  MessageSquare,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  Loader2,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '../../../lib/format';
import { cn } from '../../../lib/cn';
import { sanitizeUserError } from '../../../lib/error-utils';
import type { SellerOrderStatus } from '../types';
import { NotFound } from '../../../pages/NotFound';
import { useMyVendor } from '../../../hooks/use-vendor';
import { useAuthStore } from '../../../stores/auth-store';
import { chatService } from '../../../lib/firestore-chat';
import {
  cancelSellerOrder,
  getSellerOrderByCode,
  orderDocToSellerOrder,
  SELLER_CANCELLABLE_STATUSES,
  updateSellerOrderStatus,
  type OrderDoc,
} from '../../../lib/order-service';

const CANCEL_REASONS: { code: string; label: string }[] = [
  { code: 'out_of_stock', label: 'Hết hàng / không đủ tồn kho' },
  { code: 'customer_request', label: 'Khách yêu cầu huỷ đơn' },
  { code: 'pricing_error', label: 'Sai giá hoặc thông tin sản phẩm' },
  { code: 'cannot_contact', label: 'Không liên hệ được khách' },
  { code: 'suspected_fraud', label: 'Nghi ngờ đơn gian lận' },
  { code: 'other', label: 'Lý do khác' },
];

const CANCELLED_BY_LABELS: Record<string, string> = {
  seller: 'Người bán',
  admin: 'Quản trị viên',
  owner: 'Quản trị viên',
  moderator: 'Kiểm duyệt viên',
  customer: 'Khách hàng',
};

const STATUS_FLOW: SellerOrderStatus[] = [
  'payment_pending',
  'awaiting_confirm',
  'confirmed',
  'packed',
  'ready_pickup',
  'shipping',
  'delivered',
];

const STATUS_LABELS: Record<SellerOrderStatus, string> = {
  payment_pending: 'Chờ thanh toán',
  awaiting_confirm: 'Cần xác nhận',
  confirmed: 'Đã xác nhận',
  packed: 'Đã đóng gói',
  ready_pickup: 'Chờ lấy hàng',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
  return_requested: 'Yêu cầu trả hàng',
  returned: 'Đã trả hàng',
  refunded: 'Đã hoàn tiền',
};

export default function SellerOrderDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vendor = useMyVendor();
  const currentUser = useAuthStore((s) => s.user);
  const [orderDoc, setOrderDoc] = useState<OrderDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

  const shopId = vendor.data?.vendor?.firebase_uid;

  useEffect(() => {
    if (!id || !shopId) return;
    let cancelled = false;
    setFetching(true);
    setError(null);
    getSellerOrderByCode(id, shopId)
      .then((data) => {
        if (!cancelled) setOrderDoc(data);
      })
      .catch((err) => {
        if (!cancelled) setError(sanitizeUserError(err, 'Không tải được đơn hàng.'));
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, shopId]);

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Link
          to="/seller/orders"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={14} />
          Quay lại danh sách
        </Link>
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  if (!orderDoc) return <NotFound />;

  const order = orderDocToSellerOrder(orderDoc);

  const currentIndex = STATUS_FLOW.indexOf(order.status as any);
  const canCancel = SELLER_CANCELLABLE_STATUSES.includes(order.status);
  const isReturn = order.status === 'return_requested';
  const refundStatus = String(orderDoc?.paymentRefundStatus ?? '').toLowerCase();
  const refundStatusLabel =
    refundStatus === 'completed'
      ? 'Đã hoàn tiền'
      : refundStatus === 'processing'
        ? 'Đang xử lý hoàn tiền'
        : refundStatus === 'failed'
          ? 'Hoàn tiền thất bại'
          : refundStatus
            ? 'Đang chờ hoàn tiền'
            : '';

  async function advance(next: SellerOrderStatus, successMsg: string) {
    if (!currentUser) return;
    setLoading(true);
    try {
      await updateSellerOrderStatus(
        orderDoc.id,
        next,
        {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        },
        STATUS_LABELS[next]
      );
      setOrderDoc((prev) => (prev ? { ...prev, status: next } : prev));
      toast.success(successMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCancel(reason: string, reasonCode: string) {
    if (!currentUser || !orderDoc) return;
    setLoading(true);
    try {
      await cancelSellerOrder(
        orderDoc.id,
        { reason, reasonCode },
        {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        }
      );
      setOrderDoc((prev) =>
        prev
          ? {
              ...prev,
              status: 'cancelled',
              cancelReason: reason,
              cancelReasonCode: reasonCode,
              cancelledBy: currentUser.role || 'seller',
            }
          : prev
      );
      setShowCancel(false);
      toast.success('Đã huỷ đơn hàng');
    } catch (err) {
      toast.error(sanitizeUserError(err, 'Không huỷ được đơn hàng. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  async function openCustomerChat() {
    if (!orderDoc || !shopId) return;
    setOpeningChat(true);
    try {
      const conversationId = await chatService.getOrCreateConversation({
        userId: orderDoc.customerId,
        userName: orderDoc.customerName,
        partyId: shopId,
        type: 'shop',
        partyName: vendor.data?.vendor?.shop_name ?? orderDoc.shopName,
        partyAvatar: vendor.data?.vendor?.shop_logo ?? undefined,
        contextType: 'order',
        contextId: orderDoc.code,
        contextLabel: `Đơn ${orderDoc.code}`,
        contextImage: orderDoc.items[0]?.image,
      });
      navigate(`/seller/chat?conversation=${encodeURIComponent(conversationId)}`);
    } catch (err) {
      toast.error(sanitizeUserError(err, 'Không mở được hội thoại với khách.'));
    } finally {
      setOpeningChat(false);
    }
  }

  async function approveReturn() {
    if (!confirm('Phê duyệt yêu cầu trả hàng của khách?')) return;
    await advance('returned', 'Đã phê duyệt trả hàng – đang chờ khách gửi lại');
  }

  function copyCode() {
    navigator.clipboard.writeText(order!.code);
    toast.success('Đã sao chép mã đơn');
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="p-4 lg:p-6">
      <Link
        to="/seller/orders"
        className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-red-600"
      >
        <ArrowLeft size={14} />
        Quay lại danh sách
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-extrabold text-neutral-900 lg:text-3xl">
              {order.code}
            </h1>
            <button
              onClick={copyCode}
              className="rounded p-1 hover:bg-neutral-100"
              aria-label="Sao chép"
            >
              <Copy size={14} />
            </button>
          </div>
          <p className="mt-1 text-sm text-neutral-600">Đặt {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary">
            <Printer size={14} />
            In phiếu
          </button>
          <button onClick={openCustomerChat} disabled={openingChat} className="btn-secondary">
            {openingChat ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MessageSquare size={14} />
            )}
            Chat khách
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Status timeline */}
          {!['cancelled', 'return_requested', 'returned'].includes(order.status) && (
            <section className="card p-5">
              <h2 className="mb-4 text-base font-bold">Tiến trình</h2>
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 right-0 top-3 h-0.5 bg-neutral-200" />
                <div
                  className="absolute left-0 top-3 h-0.5 bg-emerald-500 transition-all"
                  style={{
                    width:
                      currentIndex >= 0
                        ? `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`
                        : '0%',
                  }}
                />
                {STATUS_FLOW.map((s, i) => {
                  const done = i <= currentIndex;
                  const active = i === currentIndex;
                  return (
                    <div key={s} className="relative flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          'z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                          done ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-500',
                          active && 'ring-4 ring-emerald-100'
                        )}
                      >
                        {done ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <span className="text-[10px] font-bold">{i + 1}</span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] text-center max-w-[70px]',
                          done ? 'font-semibold text-neutral-900' : 'text-neutral-500'
                        )}
                      >
                        {STATUS_LABELS[s]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Return notice */}
          {isReturn && (
            <section className="card border-rose-200 bg-rose-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-rose-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-rose-900">Khách yêu cầu trả hàng</h3>
                  <p className="mt-1 text-sm text-rose-800">{order.returnReason}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={approveReturn}
                      disabled={loading}
                      className="btn-primary bg-rose-600 hover:bg-rose-700 text-xs"
                    >
                      Phê duyệt
                    </button>
                    <button className="btn-secondary text-xs">Từ chối + Phản hồi</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Cancelled notice */}
          {order.status === 'cancelled' && (
            <section className="card border-rose-200 bg-rose-50 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="text-rose-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-rose-900">Đơn hàng đã huỷ</h3>
                  {orderDoc.cancelReason && (
                    <p className="mt-1 text-sm text-rose-800">
                      <strong>Lý do:</strong> {orderDoc.cancelReason}
                    </p>
                  )}
                  {orderDoc.cancelledBy && (
                    <p className="mt-1 text-xs text-rose-700">
                      Huỷ bởi: {CANCELLED_BY_LABELS[orderDoc.cancelledBy] ?? orderDoc.cancelledBy}
                    </p>
                  )}
                  {order.paymentStatus === 'paid' && (
                    <p className="mt-2 text-xs leading-5 text-rose-700">
                      Đơn đã thanh toán — hệ thống sẽ điều phối hoàn tiền cho khách qua ledger nội
                      bộ.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Items */}
          <section className="card p-5">
            <h2 className="mb-3 text-base font-bold">Sản phẩm ({order.items.length})</h2>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.variantId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/seller/products/${item.productId}`}
                      className="line-clamp-2 text-sm font-medium text-neutral-900 hover:text-brand-red-600"
                    >
                      {item.title}
                    </Link>
                    <div className="text-[11px] text-neutral-500">
                      SKU: <code className="font-mono">{item.sku}</code>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs">
                        x{item.quantity} × {formatCurrency(item.price)}
                      </span>
                      <span className="text-sm font-semibold text-brand-red-600">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {order.customerNote && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <span>
                  <strong>Ghi chú khách:</strong> {order.customerNote}
                </span>
              </div>
            )}
          </section>

          {/* Shipping info */}
          <section className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
              <Truck size={16} className="text-brand-red-500" />
              {order.requiresShipping ? 'Vận chuyển' : 'Kích hoạt dịch vụ'}
            </h2>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-neutral-500">
                  {order.requiresShipping ? 'Đơn vị' : 'Hình thức'}
                </div>
                <div className="font-medium">
                  {order.shippingProviderName ?? order.shippingMethod}
                </div>
                {order.shippingServiceCode && (
                  <div className="text-xs text-neutral-500">
                    Mã dịch vụ: {order.shippingServiceCode}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-neutral-500">
                  {order.requiresShipping ? 'Phí ship' : 'Phí vận chuyển'}
                </div>
                <div className="font-medium">
                  {order.requiresShipping ? formatCurrency(order.shippingFee) : 'Không áp dụng'}
                </div>
              </div>
              {order.trackingNumber && (
                <div className="md:col-span-2">
                  <div className="text-xs text-neutral-500">Mã vận đơn</div>
                  <div className="flex items-center gap-2 font-mono font-medium">
                    {order.trackingNumber}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(order.trackingNumber!);
                        toast.success('Đã sao chép');
                      }}
                      className="rounded p-0.5 hover:bg-neutral-100"
                    >
                      <Copy size={11} />
                    </button>
                    <Link
                      to={`/account/track?tracking=${order.trackingNumber}${order.shippingProviderId ? `&provider=${order.shippingProviderId}` : ''}`}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 hover:border-brand-red-300 hover:text-brand-red-700"
                    >
                      <Navigation size={11} />
                      Theo dõi
                    </Link>
                  </div>
                  {order.shippingStatusText && (
                    <div className="mt-1 text-xs text-neutral-500">
                      Trạng thái GHTK: {order.shippingStatusText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {(isReturn ||
            order.status === 'returned' ||
            order.status === 'refunded' ||
            refundStatus) && (
            <section className="card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                <RefreshCw size={16} className="text-brand-red-500" />
                Trả hàng / hoàn tiền
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-neutral-500">Trạng thái:</span>
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
                    {order.status === 'return_requested'
                      ? 'Đang chờ trả hàng'
                      : order.status === 'returned'
                        ? 'Đã trả hàng'
                        : order.status === 'refunded'
                          ? 'Đã hoàn tiền'
                          : 'Có yêu cầu trả hàng'}
                  </span>
                  {refundStatusLabel && (
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                      {refundStatusLabel}
                    </span>
                  )}
                </div>
                {orderDoc?.returnRequestId && (
                  <div className="text-neutral-700">
                    Mã yêu cầu:{' '}
                    <span className="font-mono font-semibold">{orderDoc.returnRequestId}</span>
                  </div>
                )}
                {orderDoc?.paymentRefundAmount != null && (
                  <div className="text-neutral-700">
                    Số tiền hoàn: <strong>{formatCurrency(orderDoc.paymentRefundAmount)}</strong>
                  </div>
                )}
                {orderDoc?.paymentRefundReason && (
                  <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
                    <strong>Lý do:</strong> {orderDoc.paymentRefundReason}
                  </div>
                )}
                <p className="text-xs leading-6 text-neutral-500">
                  Trạng thái trả hàng và hoàn tiền được điều phối từ ledger nội bộ. Nếu cần hoàn
                  tiền qua cổng thanh toán, trạng thái sẽ được cập nhật sau webhook backend.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Action buttons */}
          <div className="card p-5">
            <h3 className="mb-3 text-base font-bold">Hành động</h3>
            <div className="space-y-2">
              {order.status === 'payment_pending' && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  Đơn đang chờ khách thanh toán ({order.paymentMethod}). Bạn có thể nhắn tin nhắc
                  khách hoàn tất thanh toán hoặc báo huỷ đơn nếu cần.
                </div>
              )}

              {order.status === 'awaiting_confirm' && order.requiresShipping && (
                <button
                  onClick={() => advance('confirmed', 'Đã xác nhận đơn hàng')}
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Xác nhận đơn
                </button>
              )}

              {order.status === 'awaiting_confirm' && !order.requiresShipping && (
                <button
                  onClick={() => advance('completed', 'Đã kích hoạt dịch vụ')}
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Xác nhận đã kích hoạt
                </button>
              )}

              {order.status === 'confirmed' && order.requiresShipping && (
                <button
                  onClick={() => advance('packed', 'Đã đánh dấu đã đóng gói')}
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
                  Đã đóng gói xong
                </button>
              )}

              {order.status === 'packed' && order.requiresShipping && (
                <button
                  onClick={() => advance('ready_pickup', 'Chờ đơn vị vận chuyển lấy hàng')}
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                  Sẵn sàng bàn giao
                </button>
              )}

              <button
                onClick={openCustomerChat}
                disabled={openingChat}
                className="btn-secondary w-full justify-center"
              >
                {openingChat ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <MessageSquare size={14} />
                )}
                Nhắn tin cho khách
              </button>

              {canCancel && (
                <button
                  onClick={() => setShowCancel(true)}
                  disabled={loading}
                  className="btn-secondary w-full justify-center text-rose-600"
                >
                  <XCircle size={14} />
                  {order.status === 'awaiting_confirm' ? 'Từ chối / Báo huỷ đơn' : 'Báo huỷ đơn'}
                </button>
              )}
            </div>
          </div>

          {/* Customer */}
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
              <MapPin size={16} className="text-brand-red-500" />
              {order.requiresShipping ? 'Khách hàng' : 'Thông tin kích hoạt'}
            </h3>
            <div className="text-sm leading-relaxed">
              <div className="font-semibold">{order.shippingAddress.name}</div>
              <div className="flex items-center gap-1 text-neutral-600">
                <Phone size={11} /> {order.shippingAddress.phone}
              </div>
              {order.requiresShipping ? (
                <div className="mt-2 text-neutral-700">
                  {order.shippingAddress.address}, {order.shippingAddress.ward},{' '}
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                </div>
              ) : (
                <div className="mt-2 rounded-lg bg-sky-50 p-3 text-sky-700">
                  Không có địa chỉ giao hàng. Vui lòng kích hoạt hoặc bàn giao quyền truy cập dịch
                  vụ qua kênh liên hệ với khách.
                </div>
              )}
            </div>
          </div>

          {order.requiresShipping && order.shippingOrigin && (
            <div className="card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
                <Truck size={16} className="text-brand-red-500" />
                Kho xuất hàng
              </h3>
              <div className="text-sm leading-relaxed">
                <div className="font-semibold">{order.shippingOrigin.warehouseName}</div>
                <div className="text-neutral-600">
                  {order.shippingOrigin.contactName} · {order.shippingOrigin.contactPhone}
                </div>
                <div className="mt-1 text-neutral-700">{order.shippingOrigin.routeLabel}</div>
                {order.shippingOrigin.distanceKm != null && (
                  <div className="mt-1 text-xs text-neutral-500">
                    Khoảng cách ước tính: {order.shippingOrigin.distanceKm.toFixed(1)} km
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="card p-5">
            <h3 className="mb-3 text-base font-bold">Thanh toán</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Vận chuyển</span>
                <span>
                  {order.requiresShipping ? formatCurrency(order.shippingFee) : 'Không áp dụng'}
                </span>
              </div>
              <div className="my-2 border-t border-neutral-200" />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Tổng</span>
                <span className="text-xl font-extrabold text-brand-red-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                {order.paymentMethod}{' '}
                {order.paymentStatus === 'paid' && (
                  <span className="ml-1 text-emerald-600">✓ Đã thanh toán</span>
                )}
                {order.paymentStatus === 'cod' && (
                  <span className="ml-1 text-amber-600">⏳ Thu COD khi giao</span>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showCancel && (
        <CancelOrderModal
          orderCode={order.code}
          isPaid={order.paymentStatus === 'paid'}
          loading={loading}
          onClose={() => setShowCancel(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}

interface CancelOrderModalProps {
  orderCode: string;
  isPaid: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string, reasonCode: string) => void;
}

function CancelOrderModal({
  orderCode,
  isPaid,
  loading,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const [code, setCode] = useState(CANCEL_REASONS[0].code);
  const [detail, setDetail] = useState('');

  const selected = CANCEL_REASONS.find((r) => r.code === code) ?? CANCEL_REASONS[0];
  const requiresDetail = code === 'other';
  const trimmedDetail = detail.trim();
  const canSubmit = !loading && (!requiresDetail || trimmedDetail.length > 0);

  function handleSubmit() {
    const reason = requiresDetail
      ? trimmedDetail
      : trimmedDetail
        ? `${selected.label} – ${trimmedDetail}`
        : selected.label;
    onConfirm(reason, code);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-neutral-900">
              <XCircle size={18} className="text-rose-600" />
              Báo huỷ đơn {orderCode}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Chọn lý do huỷ. Lý do sẽ được lưu vào lịch sử đơn và gửi tới khách hàng.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100"
            aria-label="Đóng"
          >
            <XCircle size={18} />
          </button>
        </div>

        {isPaid && (
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Đơn đã được thanh toán. Sau khi huỷ, hệ thống sẽ điều phối hoàn tiền cho khách.
            </span>
          </div>
        )}

        <div className="space-y-2">
          {CANCEL_REASONS.map((reason) => (
            <label
              key={reason.code}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors',
                code === reason.code
                  ? 'border-brand-red-400 bg-brand-red-50 text-neutral-900'
                  : 'border-neutral-200 hover:bg-neutral-50'
              )}
            >
              <input
                type="radio"
                name="cancel-reason"
                value={reason.code}
                checked={code === reason.code}
                onChange={() => setCode(reason.code)}
                className="accent-brand-red-500"
              />
              {reason.label}
            </label>
          ))}
        </div>

        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={
            requiresDetail
              ? 'Nhập lý do huỷ cụ thể (bắt buộc)...'
              : 'Ghi chú thêm cho khách (không bắt buộc)...'
          }
          className="input mt-3 resize-none text-sm"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} disabled={loading} className="btn-secondary text-sm">
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary bg-rose-600 text-sm hover:bg-rose-700"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Xác nhận huỷ đơn
          </button>
        </div>
      </div>
    </div>
  );
}
