import { Order } from '../types';

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
  address: string; // ward
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
  private ghtkBaseUrl = 'https://services.ghn.vn/api';
  
  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ACF-Shipping-Integration/1.0'
    };
    
    if (token) {
      headers['Token'] = token;
    }
    
    return headers;
  }

  async getAvailableProviders(): Promise<ShippingProvider[]> {
    // Trong thực tế, sẽ gọi API để lấy danh sách nhà vận chuyển
    return [
      {
        id: 'ghn',
        name: 'Giao hàng nhanh (GHN)',
        description: 'Dịch vụ giao hàng nhanh chóng trong vòng 24-48h',
        logo: '/shipping-logos/ghn.png'
      },
      {
        id: 'ghtk',
        name: 'Giao hàng tiết kiệm (GHTK)',
        description: 'Dịch vụ giao hàng tiết kiệm với chi phí thấp',
        logo: '/shipping-logos/ghtk.png'
      },
      {
        id: 'vtp',
        name: 'Viettel Post',
        description: 'Dịch vụ giao hàng thuộc tập đoàn Viettel',
        logo: '/shipping-logos/vtp.png'
      }
    ];
  }

  async getGHNServices(districtId: number, shopId: string): Promise<GHNService[]> {
    try {
      // Đây là mock, trong thực tế sẽ gọi API của GHN
      const response = await fetch(`${this.ghnBaseUrl}/v2/shipping-order/available-services`, {
        method: 'POST',
        headers: this.getHeaders(process.env.REACT_APP_GHN_TOKEN),
        body: JSON.stringify({
          shop_id: parseInt(shopId),
          from_district: districtId,
          to_district: districtId // thay bằng district thực tế của người mua
        })
      });

      // Mock response
      return [
        {
          ServiceId: 1234,
          ShortName: 'GHN Express',
          Name: 'Giao hàng nhanh'
        },
        {
          ServiceId: 5678,
          ShortName: 'GHN SuperFast',
          Name: 'Giao siêu tốc'
        }
      ];
    } catch (error) {
      console.error('Error fetching GHN services:', error);
      return [];
    }
  }

  async calculateGHNShippingFee(request: GHNShippingFeeRequest): Promise<GHNShippingFeeResponse | null> {
    try {
      // Đây là mock, trong thực tế sẽ gọi API của GHN
      const response = await fetch(`${this.ghnBaseUrl}/v2/shipping-order/fee`, {
        method: 'POST',
        headers: this.getHeaders(process.env.REACT_APP_GHN_TOKEN),
        body: JSON.stringify(request)
      });

      // Mock response
      return {
        total: 30000,
        service_id: request.service_id || 1234,
        service_type_id: 1,
        payment_type_id: 1,
        fee: {
          service_fee: 25000,
          insurance_fee: 5000,
          pick_station_fee: 0,
          return_station_fee: 0,
          total: 30000
        },
        delivery_time: {
          estimated_pick_shift: [1, 2],
          estimated_delivery_time: '2023-06-20T17:00:00Z',
          estimated_delivery_shift: [1, 2]
        }
      };
    } catch (error) {
      console.error('Error calculating GHN shipping fee:', error);
      return null;
    }
  }

  async calculateGHTKShippingFee(request: GHTKShippingFeeRequest): Promise<GHTKShippingFeeResponse | null> {
    try {
      // Đây là mock, trong thực tế sẽ gọi API của GHTK
      const response = await fetch(`${this.ghtkBaseUrl}/transport/fee`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      });

      // Mock response
      return {
        success: true,
        message: 'Success',
        data: {
          fee: 28000,
          insurance_fee: 0,
          transport: 'road',
          service_id: 'SGN-HCM',
          delivery_time: '1-2 ngày'
        }
      };
    } catch (error) {
      console.error('Error calculating GHTK shipping fee:', error);
      return null;
    }
  }

  async trackShipment(providerId: string, trackingNumber: string): Promise<ShippingTrackingInfo | null> {
    try {
      if (providerId === 'ghn') {
        // Trong thực tế, sẽ gọi API theo dõi đơn hàng của GHN
        return {
          status: 'on_the_way',
          statusDescription: 'Đang trên đường giao',
          location: 'Chi nhánh Quận 1, TP.HCM',
          updateTime: '2023-06-18T10:30:00Z',
          history: [
            {
              status: 'picked_up',
              location: 'Kho đi Bình Dương',
              time: '2023-06-17T09:00:00Z',
              description: 'Đơn hàng đã được lấy từ người bán'
            },
            {
              status: 'in_transit',
              location: 'Trạm trung chuyển Bình Dương',
              time: '2023-06-17T12:00:00Z',
              description: 'Đơn hàng đang được vận chuyển'
            },
            {
              status: 'in_transit',
              location: 'Kho đến TP.HCM',
              time: '2023-06-18T08:00:00Z',
              description: 'Đơn hàng đã đến kho TP.HCM'
            },
            {
              status: 'on_the_way',
              location: 'Chi nhánh Quận 1, TP.HCM',
              time: '2023-06-18T10:30:00Z',
              description: 'Đang trên đường giao đến người nhận'
            }
          ]
        };
      } else if (providerId === 'ghtk') {
        // Trong thực tế, sẽ gọi API theo dõi đơn hàng của GHTK
        return {
          status: 'delivered',
          statusDescription: 'Đã giao hàng thành công',
          location: 'Địa chỉ người nhận',
          updateTime: '2023-06-19T14:30:00Z',
          history: [
            {
              status: 'picked_up',
              location: 'Cửa hàng Minh Anh',
              time: '2023-06-17T10:15:00Z',
              description: 'Đơn hàng đã được lấy từ người bán'
            },
            {
              status: 'in_transit',
              location: 'Trung tâm xử lý HCM',
              time: '2023-06-17T16:45:00Z',
              description: 'Đang được xử lý tại trung tâm'
            },
            {
              status: 'on_the_way',
              location: 'Xe tải đang đến điểm giao',
              time: '2023-06-19T14:00:00Z',
              description: 'Đang trên đường giao đến người nhận'
            },
            {
              status: 'delivered',
              location: 'Địa chỉ người nhận',
              time: '2023-06-19T14:30:00Z',
              description: 'Đã giao hàng thành công'
            }
          ]
        };
      }
      return null;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      return null;
    }
  }
}

export default new ShippingApiService();
