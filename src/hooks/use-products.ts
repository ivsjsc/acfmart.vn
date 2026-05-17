import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../stores/auth-store"
import {
  approveProduct,
  archiveProduct,
  getApprovedProductByHandle,
  getModerationCounts,
  getProduct,
  listApprovedProducts,
  listModerationProducts,
  listSellerProducts,
  rejectProduct,
  resubmitProduct,
  saveDraftProduct,
  submitProduct,
  updateProduct,
  type ProductDoc,
  type ProductStatus,
  type SubmitProductInput,
} from "../lib/product-service"

export type { ProductDoc, ProductStatus, SubmitProductInput }

// ─── Seller hooks ─────────────────────────────────────────────────────

/** Seller: list own products by status. */
export function useSellerProducts(params: {
  status?: ProductStatus
  q?: string
  limit?: number
}) {
  const firebaseUid = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["seller", "products", firebaseUid, params],
    enabled: !!firebaseUid,
    queryFn: () =>
      listSellerProducts({
        shopId: firebaseUid!,
        status: params.status,
        q: params.q,
        limitCount: params.limit ?? 100,
      }),
  })
}

/** Seller: save product as draft (not submitted to admin). */
export function useSaveDraftProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitProductInput) => saveDraftProduct(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "products"] })
    },
  })
}

/** Seller: submit product for admin approval. */
export function useSubmitProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitProductInput) => submitProduct(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "products"] })
      qc.invalidateQueries({ queryKey: ["moderation", "products"] })
    },
  })
}

/** Seller: update an existing product. */
export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      patch: Partial<
        Omit<ProductDoc, "id" | "created_at" | "shopId" | "vendorId">
      >
    }) => updateProduct(input.id, input.patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "products"] })
      qc.invalidateQueries({ queryKey: ["moderation", "products"] })
      qc.invalidateQueries({ queryKey: ["product"] })
    },
  })
}

/** Seller: resubmit a rejected product after fixes. */
export function useResubmitProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => resubmitProduct(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "products"] })
      qc.invalidateQueries({ queryKey: ["moderation", "products"] })
    },
  })
}

/** Seller: archive a product (hide from buyers). */
export function useArchiveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => archiveProduct(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "products"] })
    },
  })
}

// ─── Admin/Moderator hooks ────────────────────────────────────────────

/** Admin: list products by status across all shops. */
export function useModerationProducts(params: {
  status?: ProductStatus
  q?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ["moderation", "products", params],
    queryFn: () =>
      listModerationProducts({
        status: params.status,
        q: params.q,
        limitCount: params.limit ?? 50,
      }),
  })
}

/** Admin: per-status badge counts for sidebar. */
export function useModerationCounts() {
  return useQuery({
    queryKey: ["moderation", "products", "counts"],
    queryFn: () => getModerationCounts(),
    staleTime: 30_000,
  })
}

/** Admin: approve product → status=approved. */
export function useApproveProduct() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (input: { id: string; note?: string }) =>
      approveProduct(
        input.id,
        {
          id: user?.id ?? "",
          email: user?.email ?? "",
          role: user?.role ?? "admin",
        },
        input.note
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation", "products"] })
      qc.invalidateQueries({ queryKey: ["approved", "products"] })
    },
  })
}

/** Admin: reject product with reason. */
export function useRejectProduct() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: (input: { id: string; reason: string }) =>
      rejectProduct(
        input.id,
        {
          id: user?.id ?? "",
          email: user?.email ?? "",
          role: user?.role ?? "admin",
        },
        input.reason
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation", "products"] })
    },
  })
}

// ─── Buyer hooks ──────────────────────────────────────────────────────

/** Buyer: list approved products for browsing. */
export function useApprovedProducts(params: {
  category?: string
  shopId?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ["approved", "products", params],
    queryFn: () =>
      listApprovedProducts({
        category: params.category,
        shopId: params.shopId,
        limitCount: params.limit ?? 60,
      }),
    staleTime: 60_000,
  })
}

/** Buyer: approved product detail by public handle. */
export function useApprovedProductByHandle(handle: string | undefined) {
  return useQuery({
    queryKey: ["approved", "product", handle],
    enabled: !!handle,
    queryFn: () => getApprovedProductByHandle(handle!),
    staleTime: 60_000,
  })
}

/** Single product detail. */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["product", productId],
    enabled: !!productId,
    queryFn: () => getProduct(productId!),
  })
}
