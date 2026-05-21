import { onRequest } from "firebase-functions/v2/https"
import { defineString } from "firebase-functions/params"
import * as admin from "firebase-admin"
import { createHmac, timingSafeEqual as cryptoTimingSafeEqual } from "crypto"
import type { Request } from "express"

const region = "asia-southeast1"
const db = admin.firestore()

const paymentPublicBaseUrl = defineString("PAYMENT_PUBLIC_BASE_URL", { default: "" })
const vnpayTmnCode = defineString("VNPAY_TMN_CODE", { default: "" })
const vnpayHashSecret = defineString("VNPAY_HASH_SECRET", { default: "" })
const vnpayApiUrl = defineString("VNPAY_API_URL", {
  default: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
})
const momoPartnerCode = defineString("MOMO_PARTNER_CODE", { default: "" })
const momoAccessKey = defineString("MOMO_ACCESS_KEY", { default: "" })
const momoSecretKey = defineString("MOMO_SECRET_KEY", { default: "" })
const momoApiUrl = defineString("MOMO_API_URL", {
  default: "https://test-payment.momo.vn/v2/gateway/api/create",
})
const zaloAppId = defineString("ZALOPAY_APP_ID", { default: "" })
const zaloKey1 = defineString("ZALOPAY_KEY1", { default: "" })
const zaloKey2 = defineString("ZALOPAY_KEY2", { default: "" })
const zaloApiUrl = defineString("ZALOPAY_API_URL", {
  default: "https://sb-openapi.zalopay.vn/v2/create",
})

type PaymentProviderId = "vnpay" | "momo" | "zalopay"
type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded" | "expired"
type RefundStatus = "pending" | "processing" | "completed" | "failed"

interface PaymentSessionRecord {
  id: string
  orderCode: string
  provider: PaymentProviderId
  status: PaymentStatus
  amount: number
  currency: string
  returnUrl: string
  cancelUrl?: string | null
  providerExternalTxnRef?: string | null
  providerTxnId?: string | null
  paymentUrl?: string | null
  requestPayload?: Record<string, unknown> | null
  responsePayload?: Record<string, unknown> | null
  webhookPayload?: Record<string, unknown> | null
  refundStatus?: RefundStatus | null
  refundProviderRef?: string | null
  refundProviderTxnId?: string | null
  refundRequestedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp | null
  refundCompletedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp | null
  refundPayload?: Record<string, unknown> | null
  paidAt?: admin.firestore.FieldValue | admin.firestore.Timestamp | null
  failedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp | null
  createdAt?: admin.firestore.FieldValue | admin.firestore.Timestamp | null
  updatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp | null
}

type PaymentInitBody = {
  orderId?: string
  orderCode?: string
  orderInfo?: string
  description?: string
  amount?: number | string
  currency?: string
  returnUrl?: string
  return_url?: string
  cancelUrl?: string
  cancel_url?: string
  redirectUrl?: string
  buyerEmail?: string
  buyerPhone?: string
  app_user?: string
  metadata?: Record<string, unknown>
  embed_data?: Record<string, unknown> | string
}

type QueryLike = Record<string, string | string[] | undefined>

type PaymentWebhookResult = {
  accepted: boolean
  status: PaymentStatus
  sessionId?: string
  orderCode?: string
  providerTxnId?: string
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function paymentMethods() {
  return [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng",
      description: "Thanh toán trực tiếp cho shipper khi nhận hàng",
      logo: "",
      enabled: true,
    },
    {
      id: "vnpay",
      name: "VNPay",
      description: "Thanh toán qua cổng VNPay",
      logo: "",
      enabled: true,
    },
    {
      id: "momo",
      name: "MoMo",
      description: "Thanh toán qua ví MoMo",
      logo: "",
      enabled: true,
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      description: "Thanh toán qua ví ZaloPay",
      logo: "",
      enabled: true,
    },
  ]
}

function hmacSha256(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data, "utf8").digest("hex")
}

function hmacSha512(secret: string, data: string): string {
  return createHmac("sha512", secret).update(data, "utf8").digest("hex")
}

function timingSafeEqualHex(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false
  try {
    return cryptoTimingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"))
  } catch {
    return false
  }
}

function buildSortedQuery(params: Record<string, string | number | undefined>): string {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
    .join("&")
}

