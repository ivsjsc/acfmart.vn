import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import { writeAuditLog } from "./audit-log"

export interface VendorDoc {
  id: string
  firebase_uid: string
  shop_name: string
  shop_slug: string
  shop_logo: string | null
  shop_banner: string | null
  description: string | null
  owner_name: string
  owner_email: string
  owner_phone: string
  business_type: "individual" | "household" | "company"
  status: "pending" | "active" | "suspended" | "rejected"
  kyc_level: "none" | "basic" | "verified" | "premium"
  rejected_reason: string | null
  verified_at: Timestamp | null
  tax_code: string | null
  id_card_number: string | null
  pickup_address: {
    full_address: string
    ward: string
    district: string
    city: string
  }
  bank_name: string | null
  bank_account_number: string | null
  bank_account_holder: string | null
  documents: Array<{
    type: string
    file_url: string
    file_name?: string
    mime_type?: string
    uploaded_at: string
  }>
  total_orders: number
  total_revenue: number
  follower_count: number
  avg_rating: number
  on_time_shipping_rate: number
  created_at: Timestamp
  updated_at: Timestamp
}

const vendorsCol = collection(firestore, "vendors")

async function waitForAuthReady() {
  await auth.authStateReady()
}

export async function getMyVendor(
  firebaseUid: string
): Promise<{ vendor: VendorDoc | null; registered: boolean }> {
  await waitForAuthReady()
  const q = query(vendorsCol, where("firebase_uid", "==", firebaseUid), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return { vendor: null, registered: false }
  const vendorDoc = snap.docs[0]
  return {
    vendor: { id: vendorDoc.id, ...vendorDoc.data() } as VendorDoc,
    registered: true,
  }
}

export interface RegisterVendorInput {
  firebase_uid: string
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
  }>
}

export async function registerVendor(
  input: RegisterVendorInput
): Promise<VendorDoc> {
  await waitForAuthReady()
  const vendorRef = doc(vendorsCol)
  const now = Timestamp.now()
  const vendor: Omit<VendorDoc, "id"> = {
    firebase_uid: input.firebase_uid,
    shop_name: input.shop_name,
    shop_slug: input.shop_slug,
    shop_logo: null,
    shop_banner: null,
    description: input.description ?? null,
    owner_name: input.owner_name,
    owner_email: input.owner_email,
    owner_phone: input.owner_phone,
    business_type: input.business_type,
    status: "pending",
    kyc_level: "none",
    rejected_reason: null,
    verified_at: null,
    tax_code: input.tax_code ?? null,
    id_card_number: input.id_card_number ?? null,
    pickup_address: input.pickup_address,
    bank_name: input.bank_name ?? null,
    bank_account_number: input.bank_account_number ?? null,
    bank_account_holder: input.bank_account_holder ?? null,
    documents: (input.documents ?? []).map((d) => ({
      ...d,
      uploaded_at: new Date().toISOString(),
    })),
    total_orders: 0,
    total_revenue: 0,
    follower_count: 0,
    avg_rating: 0,
    on_time_shipping_rate: 0,
    created_at: now,
    updated_at: now,
  }

  await setDoc(vendorRef, vendor)

  await writeAuditLog({
    action: "vendor_register",
    actor_id: input.firebase_uid,
    actor_email: input.owner_email,
    actor_role: "customer",
    target_type: "vendor",
    target_id: vendorRef.id,
    details: {
      shop_name: input.shop_name,
      business_type: input.business_type,
    },
  })

  return { id: vendorRef.id, ...vendor }
}

