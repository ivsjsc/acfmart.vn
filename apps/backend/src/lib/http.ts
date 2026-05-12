export async function postJson<T>(
  url: string,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
        ? data.error
        : `HTTP ${res.status}`
    throw new Error(message)
  }

  return data as T
}

export async function postForm<T>(
  url: string,
  body: Record<string, string | number | boolean>,
  headers: Record<string, string> = {}
): Promise<T> {
  const form = new URLSearchParams()
  Object.entries(body).forEach(([key, value]) => form.set(key, String(value)))

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...headers,
    },
    body: form.toString(),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof data?.return_message === "string"
        ? data.return_message
        : typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
        ? data.error
        : `HTTP ${res.status}`
    throw new Error(message)
  }

  return data as T
}
