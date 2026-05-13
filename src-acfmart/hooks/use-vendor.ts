import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../lib/acfmart-api"
import { useAuthStore } from "../stores/auth-store"

export interface VendorRecord {
  id: string
  shop_name: string
  shop_slug: string
  shop_logo: string | null
  shop_banner: string | null
  description: string | null
  owner_name: string
  owner_email: string
  owner_phone: string
  firebase_uid: string | null
  business_type: "individual" | "household" | "company"
  status: "pending" | "active" | "suspended" | "rejected"
  kyc_level: "none" | "basic" | "verified" | "premium"
  rejected_reason: string | null
  verified_at: string | null
  pickup_address: any
  bank_name: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  total_orders: number
  total_revenue: number
  follower_count: number
  avg_rating: number
  on_time_shipping_rate: number
}

export interface RegisterVendorPayload {
  shop_name: string
  shop_slug: string
  description?: string
  owner_name: string
  owner_email: string
  owner_phone: string
  business_type: "individual" | "household" | "company"
  tax_code?: string
  id_card_number?: string
  pickup_address: {
    full_address: string
    ward: string
    district: string
    city: string
  }
  bank_name?: string
  bank_account_number?: string
  bank_account_holder?: string
  documents?: Array<{
    type: string
    file_url: string
    file_name?: string
    mime_type?: string
    file_size?: number
  }>
}

/** Get current logged-in user's vendor record (if any) */
export function useMyVendor() {
  const firebaseUid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["vendor", "me", firebaseUid],
    enabled: !!firebaseUid,
    queryFn: () =>
      apiClient.get<{ vendor: VendorRecord | null; registered: boolean }>(
        "/store/vendors/me",
        { params: { firebase_uid: firebaseUid } }
      ),
  })
}

/** Register as a new vendor */
export function useRegisterVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterVendorPayload) =>
      apiClient.post<{ vendor: VendorRecord; message: string }>(
        "/store/vendors/register",
        payload,
        { authRequired: true }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "me"] })
    },
  })
}