function formatVnpDate(date: Date): string {
  const tz = new Date(date.getTime() + 7 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${tz.getUTCFullYear()}` +
    `${pad(tz.getUTCMonth() + 1)}` +
    `${pad(tz.getUTCDate())}` +
    `${pad(tz.getUTCHours())}` +
    `${pad(tz.getUTCMinutes())}` +
    `${pad(tz.getUTCSeconds())}`
  )
}

function resolvePaymentPublicBaseUrl(): string {
  const configured = paymentPublicBaseUrl.value().trim()
  if (configured) return configured.replace(/\/$/, "")

  const projectId = (process.env.GCLOUD_PROJECT ?? "").trim()
  const target = (process.env.FUNCTION_TARGET ?? "paymentApi").trim()
  if (!projectId) return ""
  return `https://${region}-${projectId}.cloudfunctions.net/${target}`
}

function resolveApiOrigin(apiUrl: string): string {
  try {
    return new URL(apiUrl).origin
  } catch {
    return apiUrl.replace(/\/[^/]*$/, "")
  }
}

function getWebhookUrl(provider: PaymentProviderId): string {
  const base = resolvePaymentPublicBaseUrl()
  return base ? `${base}/store/payment/webhook/${provider}` : ""
}

function getPaymentCredentials(provider: PaymentProviderId) {
  if (provider === "vnpay") {
    return {
      tmnCode: vnpayTmnCode.value().trim(),
      hashSecret: vnpayHashSecret.value().trim(),
      apiUrl: vnpayApiUrl.value().trim(),
    }
  }
  if (provider === "momo") {
    return {
      partnerCode: momoPartnerCode.value().trim(),
      accessKey: momoAccessKey.value().trim(),
      secretKey: momoSecretKey.value().trim(),
      apiUrl: momoApiUrl.value().trim(),
    }
  }
  return {
    appId: zaloAppId.value().trim(),
    key1: zaloKey1.value().trim(),
    key2: zaloKey2.value().trim(),
    apiUrl: zaloApiUrl.value().trim(),
  }
}

export interface RefundExecutionResult {
  provider: PaymentProviderId
  status: RefundStatus
  providerRefundId: string
  providerRequestId: string
  rawResponse: Record<string, unknown>
}

export class UnsupportedProviderRefundError extends Error {
  constructor(provider: PaymentProviderId) {
    super(`Refund cho ${provider} chưa được hỗ trợ`)
    this.name = "UnsupportedProviderRefundError"
  }
}

function generateRefundRequestId(prefix = "refund"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateZaloRefundId(appId: string): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "")
  return `${date}_${appId}_${Math.random().toString(36).slice(2, 10)}`
}

function normalizeRefundStatus(status: unknown): RefundStatus {
  if (status === "completed") return "completed"
  if (status === "processing" || status === "pending") return "processing"
  if (status === "failed") return "failed"
  return "pending"
}

async function postJson(url: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return data as Record<string, unknown>
}

async function queryZaloRefundStatus(input: {
  appId: string
  key1: string
  apiUrl: string
  mRefundId: string
}): Promise<Record<string, unknown>> {
  const queryUrl = `${resolveApiOrigin(input.apiUrl)}/v2/query_refund`
  const timestamp = Date.now()
  const mac = hmacSha256(input.key1, `${input.appId}|${input.mRefundId}|${timestamp}`)
  return postJson(queryUrl, {
    app_id: Number(input.appId),
    m_refund_id: input.mRefundId,
    timestamp,
    mac,
  })
}

export async function executeProviderRefund(input: {
  provider: PaymentProviderId
  providerTxnId: string
  amount: number
  reason: string
  sessionId?: string
}): Promise<RefundExecutionResult> {
  if (!input.providerTxnId) {
    throw new Error("Thiếu mã giao dịch của nhà cung cấp")
  }

  if (input.provider === "vnpay") {
    throw new UnsupportedProviderRefundError("vnpay")
  }

  if (input.provider === "momo") {
    ensureConfigured("momo")
    const cfg = getPaymentCredentials("momo")
    const amount = Math.round(input.amount)
    const requestId = input.sessionId ? `${input.sessionId}_${Date.now()}` : generateRefundRequestId("momo")
    const orderId = `refund_${requestId}`
    const transId = Number(input.providerTxnId)
    if (!Number.isFinite(transId)) {
      throw new Error("Mã giao dịch MoMo không hợp lệ")
    }
    const signature = hmacSha256(
      asString(cfg.secretKey),
      [
        `accessKey=${asString(cfg.accessKey)}`,
        `amount=${amount}`,
        `description=${input.reason}`,
        `orderId=${orderId}`,
        `partnerCode=${asString(cfg.partnerCode)}`,
        `requestId=${requestId}`,
        `transId=${input.providerTxnId}`,
      ].join("&"),
    )

    const data = await postJson(
      asString(cfg.apiUrl).replace(/\/create\/?$/, "/refund"),
      {
        partnerCode: asString(cfg.partnerCode),
        orderId,
        requestId,
        amount,
        transId,
        lang: "vi",
        description: input.reason,
        signature,
      },
    )
    const resultCode = asNumber(data.resultCode, -1)
    if (resultCode !== 0 && resultCode !== 7002) {
      throw new Error(asString(data.message, "MoMo refund thất bại"))
    }
    return {
      provider: "momo",
      status: resultCode === 0 ? "completed" : "processing",
      providerRefundId: asString(data.refundTransId ?? data.transId ?? requestId, requestId),
      providerRequestId: requestId,
      rawResponse: data,
    }
  }

  ensureConfigured("zalopay")
  const cfg = getPaymentCredentials("zalopay")
  const appId = asString(cfg.appId)
  const key1 = asString(cfg.key1)
  const amount = Math.round(input.amount)
  const refundRequestId = generateZaloRefundId(appId)
  const timestamp = Date.now()
  const mac = hmacSha256(
    key1,
    `${appId}|${input.providerTxnId}|${amount}|${input.reason}|${timestamp}`,
  )
  const data = await postJson(`${resolveApiOrigin(asString(cfg.apiUrl))}/v2/refund`, {
    app_id: Number(appId),
    m_refund_id: refundRequestId,
    zp_trans_id: input.providerTxnId,
    amount,
    timestamp,
    description: input.reason,
    mac,
  })

  const returnCode = asNumber(data.return_code, 0)
  if (returnCode !== 1) {
    throw new Error(asString(data.return_message, "ZaloPay refund thất bại"))
  }
  const refundStatus = asNumber(data.refund_status, 3)
  return {
    provider: "zalopay",
    status: refundStatus === 1 ? "completed" : "processing",
    providerRefundId: asString(data.refund_id ?? refundRequestId, refundRequestId),
    providerRequestId: refundRequestId,
    rawResponse: data,
  }
}

