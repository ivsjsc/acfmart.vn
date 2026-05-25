const DEFAULT_BACKEND_URL = "http://localhost:9000"
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ""

function resolveBaseUrl(): string {
  return (import.meta.env.VITE_MEDUSA_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
}

const BASE_URL = resolveBaseUrl();

export class BackendUnavailableError extends Error {
  constructor(message = "Backend chưa sẵn sàng. Vui lòng khởi động API.") {
    super(message)
    this.name = "BackendUnavailableError"
  }
}

export function backendApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.startsWith("/v1/") && BASE_URL.endsWith("/v1")) {
    return `${BASE_URL}${normalizedPath.slice(3)}`;
  }
  return `${BASE_URL}${normalizedPath}`;
}

export function backendHeaders(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
  }
}

async function parseBackendResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Backend trả lỗi ${res.status}`)
  }

  return data as T
}

export async function getBackend<T>(path: string): Promise<T> {
  try {
    const res = await fetch(backendApiUrl(path), {
      headers: backendHeaders(),
    })
    return parseBackendResponse<T>(res)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new BackendUnavailableError()
    }
    throw error
  }
}

export async function postBackend<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(backendApiUrl(path), {
      method: "POST",
      headers: backendHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(body),
    })

    return parseBackendResponse<T>(res)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new BackendUnavailableError()
    }
    throw error
  }
}
