import { httpsCallable } from "firebase/functions"
import { functions } from "./firebase"

export interface RegisterShipmentInput {
  orderCode: string
  trackingNumber: string
  providerId: string
  providerName?: string
  serviceCode?: string
  fee?: number
  pickupDate?: string
  estimatedDeliveryDate?: string
  labelUrl?: string
  paymentStatus?: "paid" | "cod"
  statusCode?: number
  statusText?: string
  note?: string
}

export interface RegisterShipmentResult {
  success: boolean
  orderCode: string
  trackingNumber: string
  updatedCount: number
}

export async function registerShipment(
  input: RegisterShipmentInput
): Promise<RegisterShipmentResult> {
  const callable = httpsCallable<RegisterShipmentInput, RegisterShipmentResult>(
    functions,
    "registerShipment"
  )
  const result = await callable(input)
  return result.data
}