export async function queryProviderRefundStatus(input: {
  provider: PaymentProviderId
  providerTxnId: string
  providerRequestId?: string
}): Promise<RefundExecutionResult | null> {
  if (input.provider === "vnpay") {
    return null
  }

  if (input.provider === "momo") {
    ensureConfigured("momo")
    const cfg = getPaymentCredentials("momo")
    const requestId = input.providerRequestId ?? generateRefundRequestId("momo_query")
    const orderId = `refund_${requestId}`
    const signature = hmacSha256(
      asString(cfg.secretKey),
      [
        `accessKey=${asString(cfg.accessKey)}`,
        `orderId=${orderId}`,
        `partnerCode=${asString(cfg.partnerCode)}`,
        `requestId=${requestId}`,
        `transId=${input.providerTxnId}`,
      ].join("&"),
    )
    const data = await postJson(
      asString(cfg.apiUrl).replace(/\/create\/?$/, "/refund/query"),
      {
        partnerCode: asString(cfg.partnerCode),
        requestId,
        orderId,
        lang: "vi",
        signature,
      },
    )
    const resultCode = asNumber(data.resultCode, -1)
    if (resultCode !== 0 && resultCode !== 7002) {
      return {
        provider: "momo",
        status: "failed",
        providerRefundId: asString(data.transId ?? requestId, requestId),
        providerRequestId: requestId,
        rawResponse: data,
      }
    }
    return {
      provider: "momo",
      status: resultCode === 0 ? "completed" : "processing",
      providerRefundId: asString(data.transId ?? requestId, requestId),
      providerRequestId: requestId,
      rawResponse: data,
    }
  }

  ensureConfigured("zalopay")
  const cfg = getPaymentCredentials("zalopay")
  const appId = asString(cfg.appId)
  const requestId = input.providerRequestId ?? generateZaloRefundId(appId)
  const data = await queryZaloRefundStatus({
    appId,
    key1: asString(cfg.key1),
    apiUrl: asString(cfg.apiUrl),
    mRefundId: requestId,
  })
  const returnCode = asNumber(data.return_code, 0)
  if (returnCode !== 1) {
    return {
      provider: "zalopay",
      status: "failed",
      providerRefundId: asString(data.refund_id ?? requestId, requestId),
      providerRequestId: requestId,
      rawResponse: data,
    }
  }
  const refundStatus = asNumber(data.refund_status, 3)
  return {
    provider: "zalopay",
    status: refundStatus === 1 ? "completed" : "processing",
    providerRefundId: asString(data.refund_id ?? requestId, requestId),
    providerRequestId: requestId,
    rawResponse: data,
  }
}

function ensureConfigured(provider: PaymentProviderId): void {
  const cfg = getPaymentCredentials(provider)
  if (provider === "vnpay" && (!cfg.tmnCode || !cfg.hashSecret || !cfg.apiUrl)) {
    throw new Error("VNPay chưa được cấu hình")
  }
  if (provider === "momo" && (!cfg.partnerCode || !cfg.accessKey || !cfg.secretKey || !cfg.apiUrl)) {
    throw new Error("MoMo chưa được cấu hình")
  }
  if (provider === "zalopay" && (!cfg.appId || !cfg.key1 || !cfg.key2 || !cfg.apiUrl)) {
    throw new Error("ZaloPay chưa được cấu hình")
  }
}

function normalizeBody(input: unknown): PaymentInitBody {
  const body = toRecord(input) ?? {}
  return {
    orderId: asString(body.orderId ?? body.order_id ?? body.orderCode ?? body.order_code),
    orderCode: asString(body.orderCode ?? body.order_code ?? body.orderId ?? body.order_id),
    orderInfo: asString(body.orderInfo ?? body.description),
    description: asString(body.description ?? body.orderInfo),
    amount: body.amount as number | string | undefined,
    currency: asString(body.currency, "VND"),
    returnUrl: asString(body.returnUrl ?? body.return_url),
    return_url: asString(body.return_url ?? body.returnUrl),
    cancelUrl: asString(body.cancelUrl ?? body.cancel_url),
    cancel_url: asString(body.cancel_url ?? body.cancelUrl),
    redirectUrl: asString(body.redirectUrl),
    buyerEmail: asString(body.buyerEmail),
    buyerPhone: asString(body.buyerPhone),
    app_user: asString(body.app_user),
    metadata: toRecord(body.metadata) ?? undefined,
    embed_data: body.embed_data as Record<string, unknown> | string | undefined,
  }
}

async function createPaymentSession(input: {
  orderCode: string
  provider: PaymentProviderId
  amount: number
  currency: string
  returnUrl: string
  cancelUrl?: string
  requestPayload: Record<string, unknown>
}): Promise<admin.firestore.DocumentReference> {
  const ref = db.collection("paymentSessions").doc()
  await ref.set({
    id: ref.id,
    orderCode: input.orderCode,
    provider: input.provider,
    status: "pending",
    amount: input.amount,
    currency: input.currency,
    returnUrl: input.returnUrl,
    cancelUrl: input.cancelUrl ?? null,
    providerExternalTxnRef: ref.id,
    requestPayload: input.requestPayload,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  } satisfies PaymentSessionRecord)
  return ref
}

