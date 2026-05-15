import axios from 'axios';
import { 
  ShippingAdapter, 
  ShippingRateRequest, 
  ShippingRateResponse, 
  ShippingOrderRequest, 
  ShippingOrderResponse, 
  TrackingResponse 
} from '../interface';

export class GHNAdapter implements ShippingAdapter {
  private readonly baseURL: string;
  private readonly shopId: string;
  private readonly token: string;

  constructor() {
    this.baseURL = process.env.GHN_BASE_URL || 'https://online-gateway.ghn.vn/shiip/public-api';
    this.shopId = process.env.GHN_SHOP_ID!;
    this.token = process.env.GHN_TOKEN!;
  }

  async calculateRates(request: ShippingRateRequest): Promise<ShippingRateResponse[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v2/shipping-order/fee`,
        {
          from_district_id: request.from_district_id,
          to_district_id: request.to_district_id,
          to_ward_code: request.to_ward_code,
          height: request.height || 10,
          length: request.length || 20,
          width: request.width || 15,
          weight: request.weight,
          insurance_value: request.insurance_value || 0,
          service_id: request.service_id,
          service_type_id: request.service_type_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': this.token,
            'ShopId': this.shopId
          }
        }
      );

      if (response.data.code === 200) {
        return response.data.data.services.map((service: any) => ({
          service_id: service.service_id,
          service_type_id: service.service_type_id,
          name: service.name,
          fee: service.fee,
          estimated_delivery_time: service.estimated_delivery_time
        }));
      } else {
        throw new Error(`GHN API error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error calculating GHN rates:', error);
      throw error;
    }
  }

  async createShipment(request: ShippingOrderRequest): Promise<ShippingOrderResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v2/shipping-order/create`,
        {
          ...request,
          shop_id: parseInt(this.shopId),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': this.token,
            'ShopId': this.shopId
          }
        }
      );

      if (response.data.code === 200) {
        return {
          order_code: response.data.data.order_code,
          fee: response.data.data.total_fee,
          estimated_delivery_time: response.data.data.estimated_delivery_time,
          status: response.data.data.status,
          leadtime: response.data.data.leadtime
        };
      } else {
        throw new Error(`GHN API error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating GHN shipment:', error);
      throw error;
    }
  }

  async trackShipment(orderCode: string): Promise<TrackingResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/v2/tracking`,
        {
          params: { order_codes: orderCode },
          headers: {
            'Token': this.token
          }
        }
      );

      if (response.data.code === 200) {
        const orderData = response.data.data.order_codes[0];
        return {
          order_code: orderData.order_code,
          status: orderData.status,
          current_location: orderData.current_location,
          history: orderData.history.map((item: any) => ({
            status: item.status,
            location: item.location_name,
            time: item.time,
            note: item.note
          }))
        };
      } else {
        throw new Error(`GHN API error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error tracking GHN shipment:', error);
      throw error;
    }
  }

  async cancelShipment(orderCode: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v2/shipping-order/cancel`,
        {
          order_codes: [orderCode]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': this.token,
            'ShopId': this.shopId
          }
        }
      );

      return response.data.code === 200;
    } catch (error) {
      console.error('Error canceling GHN shipment:', error);
      throw error;
    }
  }
}