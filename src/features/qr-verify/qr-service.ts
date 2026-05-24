import { BackendUnavailableError, postBackend } from "../../lib/api-base"
import { firestore } from "../../lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { type IvsVerifyResponse, verifyPublicQrToken } from "../../lib/ivs-trust-api"

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

function mapBackendResult(
  qrCode: string,
  data: IvsVerifyResponse
): ProductVerificationResult {
  const isCounterfeit = data.result === "SUSPECT"
  const isInvalid = ["INVALID", "VOIDED", "EXPIRED"].includes(data.result)
  const product = data.productSummary
  const seller = data.sellerSummary

  return {
    isValid: !isInvalid,
    qrCode,
    productId: product?.publicRef || qrCode,
    productName: product?.name || "Sản phẩm đã đăng ký xác thực",
    brand: product?.brand || seller?.displayName || "QRVerified by IVS",
    manufacturingDate: new Date().toISOString(),
    batchNumber: product?.batchCode || product?.skuCode || qrCode,
    isCounterfeit,
    authenticityScore: isInvalid ? 0 : isCounterfeit ? 55 : 99,
    verificationDate: new Date().toISOString(),
    additionalInfo: data.warningMessage || data.supportAction || "Kết quả xác minh từ IVS Trust Platform.",
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

    const data = await verifyPublicQrToken(normalized)
    return mapBackendResult(normalized, data)
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
      await postBackend("/store/counterfeit-reports", {
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
