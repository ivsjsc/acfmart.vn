import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore"
import { firestore } from "./firebase"

export interface CategoryRequestInput {
  shopId: string
  vendorId: string
  shopName: string
  requestedName: string
  note?: string
  productTitle?: string
  currentCategory?: string
}

const categoryRequestsCol = collection(firestore, "categoryRequests")

export async function requestProductCategory(input: CategoryRequestInput) {
  const requestedName = input.requestedName.trim()
  if (requestedName.length < 3) {
    throw new Error("Tên danh mục đề xuất tối thiểu 3 ký tự")
  }

  const requestRef = doc(categoryRequestsCol)
  await setDoc(requestRef, {
    shopId: input.shopId,
    vendorId: input.vendorId,
    shopName: input.shopName,
    requestedName,
    note: input.note?.trim() || null,
    productTitle: input.productTitle?.trim() || null,
    currentCategory: input.currentCategory?.trim() || null,
    status: "pending",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  return requestRef.id
}
