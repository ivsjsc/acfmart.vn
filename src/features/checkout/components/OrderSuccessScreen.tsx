import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Home,
  FileText,
  ShieldCheck,
  Truck,
  Navigation,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '../../../lib/format';
import { sanitizeUserError } from '../../../lib/error-utils';
import {
  ShippingService,
  type ShippingAddress,
  type ShippingRate,
} from '../../../lib/shipping-service';
import { registerShipment } from '../../../lib/shipment-sync';
import { useAuthStore } from '../../../stores/auth-store';
import { type ShippingOriginPayload } from '../../../lib/warehouse-routing';

interface LocationState {
  orderCode?: string;
  total?: number;
  paymentMethod?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  shippingProviderId?: string;
  requiresShipping?: boolean;
}

interface PendingCheckoutState {
  orderCode?: string;
  items?: Array<{ title: string; price: number; quantity: number }>;
  subtotal?: number;
  total?: number;
  paymentMethod?: string;
  name?: string;
  phone?: string;
  note?: string;
  selectedRate?: ShippingRate;
  requiresShipping?: boolean;
  shippingOrigin?: ShippingOriginPayload;
  address?: {
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };
}

const PICKUP_ADDRESS = {
  name: 'Kho xác thực',
  phone: '19001234',
  address: 'Kho xác thực',
  ward: 'Phuong 12',
  district: 'Tan Binh',
  city: 'TP. Ho Chi Minh',
};

function shippingOriginToAddress(origin: ShippingOriginPayload): ShippingAddress {
  return {
    name: origin.contactName,
    phone: origin.contactPhone,
    address: origin.fullAddress,
    ward: origin.ward,
    district: origin.district,
    city: origin.city,
    latitude: origin.latitude ?? undefined,
    longitude: origin.longitude ?? undefined,
  };
}