export async function listVendors(params: {
  status?: VendorDoc["status"]
  q?: string
  limitCount?: number
  offset?: number
}): Promise<{ vendors: VendorDoc[]; count: number }> {
  await waitForAuthReady()
  const constraints = []
  if (params.status) constraints.push(where("status", "==", params.status))
  if (!params.status) {
    constraints.push(orderBy("created_at", "desc"))
    if (params.limitCount) constraints.push(limit(params.limitCount))
  }

  const q = query(vendorsCol, ...constraints)
  const snap = await getDocs(q)
  const vendors = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as VendorDoc))
    .sort((a, b) => timestampToMs(b.created_at) - timestampToMs(a.created_at))

  if (params.q) {
    const search = params.q.toLowerCase()
    return {
      vendors: vendors.filter(
        (v) =>
          v.shop_name.toLowerCase().includes(search) ||
          v.owner_name.toLowerCase().includes(search) ||
          v.owner_email.toLowerCase().includes(search)
      ),
      count: vendors.length,
    }
  }

  return { vendors, count: vendors.length }
}

function timestampToMs(value: Timestamp | null | undefined): number {
  return value?.toMillis?.() ?? 0
}

async function syncApprovedSellerRole(
  vendor: VendorDoc,
  moderator: { id: string; email: string; role: string }
) {
  try {
    const userRef = doc(firestore, "users", vendor.firebase_uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return

    const oldRole = userSnap.data()?.role ?? "customer"
    if (["owner", "admin", "moderator"].includes(oldRole)) return

    await setDoc(
      userRef,
      {
        role: "seller",
        email: vendor.owner_email,
        name: vendor.owner_name,
        phone: vendor.owner_phone,
        seller_vendor_id: vendor.id,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    )

    await writeAuditLog({
      action: "role_change",
      actor_id: moderator.id,
      actor_email: moderator.email,
      actor_role: moderator.role,
      target_type: "user",
      target_id: vendor.firebase_uid,
      details: {
        old_role: oldRole,
        new_role: "seller",
        source: "vendor_approve",
        vendor_id: vendor.id,
      },
    })
  } catch (err) {
    console.warn("[syncApprovedSellerRole] role sync skipped:", err)
  }
}

export async function approveVendor(
  vendorId: string,
  moderator: { id: string; email: string; role: string },
  note?: string,
  kycLevel: VendorDoc["kyc_level"] = "verified"
) {
  const vendorRef = doc(vendorsCol, vendorId)
  const vendorSnap = await getDoc(vendorRef)
  if (!vendorSnap.exists()) {
    throw new Error("Không tìm thấy hồ sơ seller")
  }
  const vendor = { id: vendorSnap.id, ...vendorSnap.data() } as VendorDoc

  await updateDoc(vendorRef, {
    status: "active",
    kyc_level: kycLevel,
    verified_at: serverTimestamp(),
    rejected_reason: null,
    updated_at: serverTimestamp(),
  })

  await writeAuditLog({
    action: "vendor_approve",
    actor_id: moderator.id,
    actor_email: moderator.email,
    actor_role: moderator.role,
    target_type: "vendor",
    target_id: vendorId,
    details: { note, kyc_level: kycLevel },
  })

  await syncApprovedSellerRole(vendor, moderator)
}

export async function rejectVendor(
  vendorId: string,
  moderator: { id: string; email: string; role: string },
  reason: string
) {
  const vendorRef = doc(vendorsCol, vendorId)
  await updateDoc(vendorRef, {
    status: "rejected",
    rejected_reason: reason,
    updated_at: serverTimestamp(),
  })

  await writeAuditLog({
    action: "vendor_reject",
    actor_id: moderator.id,
    actor_email: moderator.email,
    actor_role: moderator.role,
    target_type: "vendor",
    target_id: vendorId,
    details: { reason },
  })
}

export async function suspendVendor(
  vendorId: string,
  moderator: { id: string; email: string; role: string },
  reason: string
) {
  const vendorRef = doc(vendorsCol, vendorId)
  await updateDoc(vendorRef, {
    status: "suspended",
    rejected_reason: reason,
    updated_at: serverTimestamp(),
  })

  await writeAuditLog({
    action: "vendor_suspend",
    actor_id: moderator.id,
    actor_email: moderator.email,
    actor_role: moderator.role,
    target_type: "vendor",
    target_id: vendorId,
    details: { reason },
  })
}
