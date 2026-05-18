import { getBackend, postBackend, backendApiUrl, backendHeaders, BackendUnavailableError } from './api-base'

export interface ShippingProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
}

export interface ShippingRate {
  id: string;
  providerId: string;
  serviceName: string;
  serviceId: number;
  shippingFee: number;
  estimatedDays: number;
  isActive: boolean;
}

export interface ShippingTrackingInfo {
  status: string;
  statusDescription: string;
  location: string;
  updateTime: string;
  history: Array<{
    status: string;
    location: string;
    time: string;
    description: string;
  }>;
}

export interface GHNService {
  ServiceId: number;
  ShortName: string;
  Name: string;
}

export interface GHNLocation {
  DistrictID: number;
  ProvinceID: number;
  WardCode: string;
}

export interface GHNShippingFeeRequest {
  from_district_id: number;
  to_district_id: number;
  to_ward_code: string;
  weight: number;
  insurance_value: number;
  coupon: string | null;
  service_id?: number;
}

export interface GHNShippingFeeResponse {
  total: number;
  service_id: number | null;
  service_type_id: number | null;
  payment_type_id: number;
  fee: {
    service_fee: number;
    insurance_fee: number;
    pick_station_fee: number;
    return_station_fee: number;
    total: number;
  };
  delivery_time: {
    estimated_pick_shift: number[];
    estimated_delivery_time: string;
    estimated_delivery_shift: number[];
  };
}

export interface GHTKService {
  service_id: string;
  name: string;
  description: string;
}

export interface GHTKShippingFeeRequest {
  pick_province: string;
  pick_district: string;
  province: string;
  district: string;
  address: string;
  weight: number;
  value: number;
  transport: string;
  deliver_option: string[];
}

export interface GHTKShippingFeeResponse {
  success: boolean;
  message: string;
  data: {
    fee: number;
    insurance_fee: number;
    transport: string;
    service_id: string;
    delivery_time: string;
  };
}

class ShippingApiService {
  private ghnBaseUrl = 'https://online-gateway.ghn.vn/shiip/public-api';

  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Token'] = token;
    }
    return headers;
  }

  async getAvailableProviders(): Promise<ShippingProvider[]> {
    try {
      const data = await getBackend<{ providers: ShippingProvider[] }>("/store/shipping/providers")
      return data.providers
    } catch {
      return [
        { id: 'ghn', name: 'Giao hàng nhanh (GHN)', description: 'Dịch vụ giao hàng nhanh chóng trong vòng 24-48h', logo: '/shipping-logos/ghn.png' },
        { id: 'ghtk', name: 'Giao hàng tiết kiệm (GHTK)', description: 'Dịch vụ giao hàng tiết kiệm với chi phí thấp', logo: '/shipping-logos/ghtk.png' },
        { id: 'vtp', name: 'Viettel Post', description: 'Dịch vụ giao hàng thuộc tập đoàn Viettel', logo: '/shipping-logos/vtp.png' },
      ]
    }
  }

  async getGHNServices(districtId: number, shopId: string): Promise<GHNService[]> {
    try {
      const token = import.meta.env.VITE_GHN_TOKEN
      const response = await fetch(`${this.ghnBaseUrl}/v2/shipping-order/available-services`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          shop_id: parseInt(shopId),
          from_district: districtId,
          to_district: districtId,
        })
      });

      if (!response.ok) throw new Error(`GHN API error: ${response.status}`)
      const json = await response.json()
      return (json.data || []) as GHNService[]
    } catch (error) {
      console.error('Error fetching GHN services:', error);
      return [];
    }
  }

  async calculateGHNShippingFee(request: GHNShippingFeeRequest): Promise<GHNShippingFeeResponse | null> {
    try {
      const token = import.meta.env.VITE_GHN_TOKEN
      const response = await fetch(`${this.ghnBaseUrl}/v2/shipping-order/fee`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error(`GHN fee API error: ${response.status}`)
      const json = await response.json()
      return json.data as GHNShippingFeeResponse
    } catch (error) {
      console.error('Error calculating GHN shipping fee:', error);
      return null;
    }
  }

  async calculateGHTKShippingFee(request: GHTKShippingFeeRequest): Promise<GHTKShippingFeeResponse | null> {
    try {
      const result = await postBackend<GHTKShippingFeeResponse>('/store/shipping/ghtk/fee', request)
      return result
    } catch (error) {
      console.error('Error calculating GHTK shipping fee:', error);
      return null;
    }
  }

  async trackShipment(providerId: string, trackingNumber: string): Promise<ShippingTrackingInfo | null> {
    try {
      const res = await fetch(
        backendApiUrl(`/store/shipping/track/${trackingNumber}?providerId=${providerId}`),
        { headers: backendHeaders() }
      )
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.tracking) return null

      const tracking = data.tracking
      return {
        status: tracking.currentStatus || 'unknown',
        statusDescription: tracking.statusDescription || tracking.currentStatus || '',
        location: tracking.currentLocation || '',
        updateTime: tracking.lastUpdate || new Date().toISOString(),
        history: (tracking.events || []).map((event: any) => ({
          status: event.status,
          location: event.location || '',
          time: event.timestamp,
          description: event.note || event.status,
        })),
      }
    } catch (error) {
      console.error('Error tracking shipment:', error);
      return null;
    }
  }
}

export default new ShippingApiService();
