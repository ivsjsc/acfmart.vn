import { MomoProvider } from "./momo-provider"
import { VnpayProvider } from "./vnpay-provider"
import { ZalopayProvider } from "./zalopay-provider"
import type {
  PaymentInitInput,
  PaymentInitResult,
  PaymentProvider,
  PaymentProviderId,
  PaymentStatus,
  PaymentVerifyInput,
} from "./types"

export * from "./types"
export { MomoProvider, VnpayProvider, ZalopayProvider }

/**
 * PaymentGateway — single entry point for the frontend.
 *
 * Usage:
 *   const gateway = PaymentGateway.fromEnv()
 *   const result = await gateway.init("vnpay", {...})
 *   if (result.redirectUrl) window.location.href = result.redirectUrl
 */
export class PaymentGateway {
  private providers: Map<PaymentProviderId, PaymentProvider>

  constructor(providers: PaymentProvider[]) {
    this.providers = new Map(providers.map((p) => [p.id, p]))
  }

  static fromEnv(): PaymentGateway {
    const env = import.meta.env
    return new PaymentGateway([
      new VnpayProvider({
        merchantId: env.VITE_VNPAY_TMN_CODE,
        hashSecret: env.VITE_VNPAY_HASH_SECRET,
        sandbox: env.DEV,
      }),
      new MomoProvider({
        partnerCode: env.VITE_MOMO_PARTNER_CODE,
        accessKey: env.VITE_MOMO_ACCESS_KEY,
        secretKey: env.VITE_MOMO_SECRET_KEY,
        sandbox: env.DEV,
      }),
      new ZalopayProvider({
        appId: env.VITE_ZALOPAY_APP_ID,
        apiKey: env.VITE_ZALOPAY_KEY1,
        secretKey: env.VITE_ZALOPAY_KEY2,
        sandbox: env.DEV,
      }),
    ])
  }

  list(): PaymentProvider[] {
    return Array.from(this.providers.values())
  }

  enabledList(): PaymentProvider[] {
    return this.list().filter((p) => p.enabled)
  }

  get(id: PaymentProviderId): PaymentProvider | undefined {
    return this.providers.get(id)
  }

  async init(
    providerId: PaymentProviderId,
    input: PaymentInitInput
  ): Promise<PaymentInitResult> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      return { success: false, error: `Provider ${providerId} not found` }
    }
    if (!provider.enabled) {
      return {
        success: false,
        error: `Provider ${provider.name} chưa được cấu hình`,
      }
    }
    return provider.initPayment(input)
  }

  async verify(
    providerId: PaymentProviderId,
    input: PaymentVerifyInput
  ): Promise<PaymentStatus | null> {
    const provider = this.providers.get(providerId)
    if (!provider) return null
    return provider.verifyPayment(input)
  }
}
