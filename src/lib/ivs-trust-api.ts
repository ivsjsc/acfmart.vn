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

  const response = await fetch(ivsApiUrl(path), {
    ...options,
    headers,
  })
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
  const response = await fetch(ivsApiUrl(`/verify/${encodeURIComponent(token)}`), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })

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

export async function getSellerQrBatch(batchId: string): Promise<IvsSellerQrBatch> {
  return ivsRequest<IvsSellerQrBatch>(`/sellers/me/qr-batches/${encodeURIComponent(batchId)}`)
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
