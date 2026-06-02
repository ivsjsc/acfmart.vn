import { getBuyerOrderByCode, listBuyerOrders, type OrderDoc } from "../../lib/order-service"
import { getMyVendor, type VendorDoc } from "../../lib/vendor-service"
import { formatCurrency } from "../../lib/format"
import type { User } from "../../stores/auth-store"
import {
  buildOfflineKnowledgeReply,
  findRelevantKnowledge,
  knowledgeEntriesToText,
  normalizeVietnameseSearch,
} from "./aivy-knowledge"
import { findAivyHelpAnswer } from "./help-answer-service"

export type AivyIntent =
  | "order_lookup"
  | "account_navigation"
  | "qr_guidance"
  | "policy_question"
  | "seller_support"
  | "counterfeit_report"
  | "general"

export interface AivyRuntimeContext {
  intents: AivyIntent[]
  mode: "offline" | "online" | "ai"
  text: string
  directReply?: string
}

interface BuildAivyContextInput {
  user: User | null
  message: string
}

const STATUS_LABELS: Record<string, string> = {
  payment_pending: "Chờ thanh toán",
  awaiting_confirm: "Chờ seller xác nhận",
  pending: "Đang chờ",
  confirmed: "Đã xác nhận",
  packed: "Đã đóng gói",
  ready_pickup: "Chờ lấy hàng",
  shipping: "Đang giao",
  delivered: "Đã giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  return_requested: "Đang yêu cầu trả hàng",
  returned: "Đã trả hàng",
  refunded: "Đã hoàn tiền",
}

const VENDOR_STATUS_LABELS: Record<string, string> = {
  pending: "Đang chờ duyệt",
  active: "Đã duyệt/đang hoạt động",
  suspended: "Đang bị tạm khóa",
  rejected: "Bị từ chối",
}

function includesAny(normalized: string, terms: string[]) {
  return terms.some((term) => normalized.includes(term))
}

export function detectAivyIntents(message: string): AivyIntent[] {
  const normalized = normalizeVietnameseSearch(message)
  const intents: AivyIntent[] = []

  if (
    includesAny(normalized, [
      "don hang",
      "ma don",
      "van don",
      "tracking",
      "van chuyen",
      "giao hang",
      "tra cuu don",
    ])
  ) {
    intents.push("order_lookup")
  }

  if (
    includesAny(normalized, [
      "vi",
      "wallet",
      "diem thuong",
      "diem",
      "loyalty",
      "voucher",
      "ma giam",
    ])
  ) {
    intents.push("account_navigation")
  }

  if (
    includesAny(normalized, ["qr", "xac thuc", "tem", "chinh hang", "serial"])
  ) {
    intents.push("qr_guidance")
  }

  if (
    includesAny(normalized, [
      "chinh sach",
      "doi tra",
      "hoan tien",
      "bao mat",
      "du lieu",
      "dieu khoan",
      "van chuyen",
      "thanh toan",
    ])
  ) {
    intents.push("policy_question")
  }

  if (
    includesAny(normalized, [
      "seller",
      "nguoi ban",
      "ban hang",
      "dang ky ban",
      "mo shop",
      "kenh nguoi ban",
      "trang thai ho so",
    ])
  ) {
    intents.push("seller_support")
  }

  if (
    includesAny(normalized, [
      "hang gia",
      "bao cao",
      "nghi van",
      "counterfeit",
      "gia mao",
      "san pham gia",
    ])
  ) {
    intents.push("counterfeit_report")
  }

  return intents.length > 0 ? Array.from(new Set(intents)) : ["general"]
}

function extractOrderCode(message: string): string | null {
  const matches = message.match(/\b[A-Z0-9][A-Z0-9_-]{5,32}\b/gi) ?? []
  const ignored = new Set(["ACFMART", "SELLER", "VOUCHER", "WALLET"])
  return matches.find((item) => !ignored.has(item.toUpperCase())) ?? null
}

