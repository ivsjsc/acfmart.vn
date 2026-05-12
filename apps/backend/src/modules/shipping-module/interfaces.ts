import { IServices } from "@medusajs/types";
import { ShippingRateOption, ShippingOrder, TrackingInfo, Address, Parcel } from "./types";

export interface IShippingModuleService extends IServices.Service<
  any,
  any,
  any,
  any
> {
  getShippingRates(input: {
    from: Address;
    to: Address;
    parcel: Parcel;
  }): Promise<ShippingRateOption[]>;

  createShippingOrder(input: {
    from: Address;
    to: Address;
    parcel: Parcel;
    serviceCode: string;
    providerId: string;
    metadata?: Record<string, any>;
  }): Promise<ShippingOrder>;

  trackShipment(trackingNumber: string): Promise<TrackingInfo>;
}