export function backendApiUrl(path: string): string {
  const base = (import.meta.env.VITE_MEDUSA_BACKEND_URL || "").replace(/\/$/, "")
  if (!base) {
    throw new Error("VITE_MEDUSA_BACKEND_URL chưa được cấu hình")
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export async function postBackend<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(backendApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Backend trả lỗi ${res.status}`)
  }

  return data as T
}
