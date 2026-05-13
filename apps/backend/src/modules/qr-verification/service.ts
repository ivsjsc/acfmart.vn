import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import { randomBytes } from "node:crypto"
import { VerificationCode, ScanEvent, CounterfeitReport } from "./models"

function generateCode(): string {
  // 12-char alphanumeric uppercase
  return randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 12).toUpperCase()
}

class QrVerificationModuleService extends MedusaService({
  VerificationCode,
  ScanEvent,
  CounterfeitReport,
}) {
  /** Sinh batch code mới cho 1 product variant */
  async generateBatch(input: {
    product_id: string
    variant_id?: string
    vendor_id?: string
    quantity: number
    batch_id?: string
    expires_at?: Date
  }) {
    const batchId = input.batch_id ?? `BATCH-${Date.now()}`
    const codes: Array<{
      code: string
      product_id: string
      variant_id?: string
      vendor_id?: string
      batch_id: string
      serial_number: string
      expires_at?: Date
    }> = []

    for (let i = 0; i < input.quantity; i++) {
      codes.push({
        code: generateCode(),
        product_id: input.product_id,
        variant_id: input.variant_id,
        vendor_id: input.vendor_id,
        batch_id: batchId,
        serial_number: `${batchId}-${String(i + 1).padStart(6, "0")}`,
        expires_at: input.expires_at,
      })
    }

    const created = await this.createVerificationCodes(codes)
    return { batch_id: batchId, codes: created }
  }

  /**
   * Verify một mã QR.
   * Trả về kết quả + risk flags để client hiển thị.
   */
  async verifyCode(input: {
    code: string
    scanner_id?: string
    firebase_uid?: string
    ip_hash?: string
    user_agent?: string
    latitude?: number
    longitude?: number
    city?: string
  }) {
    const [verification] = await this.listVerificationCodes({
      code: input.code.trim().toUpperCase(),
    })

    if (!verification) {
      return { result: "invalid" as const, message: "Mã QR không tồn tại trong hệ thống" }
    }

    if (verification.status === "voided") {
      return {
        result: "voided" as const,
        message: "Mã đã bị thu hồi bởi nhà sản xuất",
        verification,
      }
    }

    if (verification.expires_at && new Date(verification.expires_at) < new Date()) {
      return { result: "expired" as const, message: "Mã đã hết hạn", verification }
    }

    // Risk analysis
    const riskFlags: string[] = []

    // Đã scan trước đó bởi scanner khác
    if (
      verification.first_scanner_id &&
      input.scanner_id &&
      verification.first_scanner_id !== input.scanner_id
    ) {
      riskFlags.push("DIFFERENT_SCANNER")
    }

    // Quá nhiều lần scan
    if (verification.scan_count >= 5) {
      riskFlags.push("EXCESSIVE_SCANS")
    }

    const result: "genuine" | "suspect_counterfeit" =
      riskFlags.length >= 2 ? "suspect_counterfeit" : "genuine"

    // Ghi scan event
    await this.createScanEvents({
      scanner_id: input.scanner_id,
      firebase_uid: input.firebase_uid,
      ip_hash: input.ip_hash,
      user_agent: input.user_agent,
      latitude: input.latitude,
      longitude: input.longitude,
      city: input.city,
      result,
      risk_flags: riskFlags.length ? { flags: riskFlags } : null,
      verification_id: verification.id,
    })

    // Update verification stats
    await this.updateVerificationCodes({
      id: verification.id,
      scan_count: verification.scan_count + 1,
      first_scanned_at: verification.first_scanned_at ?? new Date(),
      first_scanner_id: verification.first_scanner_id ?? input.scanner_id,
      status:
        verification.status === "active" && verification.scan_count === 0
          ? "scanned"
          : verification.status,
    })

    return {
      result,
      message:
        result === "genuine"
          ? "Sản phẩm chính hãng đã được xác thực"
          : "Cảnh báo: Mã có dấu hiệu bất thường",
      verification,
      risk_flags: riskFlags,
    }
  }

  async submitCounterfeitReport(input: {
    reporter_id: string
    reporter_name: string
    reporter_email?: string
    reporter_phone?: string
    order_id?: string
    product_id?: string
    vendor_id?: string
    verification_code_id?: string
    title: string
    description: string
    purchase_location?: string
    evidence_urls: string[]
  }) {
    // Severity dựa trên có evidence + verification code
    let severity: "low" | "medium" | "high" | "critical" = "medium"
    if (input.verification_code_id && input.evidence_urls.length >= 3) {
      severity = "high"
    } else if (input.evidence_urls.length === 0) {
      severity = "low"
    }

    return this.createCounterfeitReports({
      ...input,
      evidence_urls: { urls: input.evidence_urls },
      severity,
      status: "submitted",
    })
  }
}

export default QrVerificationModuleService
