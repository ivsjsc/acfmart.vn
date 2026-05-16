import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { firestore } from "./firebase"

export interface PlatformSettings {
  maintenance_enabled: boolean
  maintenance_message: string
  support_email: string
  /** Thông báo hiển thị khu vực QR (tuỳ app consume) */
  qr_help_message?: string
  updated_at?: Timestamp
}

const PLATFORM_REF = doc(firestore, "systemSettings", "platform")

export function defaultPlatformSettings(): PlatformSettings {
  return {
    maintenance_enabled: false,
    maintenance_message: "",
    support_email: "support@acfmart.vn",
    qr_help_message: "",
  }
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const snap = await getDoc(PLATFORM_REF)
  if (!snap.exists()) {
    return defaultPlatformSettings()
  }
  const data = snap.data()
  return {
    ...defaultPlatformSettings(),
    ...data,
  } as PlatformSettings
}

export async function savePlatformSettings(
  patch: Partial<PlatformSettings>,
): Promise<void> {
  await setDoc(
    PLATFORM_REF,
    {
      ...patch,
      updated_at: serverTimestamp(),
    },
    { merge: true },
  )
}
