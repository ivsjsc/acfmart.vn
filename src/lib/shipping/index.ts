import { GhnProvider } from "./ghn-provider"
import { GhtkProvider } from "./ghtk-provider"
import { JntProvider } from "./jnt-provider"
import type { ShippingProvider, ShippingProviderId, ShippingRateOption, Address, Parcel } from "./types"

export * from "./types"
export { GhnProvider, GhtkProvider, JntProvider }

/**
 * Aggregator that calls every enabled provider in parallel and merges quotes.
 * Returns rates sorted by total fee ascending.
 */
export class ShippingAggregator {
  private providers: ShippingProvider[]

  constructor(providers: ShippingProvider[]) {
    this.providers = providers.filter((p) => p.enabled)
  }

  static fromEnv(): ShippingAggregator {
    const env = import.meta.env
    const providers: ShippingProvider[] = [
      new GhnProvider({
        token: env.VITE_GHN_TOKEN,
        shopId: env.VITE_GHN_SHOP_ID,
        sandbox: env.DEV,
      }),
      new GhtkProvider({
        apiKey: env.VITE_GHTK_TOKEN,
      }),
      new JntProvider({
        apiKey: env.VITE_JNT_API_KEY,
        token: env.VITE_JNT_SECRET,
      }),
    ]
    return new ShippingAggregator(providers)
  }

  get availableProviders() {
    return this.providers
  }

  async quoteAll(
    from: Address,
    to: Address,
    parcel: Parcel
  ): Promise<Array<ShippingRateOption & { providerId: ShippingProviderId; providerName: string; providerLogo: string }>> {
    const results = await Promise.allSettled(
      this.providers.map((p) =>
        p.quote(from, to, parcel).then((opts) =>
          opts.map((opt) => ({
            ...opt,
            providerId: p.id,
            providerName: p.name,
            providerLogo: p.logo,
          }))
        )
      )
    )

    return results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .sort((a, b) => a.totalFee - b.totalFee)
  }

  getProvider(id: ShippingProviderId): ShippingProvider | undefined {
    return this.providers.find((p) => p.id === id)
  }
}
