import { useEffect, useState } from "react"
import {
  subscribeSellerOrders,
  type OrderDoc,
} from "../lib/order-service"
import { sanitizeUserError } from "../lib/error-utils"
import type { SellerOrderStatus } from "../features/seller/types"

/**
 * Realtime stream of orders belonging to a shop. Returns the full list +
 * loading/error state. Caller filters by status or derives counters.
 */
export function useSellerOrders(shopId: string | null | undefined): {
  orders: OrderDoc[]
  loading: boolean
  error: string | null
} {
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shopId) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const unsub = subscribeSellerOrders(
      { shopId },
      (next) => {
        setOrders(next)
        setLoading(false)
      },
      (err) => {
        setError(sanitizeUserError(err, "Không tải được danh sách đơn hàng."))
        setLoading(false)
      }
    )
    return () => unsub()
  }, [shopId])

  return { orders, loading, error }
}

export interface SellerOrderCounts {
  awaitingConfirm: number
  awaitingPack: number
  shipping: number
  completed: number
  cancelled: number
  returnRequests: number
  total: number
}

const EMPTY_COUNTS: SellerOrderCounts = {
  awaitingConfirm: 0,
  awaitingPack: 0,
  shipping: 0,
  completed: 0,
  cancelled: 0,
  returnRequests: 0,
  total: 0,
}

export function deriveSellerOrderCounts(orders: OrderDoc[]): SellerOrderCounts {
  const counts: SellerOrderCounts = { ...EMPTY_COUNTS, total: orders.length }
  for (const o of orders) {
    const status: SellerOrderStatus = o.status
    if (status === "awaiting_confirm" || status === "payment_pending") counts.awaitingConfirm++
    else if (status === "confirmed") counts.awaitingPack++
    else if (status === "packed" || status === "ready_pickup" || status === "shipping")
      counts.shipping++
    else if (status === "delivered" || status === "completed") counts.completed++
    else if (status === "cancelled") counts.cancelled++
    else if (
      status === "return_requested" ||
      status === "returned" ||
      status === "refunded"
    )
      counts.returnRequests++
  }
  return counts
}

export function deriveRevenueByDay(
  orders: OrderDoc[],
  daysBack: number
): { date: string; revenue: number; orders: number }[] {
  const buckets = new Map<string, { revenue: number; orders: number }>()
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000

  // Pre-fill buckets so chart shows continuous range even when no orders.
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    buckets.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 })
  }

  for (const o of orders) {
    const ms = o.created_at?.toMillis?.() ?? 0
    if (ms < cutoff) continue
    // Only count revenue from non-cancelled/non-returned orders
    if (o.status === "cancelled" || o.status === "returned" || o.status === "refunded") continue
    const key = new Date(ms).toISOString().slice(0, 10)
    const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 }
    bucket.revenue += o.total
    bucket.orders += 1
    buckets.set(key, bucket)
  }

  return Array.from(buckets.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
