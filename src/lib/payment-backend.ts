import { backendHeaders } from "./api-base"

const DEFAULT_PAYMENT_BACKEND_URL =
  import.meta.env.VITE_PAYMENT_BACKEND_URL ||
  import.meta.env.VITE_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

export class PaymentBackendUnavailableError extends Error {
  constructor(
    message = "Payment backend chưa sẵn sàng. Vui lòng kiểm tra cấu hình thanh toán."
  ) {
    super(message)
    this.name = "PaymentBackendUnavailableError"
  }
}

export function paymentBackendApiUrl(path: string): string {
  const base = DEFAULT_PAYMENT_BACKEND_URL.replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

function paymentBackendHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return backendHeaders(headers)
}

async function parsePaymentBackendResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Payment backend trả lỗi ${res.status}`)
  }
  return data as T
}

export async function getPaymentBackend<T>(path: string): Promise<T> {
  try {
    const res = await fetch(paymentBackendApiUrl(path), {
      headers: paymentBackendHeaders(),
    })
    return parsePaymentBackendResponse<T>(res)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new PaymentBackendUnavailableError()
    }
    throw error
  }
}

export async function postPaymentBackend<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(paymentBackendApiUrl(path), {
      method: "POST",
      headers: paymentBackendHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(body),
    })

    return parsePaymentBackendResponse<T>(res)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new PaymentBackendUnavailableError()
    }
    throw error
  }
}
