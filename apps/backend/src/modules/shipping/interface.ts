export interface ShippingRateRequest {
  from_district_id: number;
  to_district_id: number;
  to_ward_code: string;
  height?: number;
  length?: number;
  width?: number;
  weight: number;
  insurance_value?: number;
  service_id?: number;
  service_type_id?: number;
}

export interface ShippingRateResponse {
  service_id: number;
  service_type_id: number;
  name: string;
  fee: number;
  estimated_delivery_time: number;
}

export interface ShippingOrderRequest {
  to_name: string;
  to_phone: string;
  to_address: string;
  to_ward_code: string;
  to_district_id: number;
  to_province_id: number;
  weight: number;
  cod_amount: number;
  content: string;
  service_type_id: number;
  payment_type_id: number;
  required_note: string;
  items: Array<{
    name: string;
    code?: string;
    quantity: number;
    price?: number;
    weight: number;
    length?: number;
    height?: number;
    width?: number;
  }>;
}

export interface ShippingOrderResponse {
  order_code: string;
  fee: number;
  estimated_delivery_time: string;
  pick_option?: number;
  deliver_option?: number;
  status: string;
  leadtime: number;
}

export interface TrackingResponse {
  order_code: string;
  status: string;
  current_location: string;
  history: Array<{
    status: string;
    location: string;
    time: string;
    note: string;
  }>;
}

export interface ShippingAdapter {
  calculateRates(request: ShippingRateRequest): Promise<ShippingRateResponse[]>;
  createShipment(request: ShippingOrderRequest): Promise<ShippingOrderResponse>;
  trackShipment(orderCode: string): Promise<TrackingResponse>;
  cancelShipment(orderCode: string): Promise<boolean>;
}