export default function OrderSuccessScreen() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state: LocationState | null };
  const currentUser = useAuthStore((s) => s.user);
  const [trackingNumber, setTrackingNumber] = useState(state?.trackingNumber ?? '');
  const [shippingMethod, setShippingMethod] = useState(state?.shippingMethod ?? '');
  const [shippingProviderId, setShippingProviderId] = useState(state?.shippingProviderId ?? '');
  const [shippingOriginRoute, setShippingOriginRoute] = useState('');
  const [requiresShipping, setRequiresShipping] = useState(state?.requiresShipping !== false);
  const [loadingShipment, setLoadingShipment] = useState(false);
  const [shipmentError, setShipmentError] = useState<string | null>(null);
  const code = id ?? state?.orderCode ?? 'ACFXXXXXXXXXX';
  const trackingToShow = trackingNumber || state?.trackingNumber || '';

  useEffect(() => {
    if (trackingToShow || !id || !currentUser) return;

    const raw = localStorage.getItem(`pendingCheckout:${code}`);
    if (!raw) return;

    let cancelled = false;

    async function createPendingShipment() {
      setLoadingShipment(true);
      setShipmentError(null);

      try {
        const pending = JSON.parse(raw) as PendingCheckoutState;
        if (!pending.selectedRate || !pending.address) {
          throw new Error('Thiếu dữ liệu vận chuyển tạm lưu');
        }
        if (pending.requiresShipping === false || pending.selectedRate.providerId === 'internal') {
          if (!cancelled) setRequiresShipping(false);
          localStorage.removeItem(`pendingCheckout:${code}`);
          return;
        }

        const origin = pending.shippingOrigin ?? {
          warehouseId: 'fallback',
          warehouseName: 'Kho xác thực',
          contactName: PICKUP_ADDRESS.name,
          contactPhone: PICKUP_ADDRESS.phone,
          fullAddress: PICKUP_ADDRESS.address,
          ward: PICKUP_ADDRESS.ward,
          district: PICKUP_ADDRESS.district,
          city: PICKUP_ADDRESS.city,
          latitude: null,
          longitude: null,
          routeLabel: 'Kho xác thực · Tan Binh, TP. Ho Chi Minh',
          distanceKm: null,
          selectionReason: 'default' as const,
        };

        const shippingResult = await ShippingService.createShippingOrder(
          pending.selectedRate,
          shippingOriginToAddress(origin),
          pending.address,
          (pending.items ?? []).map((item) => ({
            name: item.title,
            weight: 200,
            value: item.price,
            quantity: item.quantity,
          })),
          pending.paymentMethod === 'cod',
          pending.note
        );

        if (!shippingResult.success || !shippingResult.trackingNumber) {
          throw new Error(shippingResult.error || 'Tạo vận đơn thất bại');
        }

        await registerShipment({
          orderCode: pending.orderCode || code,
          trackingNumber: shippingResult.trackingNumber,
          providerId: pending.selectedRate.providerId ?? 'ghtk',
          providerName: pending.selectedRate.provider,
          serviceCode: pending.selectedRate.serviceCode,
          fee: pending.selectedRate.price,
          pickupDate: shippingResult.success ? undefined : undefined,
          estimatedDeliveryDate: undefined,
          labelUrl: undefined,
          paymentStatus: pending.paymentMethod === 'cod' ? 'cod' : 'paid',
          statusCode: 2,
          statusText: 'Đã tạo vận đơn',
          note: pending.note,
        });

        if (!cancelled) {
          setTrackingNumber(shippingResult.trackingNumber);
          setShippingMethod(pending.selectedRate.serviceName);
          setShippingProviderId(pending.selectedRate.providerId ?? 'ghtk');
          setShippingOriginRoute(origin.routeLabel);
          localStorage.removeItem(`pendingCheckout:${code}`);
        }
      } catch (error) {
        if (!cancelled) {
          setShipmentError(
            sanitizeUserError(
              error,
              'Đơn đã tạo nhưng chưa đồng bộ được vận đơn. Bạn có thể kiểm tra lại trong mục đơn hàng.'
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingShipment(false);
        }
      }
    }

    void createPendingShipment();
    return () => {
      cancelled = true;
    };
  }, [code, currentUser, id, trackingToShow]);

  // Determine payment method display text
  const getPaymentMethodDisplay = (method?: string) => {
    switch (method) {
      case 'vnpay':
        return 'VNPay';
      case 'momo':
        return 'MoMo';
      case 'zalopay':
        return 'ZaloPay';
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      case 'wallet':
        return 'Ví mua sắm';
      default:
        return method || 'Không xác định';
    }
  };

  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Success header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-neutral-900">Đặt hàng thành công!</h1>
          <p className="mt-2 text-base text-neutral-600">
            Cảm ơn bạn đã tin tưởng hệ sinh thái hàng chính hãng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Order info */}
        <div className="card mt-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs text-neutral-500">Mã đơn hàng</div>
              <div className="mt-1 text-lg font-bold text-brand-red-600">{code}</div>
            </div>
            {state?.total && (
              <div>
                <div className="text-xs text-neutral-500">Tổng thanh toán</div>
                <div className="mt-1 text-lg font-bold text-neutral-900">
                  {formatCurrency(state.total)}
                </div>
              </div>
            )}
            {state?.paymentMethod && (
              <div>
                <div className="text-xs text-neutral-500">Phương thức</div>
                <div className="mt-1 text-sm font-medium uppercase text-neutral-900">
                  {getPaymentMethodDisplay(state.paymentMethod)}
                </div>
              </div>
            )}
            {(shippingMethod || state?.shippingMethod) && (
              <div>
                <div className="text-xs text-neutral-500">Vận chuyển</div>
                <div className="mt-1 text-sm font-medium text-neutral-900">
                  {shippingMethod || state?.shippingMethod}
                </div>
              </div>
            )}
            {(shippingOriginRoute || state?.shippingMethod) && requiresShipping && (
              <div className="sm:col-span-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
                <div className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                  Tuyến kho
                </div>
                <div className="mt-1">
                  {shippingOriginRoute || 'Kho xác thực · Tan Binh, TP. Ho Chi Minh'}
                </div>
              </div>
            )}
            {trackingToShow && (
              <div>
                <div className="text-xs text-neutral-500">Mã vận đơn</div>
                <div className="mt-1 text-sm font-mono font-bold text-neutral-900">
                  {trackingToShow}
                </div>
              </div>
            )}
            {loadingShipment && (
              <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                <Loader2 size={14} className="animate-spin" />
                Đang tạo vận đơn và đồng bộ trạng thái...
              </div>
            )}
            {shipmentError && (
              <div className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {shipmentError}
              </div>
            )}
            <div>
              <div className="text-xs text-neutral-500">Ngày đặt</div>
              <div className="mt-1 text-sm font-medium text-neutral-900">
                {new Date().toLocaleString('vi-VN')}
              </div>
            </div>
          </div>

          <div className="my-4 border-t border-neutral-200" />

          <div className="space-y-3">
            {[
              ...(requiresShipping
                ? [
                    {
                      icon: Package,
                      title: 'Đang xác nhận đơn',
                      desc: 'Shop sẽ xác nhận đơn hàng trong vòng 24h',
                    },
                    {
                      icon: Truck,
                      title: 'Giao trong 2-4 ngày',
                      desc: 'Bạn sẽ nhận được thông báo khi đơn hàng được giao',
                    },
                    {
                      icon: Navigation,
                      title: 'Theo dõi đơn hàng',
                      desc: `Mã vận đơn: ${trackingToShow || 'Đang cập nhật'}`,
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Quét QR khi nhận hàng',
                      desc: 'Mở app, quét mã QR trên bao bì để xác thực chính hãng',
                    },
                  ]
                : [
                    {
                      icon: Package,
                      title: 'Chờ kích hoạt dịch vụ',
                      desc: 'Shop sẽ kích hoạt hoặc bàn giao quyền truy cập sau khi thanh toán được xác nhận',
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Giao dịch được bảo vệ',
                      desc: 'Thanh toán online được kiểm soát theo cơ chế giải ngân của ACFMart',
                    },
                    {
                      icon: FileText,
                      title: 'Theo dõi trong đơn hàng',
                      desc: 'Trạng thái kích hoạt sẽ được cập nhật trong chi tiết đơn',
                    },
                  ]),
            ].map((step) => (
              <div key={step.title} className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                  <step.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-900">{step.title}</div>
                  <div className="text-xs text-neutral-500">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to={`/account/orders/${code}`} className="btn-primary justify-center">
            <FileText size={16} />
            Xem chi tiết đơn hàng
          </Link>
          {trackingToShow && (
            <Link
              to={`/account/track?tracking=${trackingToShow}${shippingProviderId ? `&provider=${shippingProviderId}` : ''}`}
              className="btn-secondary justify-center"
            >
              <Navigation size={16} />
              Theo dõi đơn hàng
            </Link>
          )}
          <Link to="/" className="btn-secondary justify-center">
            <Home size={16} />
            Tiếp tục mua sắm
          </Link>
        </div>

        <div className="mt-6 rounded-lg bg-brand-gold-50 p-4 text-center text-xs text-brand-gold-800">
          💡 <strong>Mẹo:</strong> Hỏi{' '}
          <Link to="/aivy" className="font-bold underline">
            Aivy
          </Link>{' '}
          nếu bạn cần hỗ trợ về đơn hàng, vận chuyển hoặc đổi trả.
        </div>
      </div>
    </div>
  );
}
