import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, storage } from "./firebase"

const IMAGE_CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
}

function inferContentType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  return IMAGE_CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream"
}

/**
 * Upload a file to Firebase Storage and return its download URL.
 * Path: seller-docs/{userId}/{timestamp}_{filename}
 */
export async function uploadSellerDocument(
  file: File,
  userId: string,
  folder = "seller-docs"
): Promise<string> {
  await auth.authStateReady()
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error("Bạn cần đăng nhập lại trước khi upload file.")
  }
  if (currentUser.uid !== userId) {
    throw new Error("Tài khoản hiện tại không khớp với chủ sở hữu thư mục upload.")
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `${folder}/${userId}/${Date.now()}_${safeName}`
  const storageRef = ref(storage, path)
  const contentType = inferContentType(file)

  const snapshot = await uploadBytes(storageRef, file, {
    contentType,
  })

  return getDownloadURL(snapshot.ref)
}

/**
 * Upload a product image to Firebase Storage.
 * Path: product-images/{shopId}/{timestamp}_{filename}
 */
export async function uploadProductImage(
  file: File,
  shopId: string
): Promise<string> {
  return uploadSellerDocument(file, shopId, "product-images")
}
