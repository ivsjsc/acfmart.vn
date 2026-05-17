import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import {
  serviceErr,
  serviceOk,
  toServiceError,
  type ServiceResult,
} from "./service-result"

export type AddressLabel = "home" | "office" | "other"

export interface UserAddress {
  id: string
  label: AddressLabel
  name: string
  phone: string
  address: string
  ward: string
  district: string
  city: string
  isDefault: boolean
  created_at: string
  updated_at: string | null
}

export interface SaveAddressInput {
  label: AddressLabel
  name: string
  phone: string
  address: string
  ward?: string
  district?: string
  city?: string
  isDefault?: boolean
}

const ADDRESS_LABELS: AddressLabel[] = ["home", "office", "other"]

async function requireCurrentUid(expectedUid?: string): Promise<string> {
  await auth.authStateReady()
  const currentUid = auth.currentUser?.uid
  if (!currentUid) throw new Error("Bạn cần đăng nhập để quản lý địa chỉ")
  if (expectedUid && expectedUid !== currentUid) {
    throw new Error("Bạn không có quyền truy cập sổ địa chỉ này")
  }
  return expectedUid ?? currentUid
}

function addressesRef(uid: string) {
  return collection(firestore, "users", uid, "addresses")
}

function addressRef(uid: string, addressId: string) {
  return doc(firestore, "users", uid, "addresses", addressId)
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asTimestampIso(value: unknown, fallback = new Date(0).toISOString()): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string" && value.trim()) return value
  return fallback
}

function normalizeLabel(value: unknown): AddressLabel {
  return ADDRESS_LABELS.includes(value as AddressLabel)
    ? (value as AddressLabel)
    : "other"
}

function normalizeAddress(id: string, data: DocumentData): UserAddress {
  return {
    id,
    label: normalizeLabel(data.label),
    name: asString(data.name),
    phone: asString(data.phone),
    address: asString(data.address),
    ward: asString(data.ward),
    district: asString(data.district),
    city: asString(data.city),
    isDefault: data.isDefault === true || data.is_default === true,
    created_at: asTimestampIso(data.created_at ?? data.createdAt),
    updated_at:
      data.updated_at || data.updatedAt
        ? asTimestampIso(data.updated_at ?? data.updatedAt)
        : null,
  }
}

function validateAddress(input: SaveAddressInput): string | null {
  if (!input.name.trim()) return "Họ tên không được trống"
  if (!input.phone.trim()) return "Số điện thoại không được trống"
  if (!/^[0-9+()\-\s]{8,20}$/.test(input.phone.trim())) {
    return "Số điện thoại không hợp lệ"
  }
  if (!input.address.trim()) return "Địa chỉ không được trống"
  if (!ADDRESS_LABELS.includes(input.label)) return "Loại địa chỉ không hợp lệ"
  return null
}

function toFirestoreAddress(input: SaveAddressInput) {
  return {
    label: input.label,
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    ward: input.ward?.trim() ?? "",
    district: input.district?.trim() ?? "",
    city: input.city?.trim() ?? "",
    isDefault: input.isDefault === true,
  }
}

export async function listAddresses(
  uid?: string,
  limitCount = 50
): Promise<ServiceResult<{ addresses: UserAddress[] }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const snap = await getDocs(
      query(addressesRef(currentUid), orderBy("created_at", "desc"), limit(limitCount))
    )
    const addresses = snap.docs
      .map((addressDoc) => normalizeAddress(addressDoc.id, addressDoc.data()))
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))

    return serviceOk({ addresses })
  } catch (err) {
    return toServiceError(err, "Không thể tải sổ địa chỉ")
  }
}

export async function addAddress(
  input: SaveAddressInput,
  uid?: string
): Promise<ServiceResult<{ address: UserAddress }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const validation = validateAddress(input)
    if (validation) return serviceErr("invalid-address", validation)

    const ref = doc(addressesRef(currentUid))
    const now = Timestamp.now()
    const data = {
      ...toFirestoreAddress(input),
      created_at: now,
      updated_at: serverTimestamp(),
    }

    await runTransaction(firestore, async (tx) => {
      if (data.isDefault) {
        const current = await getDocs(addressesRef(currentUid))
        current.docs.forEach((addressDoc) => {
          tx.update(addressDoc.ref, {
            isDefault: false,
            updated_at: serverTimestamp(),
          })
        })
      }
      tx.set(ref, data)
    })

    return serviceOk({ address: normalizeAddress(ref.id, data) })
  } catch (err) {
    return toServiceError(err, "Không thể thêm địa chỉ")
  }
}

export async function updateAddress(
  addressId: string,
  input: SaveAddressInput,
  uid?: string
): Promise<ServiceResult<{ address: UserAddress }>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    const validation = validateAddress(input)
    if (validation) return serviceErr("invalid-address", validation)

    const ref = addressRef(currentUid, addressId)
    const data = {
      ...toFirestoreAddress(input),
      updated_at: serverTimestamp(),
    }

    await runTransaction(firestore, async (tx) => {
      const existing = await tx.get(ref)
      if (!existing.exists()) throw new Error("Địa chỉ không tồn tại")

      if (data.isDefault) {
        const current = await getDocs(addressesRef(currentUid))
        current.docs.forEach((addressDoc) => {
          if (addressDoc.id !== addressId) {
            tx.update(addressDoc.ref, {
              isDefault: false,
              updated_at: serverTimestamp(),
            })
          }
        })
      }

      tx.update(ref, data)
    })

    return serviceOk({
      address: normalizeAddress(addressId, {
        ...data,
        created_at: new Date().toISOString(),
      }),
    })
  } catch (err) {
    return toServiceError(err, "Không thể cập nhật địa chỉ")
  }
}

export async function setDefaultAddress(
  addressId: string,
  uid?: string
): Promise<ServiceResult<void>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    await runTransaction(firestore, async (tx) => {
      const snap = await getDocs(addressesRef(currentUid))
      let found = false
      snap.docs.forEach((addressDoc) => {
        if (addressDoc.id === addressId) found = true
        tx.update(addressDoc.ref, {
          isDefault: addressDoc.id === addressId,
          updated_at: serverTimestamp(),
        })
      })
      if (!found) throw new Error("Địa chỉ không tồn tại")
    })
    return serviceOk(undefined)
  } catch (err) {
    return toServiceError(err, "Không thể đặt địa chỉ mặc định")
  }
}

export async function deleteAddress(
  addressId: string,
  uid?: string
): Promise<ServiceResult<void>> {
  try {
    const currentUid = await requireCurrentUid(uid)
    await deleteDoc(addressRef(currentUid, addressId))
    return serviceOk(undefined)
  } catch (err) {
    return toServiceError(err, "Không thể xoá địa chỉ")
  }
}

export async function addOrUpdateAddress(
  addressId: string | null,
  input: SaveAddressInput,
  uid?: string
): Promise<ServiceResult<{ address: UserAddress }>> {
  if (addressId) return updateAddress(addressId, input, uid)
  return addAddress(input, uid)
}
