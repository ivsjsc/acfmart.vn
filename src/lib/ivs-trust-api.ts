import { authService } from "./auth-service"

const DEFAULT_IVS_API_BASE = "https://api.acfmart.vn/v1"

export type IvsVerifyResponse = {
  result: "GENUINE" | "SUSPECT" | "INVALID" | "VOIDED" | "EXPIRED"
  productSummary?: {
    name?: string
    brand?: string
    skuCode?: string
    batchCode?: string
    publicRef?: string
  }
  sellerSummary?: {
    displayName?: string
    verified?: boolean
    publicRef?: string
  }
  warningMessage?: string | null
  supportAction?: string | null
}

export type IvsSellerQrDashboard = {
  sellerId: string
  totalProducts: number
  totalQrBatches: number
  totalQrCodes: number
}

export type IvsSellerQrBatch = {
  id: string
  sellerId?: string
  productId: string
  skuId?: string | null
  quantity: number
  status: string
  createdAt: string
}

export type IvsVerificationLog = {
  id: string
  publicCode?: string | null
  result?: string
  ipHash?: string | null
  userAgent?: string | null
  createdAt: string
}

export type IvsSuspiciousAlert = {
  id: string
  ruleCode?: string
  severity?: string
  message?: string
  status?: string
  resolvedAt?: string | null
  resolutionNote?: string | null
  createdAt: string
}

export type IvsSellerPrinterProfile = {
  sellerId: string
  displayName?: string
  printerConfig: Record<string, unknown> | null
}

export type IvsSellerPrintFile = {
  batchId: string
  format?: "json" | "html" | "zpl"
  contentType?: string
  fileName?: string
  artifact?: {
    format?: "json" | "html" | "zpl"
    contentType?: string
    fileName?: string
    encoding?: string
    content?: string
  } | null
  qrCodes: Array<{
    publicCode?: string | null
    status?: string
    serialNo?: string | null
  }>
}

export type IvsPaginated<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

export class IvsApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message)
    this.name = "IvsApiError"
  }
}

export function ivsApiV1Base(): string {
  const configured = import.meta.env.VITE_API_BASE_URL || DEFAULT_IVS_API_BASE
  const trimmed = configured.trim().replace(/\/+$/, "")
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`
}

function ivsApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  if (normalizedPath.startsWith("/v1/")) {
    return `${ivsApiV1Base()}${normalizedPath.slice(3)}`
  }
  return `${ivsApiV1Base()}${normalizedPath}`
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function ivsRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const token = await authService.getIdToken()
  if (!token) {
    throw new IvsApiError(401, "Cần đăng nhập để gọi IVS Trust API")
  }
  headers.set("Authorization", `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(ivsApiUrl(path), {
      ...options,
      headers,
    })
  } catch (error) {
    // fetch ném TypeError("Failed to fetch") khi không nhận được response hợp lệ:
    // backend không phản hồi (Cloud Run trả 503 trước khi app khởi động), CORS
    // chưa cho phép origin, hoặc mất mạng. Thay thông báo thô bằng tiếng Việt rõ ràng.
    throw new IvsApiError(
      0,
      "Chưa kết nối được dịch vụ tem QR (IVS Trust Platform). Hệ thống đang gặp sự cố kết nối — vui lòng thử lại sau ít phút.",
      error
    )
  }
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `IVS Trust API trả lỗi ${response.status}`
    throw new IvsApiError(response.status, message, payload)
  }

  return payload as T
}

