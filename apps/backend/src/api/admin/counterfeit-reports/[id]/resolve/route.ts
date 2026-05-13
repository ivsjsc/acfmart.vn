import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import {
  QR_VERIFICATION_MODULE,
  QrVerificationModuleService,
} from "../../../../../modules/qr-verification"
import { VENDOR_MODULE, VendorModuleService } from "../../../../../modules/vendor"
import { LOYALTY_MODULE, LoyaltyModuleService } from "../../../../../modules/loyalty"

const schema = z.object({
  verdict: z.enum(["verified", "rejected", "resolved"]),
  resolution: z.string().min(10).max(2000),
  response_to_reporter: z.string().max(2000).optional(),
  reward_points: z.number().int().min(0).max(10_000).default(0),
  suspend_vendor: z.boolean().default(false),
})

/**
 * POST /admin/counterfeit-reports/:id/resolve
 * Moderator đóng case + (tuỳ chọn) thưởng người báo cáo + suspend vendor.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const id = req.params.id as string
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: parsed.error.flatten(),
    })
  }

  const qrService = req.scope.resolve<QrVerificationModuleService>(QR_VERIFICATION_MODULE)
  const vendorService = req.scope.resolve<VendorModuleService>(VENDOR_MODULE)
  const loyaltyService = req.scope.resolve<LoyaltyModuleService>(LOYALTY_MODULE)

  let report
  try {
    report = await qrService.retrieveCounterfeitReport(id)
  } catch {
    return res.status(404).json({ message: "Không tìm thấy báo cáo" })
  }

  const updated = await qrService.updateCounterfeitReports({
    id,
    status: parsed.data.verdict,
    resolution: parsed.data.resolution,
    response_to_reporter: parsed.data.response_to_reporter,
    resolved_at: new Date(),
    reward_points: parsed.data.reward_points,
  })

  // Suspend vendor nếu yêu cầu
  if (parsed.data.suspend_vendor && report.vendor_id) {
    await vendorService.suspendVendor(
      report.vendor_id,
      `Vi phạm chống hàng giả: ${parsed.data.resolution}`
    )
  }

  // Thưởng điểm cho người báo cáo (nếu verdict = verified)
  if (
    parsed.data.verdict === "verified" &&
    parsed.data.reward_points > 0 &&
    report.reporter_id
  ) {
    try {
      const account = await loyaltyService.getOrCreateAccount(report.reporter_id)
      await loyaltyService.createLoyaltyTransactions({
        type: "earn",
        points: parsed.data.reward_points,
        description: "Thưởng báo cáo hàng giả thành công",
        reference_type: "counterfeit_report",
        reference_id: id,
        account_id: account.id,
      })
      await loyaltyService.updateLoyaltyAccounts({
        id: account.id,
        balance: account.balance + parsed.data.reward_points,
        total_earned: account.total_earned + parsed.data.reward_points,
      })
    } catch (err) {
      console.error("Failed to reward reporter:", err)
    }
  }

  return res.json({
    report: updated,
    message: "Đã giải quyết báo cáo.",
  })
}
