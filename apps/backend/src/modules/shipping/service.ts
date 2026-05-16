import { TransactionBaseService } from "medusa-core-utils";
import { EntityManager } from "typeorm";
import { Logger } from "@medusajs/medusa/dist/types/global";
import { GHNAdapter } from './adapters/ghn-adapter';
import { GHTKAdapter } from './adapters/ghtk-adapter';
import { 
  ShippingAdapter, 
  ShippingRateRequest, 
  ShippingRateResponse, 
  ShippingOrderRequest, 
  ShippingOrderResponse,
  TrackingResponse
} from './interface';

type InjectedDependencies = {
  manager: EntityManager;
  logger: Logger;
};

export default class ShippingService extends TransactionBaseService {
  protected readonly ghnAdapter: ShippingAdapter;
  protected readonly ghtkAdapter: ShippingAdapter;
  protected readonly logger_: Logger;

  constructor({ manager, logger }: InjectedDependencies) {
    super({ manager });

    this.ghnAdapter = new GHNAdapter();
    this.ghtkAdapter = new GHTKAdapter();
    this.logger_ = logger;
  }

  async calculateRates(
    request: ShippingRateRequest,
    provider: 'ghn' | 'ghtk' = 'ghn'
  ): Promise<ShippingRateResponse[]> {
    try {
      const adapter = provider === 'ghn' ? this.ghnAdapter : this.ghtkAdapter;
      const rates = await adapter.calculateRates(request);

      // Cache the rates in Redis if available
      if (process.env.REDIS_URL) {
        try {
          const redis = require('redis');
          const client = redis.createClient({ url: process.env.REDIS_URL });
          await client.connect();

          const cacheKey = `shipping_rates:${provider}:${request.from_district_id}:${request.to_district_id}:${request.weight}`;
          await client.setEx(cacheKey, 300, JSON.stringify(rates)); // Cache for 5 minutes
          await client.quit();
        } catch (cacheErr: unknown) {
          this.logger_.warn(`Failed to cache shipping rates: ${(cacheErr as Error).message}`);
        }
      }

      return rates;
    } catch (error: unknown) {
      this.logger_.error(`Error calculating shipping rates: ${(error as Error).message}`);
      throw error;
    }
  }

  async createShipment(
    request: ShippingOrderRequest,
    provider: 'ghn' | 'ghtk' = 'ghn'
  ): Promise<ShippingOrderResponse> {
    try {
      const adapter = provider === 'ghn' ? this.ghnAdapter : this.ghtkAdapter;
      return await adapter.createShipment(request);
    } catch (error) {
      this.logger_.error(`Error creating shipment: ${error.message}`);
      throw error;
    }
  }

  async trackShipment(
    orderCode: string,
    provider: 'ghn' | 'ghtk' = 'ghn'
  ): Promise<TrackingResponse> {
    try {
      const adapter = provider === 'ghn' ? this.ghnAdapter : this.ghtkAdapter;
      return await adapter.trackShipment(orderCode);
    } catch (error: unknown) {
      this.logger_.error(`Error tracking shipment: ${(error as Error).message}`);
      throw error;
    }
  }

  async cancelShipment(
    orderCode: string,
    provider: 'ghn' | 'ghtk' = 'ghn'
  ): Promise<boolean> {
    try {
      const adapter = provider === 'ghn' ? this.ghnAdapter : this.ghtkAdapter;
      return await adapter.cancelShipment(orderCode);
    } catch (error: unknown) {
      this.logger_.error(`Error canceling shipment: ${(error as Error).message}`);
      throw error;
    }
  }

  async getSupportedProviders(): Promise<Array<'ghn' | 'ghtk'>> {
    return ['ghn', 'ghtk'];
  }

  async getCheapestRate(
    request: ShippingRateRequest
  ): Promise<{ provider: 'ghn' | 'ghtk'; rate: ShippingRateResponse } | null> {
    const results = await Promise.all([
      this.calculateRates(request, 'ghn').catch(() => []),
      this.calculateRates(request, 'ghtk').catch(() => [])
    ]);

    const [ghnRates, ghtkRates] = results;
    const allRates = [
      ...ghnRates.map(rate => ({ provider: 'ghn', rate })),
      ...ghtkRates.map(rate => ({ provider: 'ghtk', rate }))
    ];

    if (allRates.length === 0) {
      return null;
    }

    const cheapest = allRates.reduce((prev, current) => 
      prev.rate.fee < current.rate.fee ? prev : current
    );

    return cheapest;
  }
}