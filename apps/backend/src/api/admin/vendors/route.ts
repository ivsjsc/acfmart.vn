import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VENDOR_MODULE, VendorModuleService } from "../../../modules/vendor"

/**
 * GET /admin/vendors
 * Moderation queue cho admin xem các vendor cần duyệt.
 *
 * Query params:
 *   status: "pending" | "active" | "suspended" | "rejected" (default: pending)
 *   limit: number (default 50)
 *   offset: number (default 0)
 *   q: search keyword on shop_name / owner_email
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<VendorModuleService>(VENDOR_MODULE)

  const status = (req.query.status as string) ?? "pending"
  const limit = Number(req.query.limit ?? 50)
  const offset = Number(req.query.offset ?? 0)
  const q = req.query.q as string | undefined

  const filters: any = { status }
  if (q) {
    // Medusa list supports searchable fields with $ilike on text columns
    filters.$or = [
      { shop_name: { $ilike: `%${q}%` } },
      { owner_email: { $ilike: `%${q}%` } },
    ]
  }

  const [vendors, count] = await service.listAndCountVendors(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  // Aggregate counts per status for sidebar badges
  const statuses = ["pending", "active", "suspended", "rejected"] as const
  const counts: Record<string, number> = {}
  for (const s of statuses) {
    const [, c] = await service.listAndCountVendors({ status: s })
    counts[s] = c
  }

  return res.json({
    vendors,
    count,
    counts,
    limit,
    offset,
  })
}
