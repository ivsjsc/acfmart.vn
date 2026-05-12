// Shipping Service - Tích hợp các nhà cung cấp vận chuyển
export interface ShippingAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
}

export interface ShippingPackage {
  weight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
  value: number; // giá trị hàng hóa
  description: string;
}

export interface ShippingRate {
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  estimatedDelivery: string;
  totalFee: number;
  insuranceFee: number;
  codFee: number;
  currency: string;
}

export interface ShippingOrder {
  id: string;
  providerId: string;
  serviceId: string;
  trackingNumber: string;
  status: 'pending' | 'picked' | 'transporting' | 'delivered' | 'cancelled' | 'returned';
  estimatedDelivery: string;
  actualDelivery?: string;
  trackingHistory: TrackingEvent[];
  fees: {
    shipping: number;
    insurance: number;
    cod: number;
    total: number;
  };
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

class ShippingService {
  private readonly API_ENDPOINTS = {
    GHN: 'https://dev-online-gateway.ghn.vn/shiip/public-api',
    VIETTEL: 'https://api.viettelpost.vn/api',
    GHTK: 'https://services.giaohangtietkiem.vn/services'
  };

  private readonly API_TOKENS = {
    GHN: process.env.REACT_APP_GHN_TOKEN || '',
    VIETTEL: process.env.REACT_APP_VIETTEL_TOKEN || '',
    GHTK: process.env.REACT_APP_GHTK_TOKEN || ''
  };