function extractLikelyQrCode(message: string): string | null {
  const matches = message.match(/\b[A-Z0-9][A-Z0-9:_-]{7,80}\b/gi) ?? []
  return matches.find((item) => /[0-9]/.test(item) && /[A-Z]/i.test(item)) ?? null
}

function formatDate(value: unknown): string {
  if (!value) return "Chưa có"
  if (typeof value === "string") return value
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value.toDate())
  }
  return "Chưa có"
}

function orderToContext(order: OrderDoc): string {
  const lastTimeline = order.timeline?.[order.timeline.length - 1]
  const itemSummary = order.items
    .slice(0, 3)
    .map((item) => `${item.title} x${item.quantity}`)
    .join("; ")
  return [
    `- Mã đơn: ${order.code}`,
    `  Trạng thái: ${STATUS_LABELS[order.status] ?? order.status}`,
    `  Shop: ${order.shopName}`,
    `  Tổng tiền: ${formatCurrency(order.total)}`,
    `  Vận chuyển: ${order.shippingMethod}${order.trackingNumber ? `, mã ${order.trackingNumber}` : ", chưa có mã vận đơn"}`,
    `  Sản phẩm: ${itemSummary || "Chưa có dữ liệu sản phẩm"}`,
    `  Cập nhật: ${lastTimeline?.note || STATUS_LABELS[lastTimeline?.status ?? ""] || "Chưa có"}`,
  ].join("\n")
}

async function buildOrderContext(user: User | null, message: string): Promise<string> {
  if (!user?.id) {
    return [
      "Bạn cần đăng nhập để tra cứu đơn hàng.",
      "Aivy chỉ kiểm tra đơn hàng của tài khoản đang đăng nhập. Liên kết: /login, /account/orders",
    ].join("\n")
  }

  const orderCode = extractOrderCode(message)
  if (orderCode) {
    try {
      const order = await getBuyerOrderByCode(orderCode, user.id)
      if (!order) {
        return [
          `Em không tìm thấy mã đơn ${orderCode} trong tài khoản đang đăng nhập.`,
          "Bạn kiểm tra lại mã đơn hoặc mở /account/orders để xem danh sách đơn của mình.",
        ].join("\n")
      }
      return [
        "Em tìm thấy đơn hàng của bạn:",
        orderToContext(order),
        "Chi tiết đầy đủ: /account/orders",
      ].join("\n")
    } catch {
      return [
        `Em chưa tải được mã đơn ${orderCode}.`,
        "Bạn thử lại sau hoặc mở /account/orders để kiểm tra trực tiếp.",
      ].join("\n")
    }
  }

  let orders: OrderDoc[] = []
  try {
    orders = await listBuyerOrders({ customerId: user.id, limitCount: 5 })
  } catch {
    return [
      "Em chưa tải được danh sách đơn hàng.",
      "Bạn mở /account/orders để kiểm tra trực tiếp hoặc thử lại sau.",
    ].join("\n")
  }
  if (orders.length === 0) {
    return [
      "Tài khoản của bạn chưa có đơn hàng nào.",
      "Bạn có thể kiểm tra lại tại /account/orders.",
    ].join("\n")
  }

  return [
    "Các đơn gần nhất của bạn:",
    orders.slice(0, 3).map(orderToContext).join("\n\n"),
    "Xem đầy đủ tại /account/orders.",
  ].join("\n")
}

function buildAccountNavigationContext() {
  return [
    "Aivy không đọc số dư ví, điểm thưởng hoặc voucher trong chat.",
    "Bạn tự xem tại:",
    "- Ví: /account/wallet",
    "- Điểm thưởng: /account/loyalty",
    "- Voucher: /account/vouchers",
  ].join("\n")
}

function wantsSellerStatus(message: string) {
  const normalized = normalizeVietnameseSearch(message)
  return includesAny(normalized, [
    "trang thai",
    "ho so",
    "shop cua toi",
    "kiem tra shop",
    "duyet",
    "bi tu choi",
    "active",
  ])
}

