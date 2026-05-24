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

export function ivsApiV1Base(): string {
  const configured = import.meta.env.VITE_API_BASE_URL || DEFAULT_IVS_API_BASE
  const trimmed = configured.trim().replace(/\/+$/, "")
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`
}

export async function verifyPublicQrToken(token: string): Promise<IvsVerifyResponse> {
  const response = await fetch(`${ivsApiV1Base()}/verify/${encodeURIComponent(token)}`, {
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
