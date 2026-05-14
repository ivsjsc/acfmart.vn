import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

/**
 * Upload a file to Firebase Storage and return its download URL.
 * Path: seller-docs/{userId}/{timestamp}_{filename}
 */
export async function uploadSellerDocument(
  file: File,
  userId: string,
  folder = "seller-docs"
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `${folder}/${userId}/${Date.now()}_${safeName}`
  const storageRef = ref(storage, path)

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  })

  return getDownloadURL(snapshot.ref)
}
