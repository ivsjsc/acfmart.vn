import { authService } from "./auth-service"

const BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY ?? ""

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: any) {
    super(message)
    this.name = "ApiError"
  }
}

interface RequestOptions extends RequestInit {
  authRequired?: boolean
  skipPublishableKey?: boolean
  params?: Record<string, string | number | boolean | undefined | null>
}

/**
 * Centralized fetch wrapper to Medusa backend.
 * - Auto-injects publishable key + Firebase ID token
 * - Throws ApiError on non-2xx
 */
export async function api<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { authRequired, skipPublishableKey, params, headers, ...rest } = options

  const url = new URL(path.startsWith("http") ? path : `${BACKEND_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  }

  if (!skipPublishableKey && PUBLISHABLE_KEY) {
    finalHeaders["x-publishable-api-key"] = PUBLISHABLE_KEY
  }

  if (authRequired) {
    const token = await authService.getIdToken()
    if (!token) {
      throw new ApiError(401, "Cần đăng nhập để gọi endpoint này")
    }
    finalHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
  })

  const contentType = res.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const payload = isJson ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    const message =
      (isJson && payload && (payload.message ?? payload.error)) ||
      `Request failed (${res.status})`
    throw new ApiError(res.status, message, payload)
  }

  return payload as T
}

export const apiClient = {
  get: <T = any>(path: string, opts?: RequestOptions) =>
    api<T>(path, { ...opts, method: "GET" }),
  post: <T = any>(path: string, body?: any, opts?: RequestOptions) =>
    api<T>(path, { ...opts, method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T = any>(path: string, body?: any, opts?: RequestOptions) =>
    api<T>(path, { ...opts, method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: <T = any>(path: string, opts?: RequestOptions) =>
    api<T>(path, { ...opts, method: "DELETE" }),
}
