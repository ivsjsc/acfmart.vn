import { IPaymentGateway, PaymentProvider } from "./IPaymentGateway";
import { VNPayGateway } from "./VNPayGateway";
import { MoMoGateway } from "./MoMoGateway";
import { ZaloPayGateway } from "./ZaloPayGateway";
import { StripeGateway } from "./StripeGateway";

/**
 * PaymentGatewayFactory - Factory Pattern phân giải concrete gateway theo
 * tên provider. Sử dụng lazy singleton để mỗi provider chỉ được khởi tạo
 * một lần (mỗi instance đọc env một lần khi gọi method đầu tiên).
 *
 * Đăng ký gateway mới:
 *  1. Tạo class implements IPaymentGateway (extends BasePaymentGateway).
 *  2. Thêm vào REGISTRY map dưới đây.
 *  3. Update enum PaymentProvider trong IPaymentGateway.ts.
 *
 * Khi gọi `getGateway("paypal")` mà chưa đăng ký, factory throw error rõ ràng
 * với danh sách provider supported.
 */

type GatewayConstructor = new () => IPaymentGateway;

const REGISTRY: Record<PaymentProvider, GatewayConstructor | null> = {
  vnpay: VNPayGateway,
  momo: MoMoGateway,
  zalopay: ZaloPayGateway,
  stripe: StripeGateway,
  paypal: null, // chưa implement - chờ hợp đồng
  cod: null, // COD không qua gateway, xử lý inline ở PaymentService
};

const INSTANCES: Partial<Record<PaymentProvider, IPaymentGateway>> = {};

export class PaymentGatewayFactory {
  /**
   * Lấy instance gateway theo provider name. Idempotent: gọi nhiều lần trả về
   * cùng instance để tận dụng connection pool và cache.
   */
  static getGateway(provider: PaymentProvider): IPaymentGateway {
    const cached = INSTANCES[provider];
    if (cached) return cached;

    const Ctor = REGISTRY[provider];
    if (!Ctor) {
      const available = Object.entries(REGISTRY)
        .filter(([, v]) => v !== null)
        .map(([k]) => k)
        .join(", ");
      throw new Error(
        `Payment provider "${provider}" chưa được triển khai. ` +
          `Provider có sẵn: ${available}`
      );
    }

    const instance = new Ctor();
    INSTANCES[provider] = instance;
    return instance;
  }

  /** Liệt kê provider đã đăng ký - dùng cho /healthz và debug */
  static listProviders(): PaymentProvider[] {
    return Object.entries(REGISTRY)
      .filter(([, v]) => v !== null)
      .map(([k]) => k as PaymentProvider);
  }

  /**
   * Reset cache instances - chỉ dùng trong test, không gọi production.
   * @internal
   */
  static __resetForTests(): void {
    for (const k of Object.keys(INSTANCES)) {
      delete INSTANCES[k as PaymentProvider];
    }
  }
}
