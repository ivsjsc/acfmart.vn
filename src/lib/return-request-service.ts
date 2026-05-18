import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { firestore } from "./firebase"

export interface CreateReturnRequestInput {
  orderId: string
  orderCode: string
  customerId: string
  shopId: string
  items: Array<{
    productId: string
    variantId: string
    title: string
    quantity: number
    price: number
  }>
  reason: string
  description: string
  photoUrls: string[]
  refundMethod: string
  refundAmount: number
}

const returnRequestsCol = collection(firestore, "returnRequests")

export async function createReturnRequest(
  input: CreateReturnRequestInput
): Promise<string> {
  const id = `${input.orderId}_${Date.now()}`
  await setDoc(doc(returnRequestsCol, id), {
    ...input,
    status: "pending",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  await updateDoc(doc(firestore, "orders", input.orderId), {
    status: "return_requested",
    updated_at: serverTimestamp(),
  })

  return id
}