export async function verifyPublicQrToken(token: string): Promise<IvsVerifyResponse> {
  let response: Response
  try {
    response = await fetch(ivsApiUrl(`/verify/${encodeURIComponent(token)}`), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
  } catch {
    throw new Error(
      "Chưa kết nối được dịch vụ xác thực tem QR. Hệ thống đang gặp sự cố kết nối — vui lòng thử lại sau ít phút."
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `IVS Trust API trả lỗi ${response.status}`
    throw new Error(message)
  }

  return payload as IvsVerifyResponse
}

export async function getSellerQrDashboard(): Promise<IvsSellerQrDashboard> {
  return ivsRequest<IvsSellerQrDashboard>("/sellers/me/dashboard")
}

export async function listSellerQrBatches(params: { page?: number; limit?: number } = {}): Promise<IvsPaginated<IvsSellerQrBatch>> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  return ivsRequest<IvsPaginated<IvsSellerQrBatch>>(`/sellers/me/qr-batches${query.toString() ? `?${query}` : ""}`)
}

export async function createSellerQrBatch(input: { productId: string; skuId?: string; quantity: number }): Promise<IvsSellerQrBatch> {
  return ivsRequest<IvsSellerQrBatch>("/sellers/me/qr-batches", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

/**
 * Đăng ký/cập nhật một sản phẩm (đã duyệt) sang IVS Trust Platform để cấp phép tạo tem QR.
 * Idempotent — id sản phẩm trùng id Firestore. Dùng làm fallback khi Cloud Function on-approval
 * chưa kịp đồng bộ.
 */
export async function upsertSellerProduct(
  productId: string,
  input: { name: string; brand?: string; category?: string; publicRef?: string }
): Promise<unknown> {
  return ivsRequest(`/sellers/me/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function getSellerQrBatch(batchId: string): Promise<IvsSellerQrBatch> {
  return ivsRequest<IvsSellerQrBatch>(`/sellers/me/qr-batches/${encodeURIComponent(batchId)}`)
}

/**
 * Phát hành & kích hoạt lô tem: chuyển toàn bộ mã sang ACTIVATED để khi quét verify
 * trả "Chính hãng" (GENUINE). Idempotent.
 */
export async function activateSellerQrBatch(
  batchId: string
): Promise<IvsSellerQrBatch & { activated?: number; total?: number }> {
  return ivsRequest<IvsSellerQrBatch & { activated?: number; total?: number }>(
    `/sellers/me/qr-batches/${encodeURIComponent(batchId)}/activate`,
    { method: "POST" }
  )
}

export async function getSellerQrBatchPrintFile(batchId: string, format: "json" | "html" | "zpl" = "html"): Promise<IvsSellerPrintFile> {
  return ivsRequest<IvsSellerPrintFile>(
    `/sellers/me/qr-batches/${encodeURIComponent(batchId)}/print-file?format=${encodeURIComponent(format)}`
  )
}

export async function listSellerVerificationLogs(params: { page?: number; limit?: number } = {}): Promise<IvsPaginated<IvsVerificationLog>> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  return ivsRequest<IvsPaginated<IvsVerificationLog>>(`/sellers/me/verification-logs${query.toString() ? `?${query}` : ""}`)
}

export async function listSellerSuspiciousAlerts(params: { page?: number; limit?: number } = {}): Promise<IvsPaginated<IvsSuspiciousAlert>> {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  return ivsRequest<IvsPaginated<IvsSuspiciousAlert>>(`/sellers/me/suspicious-alerts${query.toString() ? `?${query}` : ""}`)
}

export async function getSellerPrinterProfile(): Promise<IvsSellerPrinterProfile> {
  return ivsRequest<IvsSellerPrinterProfile>("/sellers/me/printer-profile")
}

export async function patchSellerPrinterProfile(printerConfig: Record<string, unknown>): Promise<IvsSellerPrinterProfile> {
  return ivsRequest<IvsSellerPrinterProfile>("/sellers/me/printer-profile", {
    method: "PATCH",
    body: JSON.stringify(printerConfig),
  })
}

// ---------------------------------------------------------------------------
// Admin — QR Verification Logs
// ---------------------------------------------------------------------------

export type IvsAdminVerificationLog = {
  id: string
  publicCode?: string | null
  result: string
  qrStatus?: string | null
  ipAddress?: string | null
  ipHash: string
  userAgent?: string | null
  userId?: string | null
  riskScore?: number | null
  location?: { latitude: number; longitude: number } | null
  productId?: string | null
  productName?: string | null
  productBrand?: string | null
  sellerId?: string | null
  sellerName?: string | null
  sellerCode?: string | null
  createdAt: string
}

export type IvsAdminVerificationLogDetail = IvsAdminVerificationLog & {
  deviceFingerprintHash?: string | null
  metadata?: unknown
  qrCode?: { batchId?: string | null; serialNo: string; currentStatus: string } | null
  product?: { id: string; name: string; brand?: string | null; publicRef?: string | null } | null
  seller?: { id: string; displayName: string; code?: string | null } | null
  riskEvents: Array<{
    id: string
    ruleCode: string
    severity: string
    message: string
    status: string
    metadata?: unknown
    createdAt: string
  }>
}

export type IvsAdminVerificationLogsParams = {
  page?: number
  limit?: number
  result?: string
  publicCode?: string
  sellerId?: string
  dateFrom?: string
  dateTo?: string
}

export async function listAdminVerificationLogs(
  params: IvsAdminVerificationLogsParams = {}
): Promise<IvsPaginated<IvsAdminVerificationLog>> {
  const q = new URLSearchParams()
  if (params.page) q.set("page", String(params.page))
  if (params.limit) q.set("limit", String(params.limit))
  if (params.result) q.set("result", params.result)
  if (params.publicCode) q.set("publicCode", params.publicCode)
  if (params.sellerId) q.set("sellerId", params.sellerId)
  if (params.dateFrom) q.set("dateFrom", params.dateFrom)
  if (params.dateTo) q.set("dateTo", params.dateTo)
  return ivsRequest<IvsPaginated<IvsAdminVerificationLog>>(
    `/admin/qr/verification-logs${q.toString() ? `?${q}` : ""}`
  )
}

export async function getAdminVerificationLogDetail(
  id: string
): Promise<IvsAdminVerificationLogDetail> {
  return ivsRequest<IvsAdminVerificationLogDetail>(
    `/admin/qr/verification-logs/${encodeURIComponent(id)}`
  )
}