async function buildSellerContext(user: User | null) {
  if (!user?.id) {
    return [
      "Bạn cần đăng nhập để dùng hỗ trợ seller.",
      "Sau đó mở /seller-register để đăng ký hoặc /seller-channel để kiểm tra hồ sơ.",
    ].join("\n")
  }

  try {
    const { vendor, registered } = await getMyVendor(user.id)
    if (!registered || !vendor) {
      return [
        "Tài khoản này chưa có hồ sơ seller.",
        "Quy trình: mở /seller-register, điền thông tin shop, địa chỉ lấy hàng, ngân hàng, giấy tờ cần thiết, gửi hồ sơ và chờ duyệt.",
        "Liên kết: /seller-register, /seller-channel, /guide/seller",
      ].join("\n")
    }

    return [
      "Trạng thái hồ sơ seller của bạn:",
      `- Shop: ${vendor.shop_name}`,
      `- Trạng thái: ${VENDOR_STATUS_LABELS[vendor.status] ?? vendor.status}`,
      `- KYC: ${vendor.kyc_level}`,
      `- Lý do từ chối/tạm khóa: ${vendor.rejected_reason || "Không có"}`,
      `- Cập nhật: ${formatDate(vendor.updated_at)}`,
      vendor.status === "active"
        ? "Tiếp theo: mở /seller để quản lý shop."
        : "Tiếp theo: kiểm tra hồ sơ, bổ sung giấy tờ nếu cần.",
    ].join("\n")
  } catch (err) {
    return [
      "Em chưa tải được trạng thái seller.",
      "Bạn mở /seller-channel hoặc /seller-register để kiểm tra trực tiếp.",
    ].join("\n")
  }
}

function buildCounterfeitContext(message: string) {
  const qrCode = extractLikelyQrCode(message)
  const params = new URLSearchParams()
  if (qrCode) params.set("qrCode", qrCode)

  const reportHref = params.toString()
    ? `/report-counterfeit?${params.toString()}`
    : "/report-counterfeit"

  return [
    "Bạn báo cáo hàng giả tại:",
    reportHref,
    "Chuẩn bị QR/serial, tên sản phẩm, lý do nghi vấn, ảnh tem/bao bì/hóa đơn. Aivy không tự gửi báo cáo nếu bạn chưa xác nhận rõ.",
  ].join("\n")
}

function buildQrContext() {
  return [
    "Mở /qr-verify để quét QR hoặc nhập mã thủ công.",
    "Nếu kết quả nghi vấn/không hợp lệ, gửi báo cáo tại /report-counterfeit.",
  ].join("\n")
}

function isGreetingOrCapabilityQuestion(message: string) {
  const normalized = normalizeVietnameseSearch(message)
  return includesAny(normalized, [
    "xin chao",
    "hello",
    "hi",
    "chao",
    "ban la ai",
    "aivy la ai",
    "ho tro gi",
    "lam duoc gi",
    "giup duoc gi",
    "help",
  ])
}

function buildAivyCapabilityReply() {
  return [
    "Em là Aivy, trợ lý AI thuộc sở hữu IVS JSC trên ACFMart.vn.",
    "Hiện em hỗ trợ: tra cứu đơn hàng của tài khoản đang đăng nhập, hướng dẫn QR xác thực, chính sách đổi trả/vận chuyển/thanh toán, đăng ký seller và báo cáo hàng giả.",
    "Bạn có thể hỏi: “Tra cứu đơn hàng của tôi”, “Chính sách đổi trả thế nào?”, hoặc “Tôi muốn báo cáo hàng giả”.",
  ].join("\n")
}

