import axios from 'axios';
import crypto from 'crypto';
import { 
  ShippingAdapter, 
  ShippingRateRequest, 
  ShippingRateResponse, 
  ShippingOrderRequest, 
  ShippingOrderResponse, 
  TrackingResponse 
} from '../interface';

export class GHTKAdapter implements ShippingAdapter {
  private readonly baseURL: string;
  private readonly token: string;
  private readonly userId: string;

  constructor() {
    this.baseURL = process.env.GHTK_BASE_URL || 'https://services.ghn.vn/api';
    this.token = process.env.GHTK_TOKEN!;
    this.userId = process.env.GHTK_USER_ID!;
  }

  async calculateRates(request: ShippingRateRequest): Promise<ShippingRateResponse[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/shipping/fee`,
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
        throw new Error(`GHTK API error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error calculating GHTK rates:', error);
      throw error;
    }
  }

  async createShipment(request: ShippingOrderRequest): Promise<ShippingOrderResponse> {
    try {
      // Format the address properly for GHTK
      const formattedAddress = `${request.to_address}, ${request.to_ward_code}, ${request.to_district_id}, ${request.to_province_id}`;
      
      const response = await axios.post(
        `${this.baseURL}/v1/order/create`,
        {
          ...request,
          to_address: formattedAddress,
          client_order_code: `ORD-${Date.now()}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': this.token,
            'User-Id': this.userId,
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
        throw new Error(`GHTK API error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating GHTK shipment:', error);
      throw error;
    }
  }

  async trackShipment(orderCode: string): Promise<TrackingResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1/tracking/${orderCode}`,
        {
          headers: {
            'Token': this.token,
          }
        }
      );

      if (response.data.code === 200) {
        const orderData = response.data.data;
        return {
          order_code: orderData.order_code,
          status: orderData.status,
          current_location: orderData.current_location,
          history: orderData.history.map((item: any) => ({
            status: item.status,
            location: item.location,
            time: item.time,
            note: item.note
          }))
        };
      } else {
        throw new Error(`GHTK API error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error tracking GHTK shipment:', error);
      throw error;
    }
  }

  async cancelShipment(orderCode: string): Promise<boolean> {
    try {
      const response = await axios.put(
        `${this.baseURL}/v1/order/cancel/${orderCode}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': this.token,
          }
        }
      );

      return response.data.code === 200;
    } catch (error) {
      console.error('Error canceling GHTK shipment:', error);
      throw error;
    }
  }
}