async function patchPaymentSession(
  sessionId: string,
  patch: Partial<PaymentSessionRecord> & Record<string, unknown>
): Promise<void> {
  await db.collection("paymentSessions").doc(sessionId).set(
    {
      ...patch,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
}

async function updateOrdersByCode(
  orderCode: string,
  patcher: (
    data: admin.firestore.DocumentData
  ) => Record<string, unknown>
): Promise<number> {
  const collection = db.collection("orders")
  const byParent = await collection.where("parentCode", "==", orderCode).get()
  const snap = byParent.empty ? await collection.where("code", "==", orderCode).get() : byParent
  if (snap.empty) return 0

  const batch = db.batch()
  for (const docSnap of snap.docs) {
    batch.update(docSnap.ref, patcher(docSnap.data()))
  }
  await batch.commit()
  return snap.size
}

async function updatePaymentOrdersFromSession(input: {
  sessionId: string
  orderCode: string
  provider: PaymentProviderId
  nextStatus: PaymentStatus
  providerTxnId?: string
  rawPayload?: Record<string, unknown>
  note: string
}): Promise<number> {
  const updated = await updateOrdersByCode(input.orderCode, (data) => {
    const timelineStatus =
      input.nextStatus === "paid"
        ? data.status === "payment_pending"
          ? "awaiting_confirm"
          : String(data.status ?? "awaiting_confirm")
        : input.nextStatus === "pending"
          ? String(data.status ?? "payment_pending")
        : input.nextStatus === "cancelled" || input.nextStatus === "failed" || input.nextStatus === "expired"
          ? String(data.status ?? "payment_pending") === "payment_pending"
            ? "cancelled"
            : String(data.status ?? "cancelled")
          : String(data.status ?? "awaiting_confirm")

    const patch: Record<string, unknown> = {
      paymentStatus:
        input.nextStatus === "paid"
          ? "paid"
          : input.nextStatus === "pending"
            ? String(data.paymentStatus ?? "pending")
            : "failed",
      paymentProvider: input.provider,
      paymentProviderTxnRef: input.sessionId,
      paymentProviderExternalTxnId: input.providerTxnId ?? null,
      paymentWebhookAt: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      timeline: admin.firestore.FieldValue.arrayUnion({
        status: timelineStatus,
        timestamp: new Date().toISOString(),
        note: input.note,
      }),
    }

    if (input.nextStatus === "paid") {
      patch.status = timelineStatus
      patch.paymentConfirmedAt = admin.firestore.FieldValue.serverTimestamp()
    } else if (timelineStatus === "cancelled") {
      patch.status = timelineStatus
      patch.paymentFailedAt = admin.firestore.FieldValue.serverTimestamp()
    }

    if (input.rawPayload) {
      patch.paymentGatewayRaw = input.rawPayload
    }

    return patch
  })

  await patchPaymentSession(input.sessionId, {
    status: input.nextStatus,
    providerTxnId: input.providerTxnId ?? null,
    webhookPayload: input.rawPayload ?? null,
    ...(input.nextStatus === "paid"
      ? { paidAt: admin.firestore.FieldValue.serverTimestamp() }
      : input.nextStatus === "failed" || input.nextStatus === "expired" || input.nextStatus === "cancelled"
        ? { failedAt: admin.firestore.FieldValue.serverTimestamp() }
        : {}),
  })

  return updated
}

async function handleVnpayInit(req: Request, body: PaymentInitBody) {
  ensureConfigured("vnpay")
  const cfg = getPaymentCredentials("vnpay")
  const orderCode = body.orderCode || body.orderId
  const amount = asNumber(body.amount, 0)
  const returnUrl = body.returnUrl || body.return_url
  if (!orderCode || amount <= 0 || !returnUrl) {
    throw new Error("Thiếu orderCode, amount hoặc returnUrl")
  }

  const sessionRef = await createPaymentSession({
    orderCode,
    provider: "vnpay",
    amount,
    currency: asString(body.currency, "VND"),
    returnUrl,
    cancelUrl: body.cancelUrl || body.cancel_url || undefined,
    requestPayload: {
      orderCode,
      amount,
      description: body.orderInfo || body.description || "",
      returnUrl,
      cancelUrl: body.cancelUrl || body.cancel_url || "",
      buyerEmail: body.buyerEmail || "",
      buyerPhone: body.buyerPhone || "",
      metadata: body.metadata ?? null,
    },
  })

  const createDate = formatVnpDate(new Date())
  const expireDate = formatVnpDate(new Date(Date.now() + 15 * 60 * 1000))
  const tmnCode = asString(cfg.tmnCode)
  const hashSecret = asString(cfg.hashSecret)
  const apiUrl = asString(cfg.apiUrl)
  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(Math.round(amount * 100)),
    vnp_CurrCode: "VND",
    vnp_TxnRef: sessionRef.id,
    vnp_OrderInfo: (body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`).slice(0, 255),
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  }

  const sortedQuery = buildSortedQuery(params)
  const secureHash = hmacSha512(hashSecret, sortedQuery)
  const redirectUrl = `${apiUrl}?${sortedQuery}&vnp_SecureHash=${secureHash}`

  await patchPaymentSession(sessionRef.id, {
    paymentUrl: redirectUrl,
    responsePayload: {
      redirectUrl,
      sessionId: sessionRef.id,
      providerTxnRef: sessionRef.id,
    },
  })

  return {
    redirectUrl,
    providerTxnRef: sessionRef.id,
    paymentSessionId: sessionRef.id,
  }
}

async function handleMomoInit(req: Request, body: PaymentInitBody) {
  ensureConfigured("momo")
  const cfg = getPaymentCredentials("momo")
  const orderCode = body.orderCode || body.orderId
  const amount = asNumber(body.amount, 0)
  const returnUrl = body.redirectUrl || body.returnUrl || body.return_url
  if (!orderCode || amount <= 0 || !returnUrl) {
    throw new Error("Thiếu orderCode, amount hoặc returnUrl")
  }

  const sessionRef = await createPaymentSession({
    orderCode,
    provider: "momo",
    amount,
    currency: asString(body.currency, "VND"),
    returnUrl,
    cancelUrl: body.cancelUrl || body.cancel_url || undefined,
    requestPayload: {
      orderCode,
      amount,
      description: body.orderInfo || body.description || "",
      returnUrl,
      buyerEmail: body.buyerEmail || "",
      buyerPhone: body.buyerPhone || "",
      metadata: body.metadata ?? null,
    },
  })

  const requestId = `${sessionRef.id}_${Date.now()}`
  const extraData = Buffer.from(JSON.stringify(body.metadata ?? {}), "utf8").toString("base64")
  const partnerCode = asString(cfg.partnerCode)
  const accessKey = asString(cfg.accessKey)
  const secretKey = asString(cfg.secretKey)
  const apiUrl = asString(cfg.apiUrl)
  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${Math.round(amount)}`,
    `extraData=${extraData}`,
    `ipnUrl=${getWebhookUrl("momo")}`,
    `orderId=${sessionRef.id}`,
    `orderInfo=${body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${returnUrl}`,
    `requestId=${requestId}`,
    `requestType=payWithMethod`,
  ].join("&")
  const signature = hmacSha256(secretKey, rawSignature)
  const payload = {
    partnerCode,
    partnerName: "ACFMart",
    storeId: "ACFMart Store",
    requestId,
    amount: Math.round(amount),
    orderId: sessionRef.id,
    orderInfo: body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`,
    redirectUrl: returnUrl,
    ipnUrl: getWebhookUrl("momo"),
    lang: "vi",
    requestType: "payWithMethod",
    autoCapture: true,
    extraData,
    signature,
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`MoMo HTTP ${res.status}`)
  }
  if (!data?.payUrl) {
    throw new Error(data?.message ?? "MoMo trả về thiếu payUrl")
  }

  const redirectUrl = data.payUrl as string
  await patchPaymentSession(sessionRef.id, {
    providerTxnId: String(data.transId ?? sessionRef.id),
    paymentUrl: redirectUrl,
    responsePayload: data,
  })

  return {
    redirectUrl,
    providerTxnRef: sessionRef.id,
    paymentSessionId: sessionRef.id,
    qrCodeData: data.qrCodeUrl,
    deeplink: data.deeplink,
  }
}

async function handleZaloInit(req: Request, body: PaymentInitBody) {
  ensureConfigured("zalopay")
  const cfg = getPaymentCredentials("zalopay")
  const orderCode = body.orderCode || body.orderId
  const amount = asNumber(body.amount, 0)
  const returnUrl = body.embed_data && typeof body.embed_data === "object"
    ? asString((body.embed_data as Record<string, unknown>).redirecturl)
    : body.returnUrl || body.return_url || body.redirectUrl
  if (!orderCode || amount <= 0 || !returnUrl) {
    throw new Error("Thiếu orderCode, amount hoặc returnUrl")
  }

  const sessionRef = await createPaymentSession({
    orderCode,
    provider: "zalopay",
    amount,
    currency: asString(body.currency, "VND"),
    returnUrl,
    cancelUrl: body.cancelUrl || body.cancel_url || undefined,
    requestPayload: {
      orderCode,
      amount,
      description: body.orderInfo || body.description || "",
      returnUrl,
      buyerEmail: body.buyerEmail || "",
      buyerPhone: body.buyerPhone || "",
      metadata: body.metadata ?? null,
    },
  })

  const appTime = Date.now()
  const dateStr = new Date(appTime).toISOString().slice(2, 10).replace(/-/g, "")
  const appTransId = `${dateStr}_${sessionRef.id}`
  const appId = asString(cfg.appId)
  const key1 = asString(cfg.key1)
  const appUser = asString(
    body.app_user,
    body.buyerEmail || body.buyerPhone || "guest"
  )
  const embedData =
    typeof body.embed_data === "string"
      ? body.embed_data
      : JSON.stringify({
          redirecturl: returnUrl,
          ...(body.metadata ?? {}),
        })
  const item = "[]"
  const rawSignature = `${appId}|${appTransId}|${appUser}|${Math.round(amount)}|${appTime}|${embedData}|${item}`
  const mac = hmacSha256(key1, rawSignature)
  const payload = {
    app_id: Number(appId),
    app_trans_id: appTransId,
    app_user: appUser,
    app_time: appTime,
    amount: Math.round(amount),
    item,
    embed_data: embedData,
    description: body.orderInfo || body.description || `Thanh toan don hang ${orderCode}`,
    bank_code: "",
    callback_url: getWebhookUrl("zalopay"),
    mac,
  }

  const apiUrl = asString(cfg.apiUrl)
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`ZaloPay HTTP ${res.status}`)
  }
  if (Number(data?.return_code ?? 0) !== 1) {
    throw new Error(data?.return_message ?? "ZaloPay từ chối khởi tạo giao dịch")
  }

  const redirectUrl = asString(data.order_url)
  await patchPaymentSession(sessionRef.id, {
    providerExternalTxnRef: appTransId,
    providerTxnId: String(data.zp_trans_token ?? sessionRef.id),
    paymentUrl: redirectUrl || null,
    responsePayload: data,
  })

  return {
    redirectUrl: redirectUrl || undefined,
    providerTxnRef: sessionRef.id,
    paymentSessionId: sessionRef.id,
    qrData: asString(data.qr_code) || undefined,
    deeplink: data.zp_trans_token ? `zalopay://app?token=${data.zp_trans_token}` : undefined,
  }
}

function isSuccessStatus(provider: PaymentProviderId, body: Record<string, unknown>): boolean {
  if (provider === "vnpay") {
    return asString(body.vnp_ResponseCode) === "00" && asString(body.vnp_TransactionStatus) === "00"
  }
  if (provider === "momo") {
    return asNumber(body.resultCode, -1) === 0
  }
  if (provider === "zalopay") {
    return true
  }
  return false
}

function normalizeWebhookProvider(provider: string): PaymentProviderId | null {
  if (provider === "vnpay" || provider === "momo" || provider === "zalopay") return provider
  return null
}

async function handlePaymentWebhook(
  provider: PaymentProviderId,
  req: Request
): Promise<PaymentWebhookResult> {
  const rawBody =
    req.body && typeof req.body === "object" && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {}

  if (provider === "vnpay") {
    const body = (Object.keys(rawBody).length > 0 ? rawBody : req.query) as QueryLike & Record<string, unknown>
    const receivedHash = asString(body.vnp_SecureHash)
    const params: Record<string, string> = {}
    for (const [key, value] of Object.entries(body)) {
      if (key === "vnp_SecureHash" || key === "vnp_SecureHashType") continue
      if (Array.isArray(value)) {
        params[key] = value[0] ?? ""
      } else if (typeof value !== "undefined" && value !== null) {
        params[key] = String(value)
      }
    }
    const cfg = getPaymentCredentials("vnpay")
    const expectedHash = hmacSha512(asString(cfg.hashSecret), buildSortedQuery(params))
    if (!timingSafeEqualHex(receivedHash.toLowerCase(), expectedHash.toLowerCase())) {
      return { accepted: false, status: "failed" }
    }

    const sessionId = asString(body.vnp_TxnRef)
    const sessionSnap = await db.collection("paymentSessions").doc(sessionId).get()
    if (!sessionSnap.exists) {
      return { accepted: false, status: "failed" }
    }
    const session = sessionSnap.data() as PaymentSessionRecord
    const nextStatus = isSuccessStatus("vnpay", body as Record<string, unknown>)
      ? "paid"
      : asString(body.vnp_ResponseCode) === "24"
        ? "cancelled"
        : asString(body.vnp_ResponseCode) === "11"
          ? "expired"
          : "failed"

    await updatePaymentOrdersFromSession({
      sessionId,
      orderCode: session.orderCode,
      provider: "vnpay",
      nextStatus,
      providerTxnId: asString(body.vnp_TransactionNo) || undefined,
      rawPayload: body as Record<string, unknown>,
      note:
        nextStatus === "paid"
          ? "Thanh toán VNPay thành công"
          : `VNPay phản hồi: ${asString(body.vnp_ResponseCode, "unknown")}`,
    })

    return {
      accepted: true,
      status: nextStatus,
      sessionId,
      orderCode: session.orderCode,
      providerTxnId: asString(body.vnp_TransactionNo) || undefined,
    }
  }

  if (provider === "momo") {
    const body = rawBody
    const cfg = getPaymentCredentials("momo")
    const receivedSignature = asString(body.signature)
    const rawSignature = [
      `accessKey=${cfg.accessKey}`,
      `amount=${body.amount}`,
      `extraData=${body.extraData}`,
      `message=${body.message}`,
      `orderId=${body.orderId}`,
      `orderInfo=${body.orderInfo}`,
      `orderType=${body.orderType}`,
      `partnerCode=${body.partnerCode}`,
      `payType=${body.payType}`,
      `requestId=${body.requestId}`,
      `responseTime=${body.responseTime}`,
      `resultCode=${body.resultCode}`,
      `transId=${body.transId}`,
    ].join("&")
    const expectedSignature = hmacSha256(asString(cfg.secretKey), rawSignature)
    if (!timingSafeEqualHex(receivedSignature, expectedSignature)) {
      return { accepted: false, status: "failed" }
    }

    const sessionId = asString(body.orderId)
    const sessionSnap = await db.collection("paymentSessions").doc(sessionId).get()
    if (!sessionSnap.exists) {
      return { accepted: false, status: "failed" }
    }
    const session = sessionSnap.data() as PaymentSessionRecord
    const resultCode = asNumber(body.resultCode, -1)
    const nextStatus =
      resultCode === 0 ? "paid" : resultCode === 9000 ? "pending" : resultCode === 1005 ? "expired" : resultCode === 1006 ? "cancelled" : "failed"

    await updatePaymentOrdersFromSession({
      sessionId,
      orderCode: session.orderCode,
      provider: "momo",
      nextStatus,
      providerTxnId: asString(body.transId) || undefined,
      rawPayload: body,
      note:
        nextStatus === "paid"
          ? "Thanh toán MoMo thành công"
          : `MoMo phản hồi: ${asString(body.message, "unknown")}`,
    })

    return {
      accepted: true,
      status: nextStatus,
      sessionId,
      orderCode: session.orderCode,
      providerTxnId: asString(body.transId) || undefined,
    }
  }

  const body = rawBody
  const cfg = getPaymentCredentials("zalopay")
  const key2 = asString(cfg.key2)
  const data = asString(body.data)
  const receivedMac = asString(body.mac)
  const expectedMac = hmacSha256(key2, data)
  if (!timingSafeEqualHex(receivedMac, expectedMac)) {
    return { accepted: false, status: "failed" }
  }

  let parsed: Record<string, unknown> = {}
  try {
    parsed = JSON.parse(data) as Record<string, unknown>
  } catch {
    return { accepted: false, status: "failed" }
  }

  const appTransId = asString(parsed.app_trans_id)
  const sessionId = appTransId.includes("_") ? appTransId.split("_").slice(1).join("_") : appTransId
  const sessionSnap = await db.collection("paymentSessions").doc(sessionId).get()
  if (!sessionSnap.exists) {
    return { accepted: false, status: "failed" }
  }
  const session = sessionSnap.data() as PaymentSessionRecord

  await updatePaymentOrdersFromSession({
    sessionId,
    orderCode: session.orderCode,
    provider: "zalopay",
    nextStatus: "paid",
    providerTxnId: asString(parsed.zp_trans_id) || undefined,
    rawPayload: parsed,
    note: "Thanh toán ZaloPay thành công",
  })

  return {
    accepted: true,
    status: "paid",
    sessionId,
    orderCode: session.orderCode,
    providerTxnId: asString(parsed.zp_trans_id) || undefined,
  }
}

async function handleStatusLookup(paymentId: string) {
  const match = await findPaymentSession(paymentId)
  if (match) {
    const session = match.session
    return {
      status: session.status === "paid" ? "confirmed" : session.status,
      transactionId: session.providerTxnId ?? session.id,
      amount: session.amount,
      currency: session.currency,
      paymentMethod: session.provider,
      paidAt: (session.paidAt as admin.firestore.Timestamp | undefined)?.toDate?.()?.toISOString?.(),
    }
  }

  return null
}

async function findPaymentSession(paymentId: string): Promise<{ id: string; session: PaymentSessionRecord } | null> {
  const directSnap = await db.collection("paymentSessions").doc(paymentId).get()
  if (directSnap.exists) {
    return { id: directSnap.id, session: directSnap.data() as PaymentSessionRecord }
  }

  const byProviderTxn = await db
    .collection("paymentSessions")
    .where("providerTxnId", "==", paymentId)
    .limit(1)
    .get()
  if (!byProviderTxn.empty) {
    const docSnap = byProviderTxn.docs[0]
    return { id: docSnap.id, session: docSnap.data() as PaymentSessionRecord }
  }

  const byOrderCode = await db
    .collection("paymentSessions")
    .where("orderCode", "==", paymentId)
    .limit(1)
    .get()
  if (!byOrderCode.empty) {
    const docSnap = byOrderCode.docs[0]
    return { id: docSnap.id, session: docSnap.data() as PaymentSessionRecord }
  }

  const orderSnap = await db
    .collection("orders")
    .where("code", "==", paymentId)
    .limit(1)
    .get()
  if (!orderSnap.empty) {
    const order = orderSnap.docs[0].data() as Record<string, unknown>
    const sessionId = asString(order.paymentProviderTxnRef)
    if (sessionId) {
      const sessionSnap = await db.collection("paymentSessions").doc(sessionId).get()
      if (sessionSnap.exists) {
        return { id: sessionSnap.id, session: sessionSnap.data() as PaymentSessionRecord }
      }
    }
  }

  return null
}

async function handleRefund(body: Record<string, unknown>) {
  const paymentId = asString(body.paymentId ?? body.payment_id)
  const amount = asNumber(body.amount, 0)
  const reason = asString(body.reason)
  if (!paymentId || amount <= 0 || !reason) {
    throw new Error("Thiếu paymentId, amount hoặc reason")
  }

  const match = await findPaymentSession(paymentId)
  if (!match) {
    throw new Error("Không tìm thấy payment session")
  }
  const session = match.session
  if (amount > session.amount) {
    throw new Error("Số tiền hoàn vượt quá số tiền giao dịch")
  }

  const providerTxnId = asString(session.providerTxnId)
  let providerResult: RefundExecutionResult | null = null
  let refundStatus: RefundStatus = "pending"
  let usedProviderAdapter = false
  try {
    providerResult = await executeProviderRefund({
      provider: session.provider,
      providerTxnId,
      amount,
      reason,
      sessionId: match.id,
    })
    usedProviderAdapter = true
    refundStatus = normalizeRefundStatus(providerResult.status)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi hoàn tiền"
    console.warn("Provider refund fallback to pending", {
      paymentId,
      provider: session.provider,
      message,
    })
    providerResult = null
    refundStatus = "pending"
  }

  const refundId = providerResult?.providerRefundId ?? `refund_${paymentId}_${Date.now()}`
  await patchPaymentSession(match.id, {
    status: "refunded",
    refundStatus,
    refundProviderRef: providerResult?.providerRequestId ?? refundId,
    refundProviderTxnId: providerTxnId || null,
    refundRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
    refundCompletedAt: refundStatus === "completed" ? admin.firestore.FieldValue.serverTimestamp() : null,
    refundPayload: providerResult?.rawResponse ?? {
      refundRequested: true,
      reason,
      amount,
    },
    responsePayload: {
      refundRequested: true,
      reason,
      amount,
      provider: session.provider,
      refundStatus,
      providerRefundId: refundId,
    },
  })

  await updateOrdersByCode(session.orderCode, (data) => ({
    paymentStatus: "refunded",
    paymentRefundReason: reason,
    paymentRefundAmount: amount,
    paymentRefundStatus: refundStatus,
    paymentRefundProvider: session.provider,
    paymentRefundProviderTxnId: providerTxnId || null,
    paymentRefundProviderRef: providerResult?.providerRequestId ?? refundId,
    paymentRefundProviderRaw: providerResult?.rawResponse ?? null,
    paymentRefundRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
    paymentRefundCompletedAt: refundStatus === "completed" ? admin.firestore.FieldValue.serverTimestamp() : data.paymentRefundCompletedAt ?? null,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    timeline: admin.firestore.FieldValue.arrayUnion({
      status: "refunded",
      timestamp: new Date().toISOString(),
      note: `Hoàn tiền: ${reason}`,
    }),
  }))

  return {
    success: true,
    refundId,
    status: refundStatus === "completed" ? "completed" : "pending",
    message: refundStatus === "completed"
      ? `Đã hoàn tiền qua ${session.provider.toUpperCase()}`
      : usedProviderAdapter
        ? `Yêu cầu hoàn tiền đã được ghi nhận qua ${session.provider.toUpperCase()} và đang chờ đối tác xử lý.`
        : "Yêu cầu hoàn tiền đã được ghi nhận nội bộ và đang chờ xử lý.",
  }
}

async function handleRefundStatusLookup(paymentId: string) {
  const match = await findPaymentSession(paymentId)
  if (!match) return null

  const session = match.session
  const providerTxnId = asString(session.providerTxnId)
  const providerRequestId = asString(session.refundProviderRef)
  const lookupTxnId = providerTxnId || providerRequestId || match.id

  const providerResult = await queryProviderRefundStatus({
    provider: session.provider,
    providerTxnId: lookupTxnId,
    providerRequestId,
  })

  if (!providerResult) {
    return {
      success: true,
      paymentId: match.id,
      provider: session.provider,
      status: session.refundStatus ?? "pending",
      refundId: providerRequestId || match.id,
    }
  }

  const status = normalizeRefundStatus(providerResult.status)
  await patchPaymentSession(match.id, {
    refundStatus: status,
    refundProviderRef: providerResult.providerRequestId,
    refundProviderTxnId: providerTxnId,
    refundCompletedAt: status === "completed" ? admin.firestore.FieldValue.serverTimestamp() : null,
    refundPayload: providerResult.rawResponse,
  })

  return {
    success: true,
    paymentId: match.id,
    provider: session.provider,
    status,
    refundId: providerResult.providerRefundId,
    raw: providerResult.rawResponse,
  }
}

export const paymentApi = onRequest(
  { region, cors: false },
  async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-publishable-api-key, idempotency-key")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")

    if (req.method === "OPTIONS") {
      res.status(204).send("")
      return
    }

    try {
      const path = req.path.replace(/\/+$/, "") || "/"

      if (req.method === "GET" && path === "/store/payment/methods") {
        res.json({ success: true, methods: paymentMethods() })
        return
      }

      if (req.method === "POST" && path === "/store/payment/vnpay/sign") {
        const result = await handleVnpayInit(req, normalizeBody(req.body))
        res.json({ success: true, ...result })
        return
      }

      if (req.method === "POST" && path === "/store/payment/momo/init") {
        const result = await handleMomoInit(req, normalizeBody(req.body))
        res.json({ success: true, ...result })
        return
      }

      if (req.method === "POST" && path === "/store/payment/zalopay/init") {
        const result = await handleZaloInit(req, normalizeBody(req.body))
        res.json({ success: true, ...result })
        return
      }

      const webhookMatch = path.match(/^\/store\/payment\/webhook\/([^/]+)$/)
      if (webhookMatch && (req.method === "POST" || req.method === "GET")) {
        const provider = normalizeWebhookProvider(webhookMatch[1] ?? "")
        if (!provider) {
          res.status(404).json({ success: false, message: "Provider không hỗ trợ" })
          return
        }

        const result = await handlePaymentWebhook(provider, req)
        if (provider === "vnpay") {
          res.status(200).json({
            RspCode: result.accepted ? "00" : "97",
            Message: result.accepted ? "Confirm Success" : "Invalid Signature",
          })
          return
        }

        if (provider === "momo") {
          res.status(result.accepted ? 204 : 401).send("")
          return
        }

        res.status(200).json({
          return_code: result.accepted ? 1 : 2,
          return_message: result.accepted ? "Success" : "Invalid",
        })
        return
      }

      const statusMatch = path.match(/^\/store\/payment\/status\/([^/]+)$/)
      if (req.method === "GET" && statusMatch) {
        const paymentId = decodeURIComponent(statusMatch[1] ?? "")
        const status = await handleStatusLookup(paymentId)
        if (!status) {
          res.status(404).json({ success: false, message: "Không tìm thấy payment session" })
          return
        }
        res.json({ success: true, ...status })
        return
      }

      if (req.method === "POST" && path === "/store/payment/refund") {
        const result = await handleRefund(normalizeBody(req.body))
        res.json(result)
        return
      }

      const refundStatusMatch = path.match(/^\/store\/payment\/refund\/status\/([^/]+)$/)
      if (req.method === "GET" && refundStatusMatch) {
        const paymentId = decodeURIComponent(refundStatusMatch[1] ?? "")
        const result = await handleRefundStatusLookup(paymentId)
        if (!result) {
          res.status(404).json({ success: false, message: "Không tìm thấy refund session" })
          return
        }
        res.json(result)
        return
      }

      if (req.method === "POST" && path === "/store/payment/webhook/validate") {
        res.json({ success: true, valid: true })
        return
      }

      res.status(404).json({ success: false, message: "Endpoint payment không tồn tại" })
    } catch (error) {
      console.error("Payment API error:", error)
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Lỗi server nội bộ",
      })
    }
  }
)
