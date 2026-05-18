import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { firestore } from "./firebase"
import type { User } from "../stores/auth-store"

export const DATA_PROTECTION_POLICY_VERSION = "2026-05-18"

export type PrivacySettingKey =
  | "public_reviews"
  | "aivy_personalization"
  | "analytics_cookies"
  | "marketing_cookies"
  | "marketing_messages"
  | "profiling_opt_out"
  | "cross_border_sharing"

export type DataRightsRequestType =
  | "access"
  | "rectification"
  | "erasure"
  | "portability"
  | "restriction"
  | "objection"
  | "withdraw_consent"

export type DataRightsRequestStatus =
  | "pending"
  | "reviewing"
  | "completed"
  | "rejected"
  | "cancelled"

export interface PrivacySettings extends Record<PrivacySettingKey, boolean> {
  user_id: string
  policy_version: string
  created_at?: Timestamp
  updated_at?: Timestamp
}

export interface DataRightsRequest {
  id: string
  user_id: string
  type: DataRightsRequestType
  status: DataRightsRequestStatus
  description: string
  contact_email: string | null
  policy_version: string
  source: "account_privacy_settings"
  admin_note?: string
  created_at?: Timestamp
  updated_at?: Timestamp
  processed_at?: Timestamp | null
}

export const DEFAULT_PRIVACY_CHOICES: Record<PrivacySettingKey, boolean> = {
  public_reviews: true,
  aivy_personalization: true,
  analytics_cookies: false,
  marketing_cookies: false,
  marketing_messages: false,
  profiling_opt_out: false,
  cross_border_sharing: false,
}

function privacySettingsRef(userId: string) {
  return doc(firestore, "users", userId, "privacySettings", "current")
}

function dataRightsRequestsRef(userId: string) {
  return collection(firestore, "users", userId, "dataRightsRequests")
}

function normalizePrivacySettings(
  userId: string,
  data?: Partial<PrivacySettings>
): PrivacySettings {
  return {
    user_id: userId,
    policy_version: DATA_PROTECTION_POLICY_VERSION,
    ...DEFAULT_PRIVACY_CHOICES,
    ...data,
  }
}

export function subscribePrivacySettings(
  userId: string,
  onData: (settings: PrivacySettings) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    privacySettingsRef(userId),
    (snap) => {
      onData(
        normalizePrivacySettings(
          userId,
          snap.exists() ? (snap.data() as Partial<PrivacySettings>) : undefined
        )
      )
    },
    (err) => onError(err)
  )
}

export async function savePrivacySettings(
  userId: string,
  patch: Partial<Record<PrivacySettingKey, boolean>>
): Promise<void> {
  const ref = privacySettingsRef(userId)
  const snap = await getDoc(ref)
  const firstWrite = !snap.exists()

  await setDoc(
    ref,
    {
      ...(firstWrite ? DEFAULT_PRIVACY_CHOICES : {}),
      ...patch,
      user_id: userId,
      policy_version: DATA_PROTECTION_POLICY_VERSION,
      ...(firstWrite ? { created_at: serverTimestamp() } : {}),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  )
}

export function subscribeDataRightsRequests(
  userId: string,
  onData: (requests: DataRightsRequest[]) => void,
  onError: (err: Error) => void,
  maxCount = 10
): Unsubscribe {
  const q = query(
    dataRightsRequestsRef(userId),
    orderBy("created_at", "desc"),
    limit(maxCount)
  )

  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<DataRightsRequest, "id">),
        }))
      )
    },
    (err) => onError(err)
  )
}

export async function createDataRightsRequest(input: {
  userId: string
  type: DataRightsRequestType
  contactEmail?: string | null
  description?: string
}): Promise<string> {
  const ref = doc(dataRightsRequestsRef(input.userId))
  await setDoc(ref, {
    user_id: input.userId,
    type: input.type,
    status: "pending",
    description: input.description?.trim() ?? "",
    contact_email: input.contactEmail?.trim() || null,
    policy_version: DATA_PROTECTION_POLICY_VERSION,
    source: "account_privacy_settings",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  return ref.id
}

function timestampToIso(value?: Timestamp | null): string | null {
  if (!value) return null
  return value.toDate().toISOString()
}

export function buildPortableAccountData(input: {
  user: User
  privacySettings: PrivacySettings
  requests: DataRightsRequest[]
}): string {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      policy_version: DATA_PROTECTION_POLICY_VERSION,
      account: {
        id: input.user.id,
        email: input.user.email,
        name: input.user.name,
        phone: input.user.phone ?? null,
        role: input.user.role,
        is_verified: input.user.isVerified,
      },
      privacy_settings: {
        public_reviews: input.privacySettings.public_reviews,
        aivy_personalization: input.privacySettings.aivy_personalization,
        analytics_cookies: input.privacySettings.analytics_cookies,
        marketing_cookies: input.privacySettings.marketing_cookies,
        marketing_messages: input.privacySettings.marketing_messages,
        profiling_opt_out: input.privacySettings.profiling_opt_out,
        cross_border_sharing: input.privacySettings.cross_border_sharing,
        updated_at: timestampToIso(input.privacySettings.updated_at),
      },
      data_rights_requests: input.requests.map((request) => ({
        id: request.id,
        type: request.type,
        status: request.status,
        description: request.description,
        created_at: timestampToIso(request.created_at),
        updated_at: timestampToIso(request.updated_at),
      })),
      note:
        "Day la ban tom tat du lieu tai khoan hien co tren thiet bi. De xuat day du du lieu giao dich, don hang, vi va ho so KYC, vui long gui yeu cau xuat du lieu tu trang Quyen rieng tu.",
    },
    null,
    2
  )
}