export function buildAivyUnavailableReply() {
  return [
    "Aivy đang chưa kết nối được AI nâng cao, nhưng em vẫn hỗ trợ được các mục có sẵn:",
    "- Tra cứu đơn hàng của tôi",
    "- Hướng dẫn QR xác thực",
    "- Chính sách đổi trả, vận chuyển, thanh toán",
    "- Đăng ký seller hoặc báo cáo hàng giả",
    "Nếu cần hỗ trợ gấp, bạn gọi 1900 066 689 hoặc mở /contact.",
  ].join("\n")
}

export async function buildAivyRuntimeContext({
  user,
  message,
}: BuildAivyContextInput): Promise<AivyRuntimeContext> {
  const intents = detectAivyIntents(message)
  const sections: string[] = []
  const knowledge = findRelevantKnowledge(message)
  const directReplies: string[] = []

  if (!user?.id) {
    return {
      intents,
      mode: "offline",
      text: "Aivy yêu cầu đăng nhập trước khi sử dụng.",
      directReply: "Bạn cần đăng nhập để sử dụng Aivy. Vui lòng mở /login rồi thử lại.",
    }
  }

  sections.push(
    [
      "NGU CANH HE THONG CHO AIVY",
      `Trang thai dang nhap: ${user ? "Da dang nhap" : "Chua dang nhap"}`,
      user ? `User hien tai: ${user.id} (${user.role})` : "Khong co user hien tai",
      "Gioi han an toan: chi doc du lieu khi context ben duoi cung cap; khong sua/xoa/submit/doi mat khau/rut vi/doi diem.",
    ].join("\n")
  )

  if (isGreetingOrCapabilityQuestion(message)) {
    directReplies.push(buildAivyCapabilityReply())
  }

  if (intents.includes("order_lookup")) {
    directReplies.push(await buildOrderContext(user, message))
  }

  if (intents.includes("account_navigation")) {
    directReplies.push(buildOfflineKnowledgeReply(knowledge) || buildAccountNavigationContext())
  }

  if (intents.includes("seller_support") && wantsSellerStatus(message)) {
    directReplies.push(await buildSellerContext(user))
  } else if (intents.includes("seller_support")) {
    const offlineReply = buildOfflineKnowledgeReply(knowledge)
    if (offlineReply) directReplies.push(offlineReply)
  }

  if (intents.includes("counterfeit_report")) {
    directReplies.push(buildCounterfeitContext(message))
  }

  if (intents.includes("qr_guidance")) {
    const offlineReply = buildOfflineKnowledgeReply(knowledge)
    directReplies.push(offlineReply || buildQrContext())
  }

  if (intents.includes("policy_question")) {
    const offlineReply = buildOfflineKnowledgeReply(knowledge)
    if (offlineReply) directReplies.push(offlineReply)
  }

  if (directReplies.length === 0) {
    const offlineReply = buildOfflineKnowledgeReply(knowledge)
    if (offlineReply) {
      directReplies.push(offlineReply)
    } else {
      // Fallback: tra Trung tâm trợ giúp cho câu hỏi tự do liên quan help.
      const helpReply = findAivyHelpAnswer(message)
      if (helpReply) directReplies.push(helpReply)
    }
  }

  const uniqueReplies = Array.from(new Set(directReplies.filter(Boolean)))
  if (uniqueReplies.length > 0) {
    return {
      intents,
      mode: intents.includes("order_lookup") || (intents.includes("seller_support") && wantsSellerStatus(message))
        ? "online"
        : "offline",
      text: uniqueReplies.join("\n\n").slice(0, 4000),
      directReply: uniqueReplies.join("\n\n"),
    }
  }

  const knowledgeText = knowledgeEntriesToText(knowledge)
  if (knowledgeText) {
    sections.push(["KHO FAQ/CHINH SACH LIEN QUAN:", knowledgeText].join("\n"))
  }

  return {
    intents,
    mode: knowledge.some((entry) => entry.mode === "online") ? "online" : "ai",
    text: sections.join("\n\n---\n\n").slice(0, 12000),
  }
}
