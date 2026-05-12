/**
 * Service for handling shipping with various logistics providers
 */

export interface ShippingOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
  provider: 'GHN' | 'GHTK' | 'VTPost' | 'internal'
  logo: string
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  ward: string
  district: string
  city: string
}

export interface ShippingRateRequest {
  from: ShippingAddress
  to: ShippingAddress
  weight: number // in grams
  value: number // insurance value
  serviceType?: 'standard' | 'express' | 'cod'
}

export interface ShippingRate {
  serviceId: string
  serviceName: string
  provider: string
  price: number
  estimatedDays: number
  insuranceFee?: number
  codFee?: number
}

export interface TrackingInfo {
  trackingNumber: string
  provider: string
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'lost'
  statusDescription: string
  progress: Array<{
    timestamp: string
    location: string
    status: string
    description: string
  }>
}

export class ShippingService {
  private static readonly PROVIDERS = [
    { id: 'ghn', name: 'Giao hàng nhanh (GHN)', logo: '' },
    { id: 'ghtk', name: 'Giao hàng tiết kiệm (GHTK)', logo: '' },
    { id: 'vt', name: 'Viettel Post', logo: '' },
    { id: 'internal', name: 'Đối tác nội bộ', logo: '' }
  ]

  /**
   * Calculate shipping rates for different providers
   */
  static async calculateRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    // Simulate API call to shipping providers
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // In a real implementation, this would call each provider's API
    const rates: ShippingRate[] = []
    
    // GHN rates
    rates.push({
      serviceId: 'ghn-standard',
      serviceName: 'Giao hàng nhanh - Tiêu chuẩn',
      provider: 'GHN',
      price: request.serviceType === 'express' ? 45000 : 30000,
      estimatedDays: request.serviceType === 'express' ? 1 : 2,
      insuranceFee: Math.ceil(request.value * 0.005), // 0.5% insurance
      codFee: request.serviceType === 'cod' ? 2000 : 0
    })
    
    rates.push({
      serviceId: 'ghn-express',
      serviceName: 'Giao hàng nhanh - Siêu tốc',
      provider: 'GHN',
      price: 55000,
      estimatedDays: 1,
      insuranceFee: Math.ceil(request.value * 0.005),
      codFee: request.serviceType === 'cod' ? 2000 : 0
    })
    
    // GHTK rates
    rates.push({
      serviceId: 'ghtk-standard',
      serviceName: 'Giao hàng tiết kiệm - Tiêu chuẩn',
      provider: 'GHTK',
      price: request.serviceType === 'express' ? 40000 : 25000,
      estimatedDays: request.serviceType === 'express' ? 1 : 3,
      insuranceFee: Math.ceil(request.value * 0.003), // 0.3% insurance
      codFee: request.serviceType === 'cod' ? 1500 : 0
    })
    
    // VTPost rates
    rates.push({
      serviceId: 'vt-standard',
      serviceName: 'Viettel Post - Tiêu chuẩn',
      provider: 'VTPost',
      price: request.serviceType === 'express' ? 42000 : 28000,
      estimatedDays: request.serviceType === 'express' ? 1 : 2,
      insuranceFee: Math.ceil(request.value * 0.004),
      codFee: request.serviceType === 'cod' ? 1800 : 0
    })
    
    // Internal delivery for major cities
    if (['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'].includes(request.to.city)) {
      rates.push({
        serviceId: 'internal-express',
        serviceName: 'Giao hàng nội bộ - Siêu tốc',
        provider: 'acfmart',
        price: request.serviceType === 'express' ? 35000 : 20000,
        estimatedDays: request.serviceType === 'express' ? 1 : 1, // Same day for express in major cities
        insuranceFee: Math.ceil(request.value * 0.002),
        codFee: request.serviceType === 'cod' ? 1000 : 0
      })
    }
    
