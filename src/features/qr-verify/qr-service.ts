import { BackendUnavailableError, getBackend, postBackend } from "../../lib/api-base"
import { firestore } from "../../lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"

/**
 * Service for handling QR code verification and counterfeit detection.
 */

interface ProductVerificationResult {
  isValid: boolean
  qrCode: string
  productId: string
  productName: string
  brand: string
  manufacturingDate: string
  batchNumber: string
  isCounterfeit: boolean
  authenticityScore: number // 0-100 percentage
  verificationDate: string
  additionalInfo?: string
  notes?: string
  addedAt: string
  source?: "backend" | "offline"
}

type BackendVerifyResponse = {
  result: "genuine" | "suspect_counterfeit" | "invalid" | "voided" | "expired"
  message: string
  verification?: {
    id: string
    code: string
    product_id?: string | null
    variant_id?: string | null
    vendor_id?: string | null
    batch_id?: string | null
    serial_number?: string | null
    manufactured_at?: string | null
    expires_at?: string | null
    scan_count?: number
    metadata?: {
      product_name?: string
      brand?: string
    } | null
  }
  risk_flags?: string[]
}

function offlineVerify(qrCode: string): ProductVerificationResult {
  const normalized = qrCode.trim().toUpperCase()
  const isInvalid = normalized.length < 8
  const isCounterfeit =
    normalized.startsWith("FAKE") ||
    normalized.startsWith("SUS") ||
    normalized.includes("COUNTERFEIT")
  const authenticityScore = isInvalid ? 0 : isCounterfeit ? 35 : 96

  return {
    isValid: !isInvalid,
    qrCode: normalized,
    productId: `qr_${normalized.slice(0, 10)}`,
    productName: "Sản phẩm đang chờ đối soát",
    brand: "Thương hiệu đã đăng ký",
    manufacturingDate: new Date().toISOString(),
    batchNumber: normalized.startsWith("BATCH") ? normalized : `BATCH-${normalized.slice(0, 6)}`,
    isCounterfeit,
    authenticityScore,
    verificationDate: new Date().toISOString(),
    additionalInfo: isInvalid
      ? "Mã QR chưa đúng định dạng. Vui lòng kiểm tra lại tem trên bao bì gốc."
      : isCounterfeit
      ? "Mã có dấu hiệu bất thường. Vui lòng gửi báo cáo để đội kiểm định xử lý."
      : "Kết quả tạm thời được lưu trên thiết bị vì backend chưa kết nối.",
    addedAt: new Date().toISOString(),
    source: "offline",
  }
}

function mapBackendResult(
  qrCode: string,
  data: BackendVerifyResponse
): ProductVerificationResult {
  const verification = data.verification
  const isCounterfeit = data.result === "suspect_counterfeit"
  const isInvalid = ["invalid", "voided", "expired"].includes(data.result)

  return {
    isValid: !isInvalid,
    qrCode,
    productId: verification?.product_id || verification?.id || qrCode,
    productName: verification?.metadata?.product_name || "Sản phẩm đã đăng ký xác thực",
    brand: verification?.metadata?.brand || "Thương hiệu chính hãng",
    manufacturingDate:
      verification?.manufactured_at || verification?.expires_at || new Date().toISOString(),
    batchNumber: verification?.batch_id || verification?.serial_number || qrCode,
    isCounterfeit,
    authenticityScore: isInvalid ? 0 : isCounterfeit ? 55 : 99,
    verificationDate: new Date().toISOString(),
    additionalInfo: data.message,
    addedAt: new Date().toISOString(),
    source: "backend",
  }
}

export class QRVerificationService {
  /**
   * Verifies a product using its QR code
   * @param qrCode The QR code data to verify
   * @returns Verification result with authenticity information
   */
  static async verifyProduct(qrCode: string): Promise<ProductVerificationResult> {
    const normalized = qrCode.trim()
    if (!normalized || normalized.length < 8) {
      throw new Error("Mã QR không đúng định dạng")
    }

    try {
      const data = await getBackend<BackendVerifyResponse>(
        `/v1/verify/${encodeURIComponent(normalized)}`,
      )
      return mapBackendResult(normalized, data)
    } catch (error) {
      if (error instanceof BackendUnavailableError) {
        return offlineVerify(normalized)
      }
      throw error
    }
  }

  /**
   * Adds a product to the personal verification cabinet
   * @param qrCode The QR code of the product to add
   * @param notes Optional notes about the product
   */
  static async addToCabinet(qrCode: string, notes?: string): Promise<void> {
    const uid = getAuth().currentUser?.uid
    if (!uid) throw new Error("Vui lòng đăng nhập để lưu kết quả xác thực")

    const verificationResult = await this.verifyProduct(qrCode)
    const cabinetRef = collection(firestore, "users", uid, "verificationCabinet")
    await addDoc(cabinetRef, {
      ...verificationResult,
      notes,
      addedAt: new Date().toISOString(),
      created_at: serverTimestamp(),
    })
  }

  static async getCabinetItems(): Promise<ProductVerificationResult[]> {
    const uid = getAuth().currentUser?.uid
    if (!uid) return []

    try {
      const cabinetRef = collection(firestore, "users", uid, "verificationCabinet")
      const q = query(cabinetRef, orderBy("created_at", "desc"))
      const snap = await getDocs(q)
      return snap.docs.map((d) => d.data() as ProductVerificationResult)
    } catch (e) {
      console.error('Error retrieving verification cabinet:', e)
      return []
    }
  }

  /**
   * Reports a counterfeit product
   * @param qrCode The QR code of the suspected counterfeit product
   * @param reportDetails Details about the counterfeit report
   */
  static async reportCounterfeit(qrCode: string, reportDetails: string): Promise<boolean> {
    try {
      await postBackend("/v1/verify/report", {
        reporter_id: "guest",
        reporter_name: "Khách hàng",
        verification_code_id: qrCode,
        title: "Báo cáo nghi vấn hàng giả",
        description: reportDetails,
        evidence_urls: [],
      })
      return true
    } catch (error) {
      if (!(error instanceof BackendUnavailableError)) {
        throw error
      }

      const queue = JSON.parse(localStorage.getItem("pendingCounterfeitReports") || "[]")
      queue.push({
        qrCode,
        reportDetails,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem("pendingCounterfeitReports", JSON.stringify(queue))
      return true
    }
  }
}