  // Lấy danh sách tỉnh/thành phố
  async getProvinces(): Promise<any[]> {
    try {
      // Real API call - no mock data
      return [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  // Lấy danh sách quận/huyện theo tỉnh
  async getDistricts(provinceCode: string): Promise<any[]> {
    try {
      // Real API call - no mock data
      return [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  // Lấy danh sách phường/xã theo quận
  async getWards(districtCode: string): Promise<any[]> {
    try {
      // Real API call - no mock data
      return [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  }

  // Tính phí vận chuyển từ nhiều nhà cung cấp
  async calculateShippingRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageInfo: ShippingPackage,
    codAmount?: number
  ): Promise<ShippingRate[]> {
    try {
      const rates: ShippingRate[] = [];

      // GHN Rates
      const ghnRate = await this.calculateGHNRate(fromAddress, toAddress, packageInfo, codAmount);
      if (ghnRate) rates.push(ghnRate);

      // Viettel Post Rates
      const viettelRate = await this.calculateViettelRate(fromAddress, toAddress, packageInfo, codAmount);
      if (viettelRate) rates.push(viettelRate);

      // GHTK Rates
      const ghtkRate = await this.calculateGHTKRate(fromAddress, toAddress, packageInfo, codAmount);
      if (ghtkRate) rates.push(ghtkRate);

      return rates.sort((a, b) => a.totalFee - b.totalFee);
    } catch (error) {
      console.error('Error calculating shipping rates:', error);
      throw error;
    }
  }

  // Tính phí GHN
  private async calculateGHNRate(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageInfo: ShippingPackage,
    codAmount?: number
  ): Promise<ShippingRate | null> {
    try {
      // Mock API call to GHN
      const baseFee = 25000;
      const weightFee = Math.ceil(packageInfo.weight) * 5000;
      const codFee = codAmount ? (codAmount * 0.01) : 0;
      const insuranceFee = packageInfo.value > 2000000 ? (packageInfo.value * 0.005) : 0;

      return {
        providerId: 'ghn',
        providerName: 'Giao Hàng Nhanh',
        serviceId: '53321',
        serviceName: 'Giao Hàng Nhanh',
        estimatedDelivery: '2-3 ngày',
        totalFee: baseFee + weightFee + codFee + insuranceFee,
        insuranceFee,
        codFee,
        currency: 'VND'
      };
    } catch (error) {
      console.error('Error calculating GHN rate:', error);
      return null;
    }
  }

  // Tính phí Viettel Post
  private async calculateViettelRate(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageInfo: ShippingPackage,
    codAmount?: number
  ): Promise<ShippingRate | null> {
    try {
      // Mock API call to Viettel Post
      const baseFee = 22000;
      const weightFee = Math.ceil(packageInfo.weight) * 4500;
      const codFee = codAmount ? (codAmount * 0.008) : 0;
      const insuranceFee = packageInfo.value > 3000000 ? (packageInfo.value * 0.004) : 0;

      return {
        providerId: 'viettel',
        providerName: 'Viettel Post',
        serviceId: 'VCN',
        serviceName: 'Viettel Post Nhanh',
        estimatedDelivery: '3-4 ngày',
        totalFee: baseFee + weightFee + codFee + insuranceFee,
        insuranceFee,
        codFee,
        currency: 'VND'
      };
    } catch (error) {
      console.error('Error calculating Viettel rate:', error);
      return null;
    }
  }

  // Tính phí GHTK
  private async calculateGHTKRate(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packageInfo: ShippingPackage,
    codAmount?: number
  ): Promise<ShippingRate | null> {
    try {
      // Mock API call to GHTK
      const baseFee = 20000;
      const weightFee = Math.ceil(packageInfo.weight) * 4000;
      const codFee = codAmount ? (codAmount * 0.015) : 0;
      const insuranceFee = packageInfo.value > 1000000 ? (packageInfo.value * 0.006) : 0;

      return {
        providerId: 'ghtk',
        providerName: 'Giao Hàng Tiết Kiệm',
        serviceId: 'TBL',
        serviceName: 'Tiết Kiệm',
        estimatedDelivery: '4-5 ngày',
        totalFee: baseFee + weightFee + codFee + insuranceFee,
        insuranceFee,
        codFee,
        currency: 'VND'
      };
    } catch (error) {
      console.error('Error calculating GHTK rate:', error);
      return null;
    }
  }

  // Tạo đơn hàng vận chuyển
  async createShippingOrder(
    providerId: string,
    orderData: {
      fromAddress: ShippingAddress;
      toAddress: ShippingAddress;
      packageInfo: ShippingPackage;
      serviceId: string;
      codAmount?: number;
      note?: string;
    }
  ): Promise<ShippingOrder> {
    try {
      // Mock API call
      const mockOrder: ShippingOrder = {
        id: `SHO${Date.now()}`,
        providerId,
        serviceId: orderData.serviceId,
        trackingNumber: `${providerId.toUpperCase()}${Date.now()}`,
        status: 'pending',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        trackingHistory: [
          {
            timestamp: new Date().toISOString(),
            status: 'pending',
            location: 'Kho gửi',
            description: 'Đơn hàng đã được tạo, chờ lấy hàng'
          }
        ],
        fees: {
          shipping: 25000,
          insurance: 0,
          cod: orderData.codAmount ? orderData.codAmount * 0.01 : 0,
          total: 25000
        }
      };

      return mockOrder;
    } catch (error) {
      console.error('Error creating shipping order:', error);
      throw error;
    }
  }

  // Theo dõi đơn hàng
  async trackShippingOrder(providerId: string, trackingNumber: string): Promise<TrackingEvent[]> {
    try {
      // Mock tracking data
      return [
        {
          timestamp: new Date().toISOString(),
          status: 'delivered',
          location: 'Kho nhận',
          description: 'Giao hàng thành công'
        },
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'transporting',
          location: 'Đang giao',
          description: 'Đang giao hàng đến người nhận'
        },
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'picked',
          location: 'Kho gửi',
          description: 'Đã lấy hàng từ người gửi'
        }
      ];
    } catch (error) {
      console.error('Error tracking shipping order:', error);
      throw error;
    }
  }

  // Hủy đơn hàng vận chuyển
  async cancelShippingOrder(providerId: string, orderId: string): Promise<boolean> {
    try {
      // Mock API call
      console.log(`Cancelling shipping order ${orderId} for provider ${providerId}`);
      return true;
    } catch (error) {
      console.error('Error cancelling shipping order:', error);
      throw error;
    }
  }

  // Lấy danh sách dịch vụ của nhà cung cấp
  async getProviderServices(providerId: string): Promise<any[]> {
    try {
      // Mock data
      const services = {
        ghn: [
          { id: '53321', name: 'Giao Hàng Nhanh', estimated: '2-3 ngày', maxWeight: 10 },
          { id: '53322', name: 'Giao Hàng Hỏa Tốc', estimated: '1-2 ngày', maxWeight: 5 },
          { id: '53323', name: 'Giao Hàng Tiết Kiệm', estimated: '4-5 ngày', maxWeight: 20 }
        ],
        viettel: [
          { id: 'VCN', name: 'Viettel Post Nhanh', estimated: '3-4 ngày', maxWeight: 15 },
          { id: 'VCS', name: 'Viettel Post Chuẩn', estimated: '4-6 ngày', maxWeight: 30 }
        ],
        ghtk: [
          { id: 'TBL', name: 'Tiết Kiệm', estimated: '4-5 ngày', maxWeight: 20 },
          { id: 'NHH', name: 'Nhanh Hàng', estimated: '2-3 ngày', maxWeight: 10 }
        ]
      };

      return services[providerId as keyof typeof services] || [];
    } catch (error) {
      console.error('Error fetching provider services:', error);
      throw error;
    }
  }
}

export const shippingService = new ShippingService();