    return rates
  }

  /**
   * Create a shipping order with the selected provider
   */
  static async createShippingOrder(
    rate: ShippingRate,
    from: ShippingAddress,
    to: ShippingAddress,
    items: Array<{ name: string; weight: number; value: number; quantity: number }>,
    isCod: boolean,
    note?: string
  ): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    // Simulate API call to create shipping order
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Validation
    if (!from.name || !to.name || !from.phone || !to.phone) {
      return {
        success: false,
        error: 'Thông tin người gửi hoặc người nhận không đầy đủ'
      }
    }
    
    if (items.length === 0) {
      return {
        success: false,
        error: 'Danh sách sản phẩm trống'
      }
    }
    
    // In a real implementation, this would call the provider's API to create a shipping order
    const trackingNumber = `${rate.provider.substring(0, 3).toUpperCase()}${Date.now()}`
    
    // Store shipping order locally for demo purposes
    const shippingOrders = JSON.parse(localStorage.getItem('shippingOrders') || '[]')
    shippingOrders.push({
      trackingNumber,
      rate,
      from,
      to,
      items,
      isCod,
      note,
      createdAt: new Date().toISOString(),
      status: 'pending'
    })
    localStorage.setItem('shippingOrders', JSON.stringify(shippingOrders))
    
    return {
      success: true,
      trackingNumber
    }
  }

  /**
   * Track a shipment by tracking number
   */
  static async trackShipment(trackingNumber: string): Promise<TrackingInfo | null> {
    // Simulate API call to tracking provider
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // In a real implementation, this would call the provider's tracking API
    // For demo purposes, we'll generate some fake tracking data
    
    // Find the provider from the tracking number
    let provider = 'Unknown'
    if (trackingNumber.startsWith('GHN')) provider = 'GHN'
    if (trackingNumber.startsWith('GHT')) provider = 'GHTK'
    if (trackingNumber.startsWith('VT')) provider = 'Viettel Post'
    
    // Generate random status based on age of shipment
    const createdAt = new Date(parseInt(trackingNumber.replace(/\D/g, '')))
    const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
    
    let status: TrackingInfo['status'] = 'pending'
    if (hoursSinceCreation > 48) status = 'delivered'
    else if (hoursSinceCreation > 24) status = 'out_for_delivery'
    else if (hoursSinceCreation > 12) status = 'in_transit'
    else if (hoursSinceCreation > 2) status = 'picked_up'
    
    const statusDescription = {
      pending: 'Đang chờ lấy hàng',
      picked_up: 'Đã lấy hàng từ người bán',
      in_transit: 'Đang vận chuyển',
      out_for_delivery: 'Đang giao đến bạn',
      delivered: 'Đã giao thành công',
      returned: 'Đã trả lại người gửi',
      lost: 'Đơn hàng thất lạc'
    }[status] || 'Không xác định'
    
    // Generate progress history
    const progress = []
    if (status !== 'pending') {
      progress.push({
        timestamp: new Date(Date.now() - 48*60*60*1000).toISOString(),
        location: 'Kho Hà Nội',
        status: 'pending',
        description: 'Đơn hàng được tạo'
      })
      
      if (status === 'picked_up' || status === 'in_transit' || status === 'out_for_delivery' || status === 'delivered') {
        progress.push({
          timestamp: new Date(Date.now() - 40*60*60*1000).toISOString(),
          location: 'Kho Hà Nội',
          status: 'picked_up',
          description: 'Đã lấy hàng từ người bán'
        })
      }
      
      if (['in_transit', 'out_for_delivery', 'delivered'].includes(status)) {
        progress.push({
          timestamp: new Date(Date.now() - 30*60*60*1000).toISOString(),
          location: 'Trung tâm phân loại TP.HCM',
          status: 'in_transit',
          description: 'Đang vận chuyển đến TP.HCM'
        })
      }
      
      if (['out_for_delivery', 'delivered'].includes(status)) {
        progress.push({
          timestamp: new Date(Date.now() - 12*60*60*1000).toISOString(),
          location: 'Chi nhánh Quận 1',
          status: 'out_for_delivery',
          description: 'Đang giao đến bạn'
        })
      }
      
      if (status === 'delivered') {
        progress.push({
          timestamp: new Date().toISOString(),
          location: 'Địa chỉ nhận hàng',
          status: 'delivered',
          description: 'Đã giao thành công'
        })
      }
    }
    
    return {
      trackingNumber,
      provider,
      status,
      statusDescription,
      progress
    }
  }
}