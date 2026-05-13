import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  QR_VERIFICATION_MODULE,
  QrVerificationModuleService,
} from "../../../modules/qr-verification"

/**
 * GET /admin/counterfeit-reports
 * Moderation queue cho counterfeit reports.
 *
 * Query: status=submitted|investigating|verified|rejected|resolved
 *        severity=low|medium|high|critical
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve<QrVerificationModuleService>(QR_VERIFICATION_MODULE)

  const status = (req.query.status as string) ?? "submitted"
  const severity = req.query.severity as string | undefined
  const limit = Number(req.query.limit ?? 50)
  const offset = Number(req.query.offset ?? 0)

  const filters: any = { status }
  if (severity) filters.severity = severity

  const [reports, count] = await service.listAndCountCounterfeitReports(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  const statuses = ["submitted", "investigating", "verified", "rejected", "resolved"]
  const counts: Record<string, number> = {}
  for (const s of statuses) {
    const [, c] = await service.listAndCountCounterfeitReports({ status: s })
    counts[s] = c
  }

  return res.json({ reports, count, counts, limit, offset })
}
