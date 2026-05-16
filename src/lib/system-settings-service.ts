import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"

export interface SystemSettingsDoc {
  platformName: string
  supportEmail: string
  hotline: string
  maintenanceMode: boolean
  sellerAutoApprove: boolean
  sellerReviewSlaHours: number
  productReviewSlaHours: number
  requireAcfVerificationForPublishing: boolean
  maxImagesPerProduct: number
  enabledPaymentMethods: string[]
  enabledShippingProviders: string[]
  updated_at?: unknown
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsDoc = {
  platformName: "ACFMart",
  supportEmail: "support@acfmart.vn",
  hotline: "1900 066 689",
  maintenanceMode: false,
  sellerAutoApprove: false,
  sellerReviewSlaHours: 48,
  productReviewSlaHours: 48,
  requireAcfVerificationForPublishing: false,
  maxImagesPerProduct: 9,
  enabledPaymentMethods: ["cod", "vnpay", "momo", "zalopay", "wallet"],
  enabledShippingProviders: ["ghn", "ghtk"],
}

const settingsRef = doc(firestore, "systemSettings", "platform")

function normalizeSettings(data: Partial<SystemSettingsDoc> | undefined): SystemSettingsDoc {
  return {
    ...DEFAULT_SYSTEM_SETTINGS,
    ...(data ?? {}),
    enabledPaymentMethods: Array.isArray(data?.enabledPaymentMethods)
      ? data.enabledPaymentMethods.filter((item): item is string => typeof item === "string")
      : DEFAULT_SYSTEM_SETTINGS.enabledPaymentMethods,
    enabledShippingProviders: Array.isArray(data?.enabledShippingProviders)
      ? data.enabledShippingProviders.filter((item): item is string => typeof item === "string")
      : DEFAULT_SYSTEM_SETTINGS.enabledShippingProviders,
  }
}

export function subscribeSystemSettings(
  onData: (settings: SystemSettingsDoc) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    settingsRef,
    (snap) => {
      onData(normalizeSettings(snap.exists() ? snap.data() : undefined))
    },
    (err) => {
      console.error("[subscribeSystemSettings] Firestore error:", err)
      onError(err)
    }
  )
}

export async function saveSystemSettings(
  patch: Partial<SystemSettingsDoc>,
  actor: { id: string; email: string; role: string }
): Promise<void> {
  await setDoc(
    settingsRef,
    {
      ...patch,
      updated_at: serverTimestamp(),
      updated_by: actor.id,
    },
    { merge: true }
  )

  await writeAuditLog({
    action: "settings_change",
    actor_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    target_type: "systemSettings",
    target_id: "platform",
    details: { fields: Object.keys(patch) },
  })
}
