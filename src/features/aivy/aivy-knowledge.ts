export type AivyAnswerMode = "offline" | "online" | "ai"

export interface AivyKnowledgeEntry {
  id: string
  title: string
  mode: AivyAnswerMode
  keywords: string[]
  answer: string
  links: Array<{ label: string; href: string }>
}

export const AIVY_KNOWLEDGE_BASE: AivyKnowledgeEntry[] = [
  {
    id: "identity",
    title: "Aivy thuộc IVS JSC",
    mode: "offline",
    keywords: ["aivy", "ban la ai", "bạn là ai", "ai tao", "ai tạo", "so huu", "sở hữu", "ivs"],
    answer:
      "Em là Aivy, trợ lý AI thuộc sở hữu của IVS JSC, hỗ trợ người dùng ACFMart.vn về đơn hàng, QR xác thực, chính sách, seller và báo cáo hàng giả.",
    links: [{ label: "Giới thiệu ACFMart", href: "/about" }],
  },
  {
    id: "order-lookup",
    title: "Tra cứu đơn hàng",
    mode: "online",
    keywords: ["don hang", "đơn hàng", "ma don", "mã đơn", "van don", "vận đơn", "tracking", "giao hang"],
    answer:
      "Cần dữ liệu online. Aivy chỉ được xem đơn hàng của tài khoản đang đăng nhập và chỉ trả trạng thái, shop, tổng tiền, vận chuyển, mã vận đơn nếu có.",
    links: [{ label: "Đơn hàng của tôi", href: "/account/orders" }],
  },
  {
    id: "account-wallet-loyalty-voucher",
    title: "Ví, điểm thưởng, voucher",
    mode: "offline",
    keywords: ["vi", "ví", "wallet", "diem", "điểm", "diem thuong", "điểm thưởng", "loyalty", "voucher", "ma giam"],
    answer:
      "Bạn tự xem trong tài khoản: Ví tại /account/wallet, điểm thưởng tại /account/loyalty, voucher tại /account/vouchers. Aivy không đọc số dư ví, điểm hoặc voucher trong chat.",
    links: [
      { label: "Ví", href: "/account/wallet" },
      { label: "Điểm thưởng", href: "/account/loyalty" },
      { label: "Voucher", href: "/account/vouchers" },
    ],
  },
  {
    id: "qr-guide",
    title: "Quét QR xác thực",
    mode: "offline",
    keywords: ["qr", "xác thực", "xac thuc", "tem", "chính hãng", "chinh hang", "serial"],
    answer:
      "Mở /qr-verify, quét QR trên bao bì gốc hoặc nhập mã thủ công. Nếu kết quả nghi vấn/không hợp lệ, chụp tem, bao bì, hóa đơn rồi gửi báo cáo tại /report-counterfeit.",
    links: [
      { label: "Xác thực QR", href: "/qr-verify" },
      { label: "Báo cáo hàng giả", href: "/report-counterfeit" },
    ],
  },
  {
    id: "return-policy",
    title: "Đổi trả",
    mode: "offline",
    keywords: ["doi tra", "đổi trả", "tra hang", "trả hàng", "hoan tien", "hoàn tiền", "refund"],
    answer:
      "ACFMart hỗ trợ đổi/trả trong 7 ngày với hàng lỗi, khác mô tả hoặc có nghi vấn. Vào đơn hàng, chọn yêu cầu trả hàng và chuẩn bị ảnh/video bằng chứng.",
    links: [{ label: "Chính sách đổi trả", href: "/legal/return" }],
  },
  {
    id: "shipping-policy",
    title: "Vận chuyển",
    mode: "offline",
    keywords: ["van chuyen", "vận chuyển", "giao hang", "giao hàng", "ghn", "ghtk", "j&t", "jnt"],
    answer:
      "Thời gian giao thường 2-4 ngày toàn quốc, tùy địa chỉ và đơn vị vận chuyển. Mã vận đơn sẽ hiển thị trong chi tiết đơn khi shop cập nhật.",
    links: [
      { label: "Chính sách vận chuyển", href: "/legal/shipping" },
      { label: "Theo dõi đơn", href: "/account/orders" },
    ],
  },
  {
    id: "payment-policy",
    title: "Thanh toán",
    mode: "offline",
    keywords: ["thanh toan", "thanh toán", "vnpay", "momo", "zalopay", "visa", "cod"],
    answer:
      "ACFMart hỗ trợ VNPay, MoMo, ZaloPay, thẻ quốc tế và COD tùy đơn hàng/shop. Nếu thanh toán lỗi, kiểm tra lại trạng thái đơn hoặc liên hệ hỗ trợ.",
    links: [{ label: "Chính sách thanh toán", href: "/legal/payment" }],
  },
  {
    id: "data-protection",
    title: "Dữ liệu cá nhân",
    mode: "offline",
    keywords: ["du lieu", "dữ liệu", "bao mat", "bảo mật", "quyen rieng tu", "quyền riêng tư", "pdpd", "xoa tai khoan"],
    answer:
      "Bạn quản lý đồng ý, xuất dữ liệu, hạn chế xử lý hoặc yêu cầu xoá dữ liệu tại /account/settings?tab=privacy. Chi tiết nằm trong Chính sách Bảo vệ Dữ liệu Cá nhân.",
    links: [
      { label: "Quyền riêng tư", href: "/account/settings?tab=privacy" },
      { label: "Chính sách dữ liệu", href: "/legal/data-protection" },
    ],
  },
  {
    id: "terms-policy",
    title: "Điều khoản sử dụng",
    mode: "offline",
    keywords: ["dieu khoan", "điều khoản", "quy dinh", "quy định", "tai khoan bi khoa", "khóa tài khoản"],
    answer:
      "Bạn cần dùng tài khoản đúng thông tin, không gian lận, không lạm dụng khiếu nại/đổi trả và tuân thủ quy định sàn. Tài khoản vi phạm có thể bị hạn chế hoặc khóa.",
    links: [{ label: "Điều khoản", href: "/legal/terms" }],
  },
  {
    id: "seller-register",
    title: "Đăng ký seller",
    mode: "offline",
    keywords: ["seller", "nguoi ban", "người bán", "ban hang", "bán hàng", "mo shop", "mở shop", "dang ky ban"],
    answer:
      "Quy trình: đăng nhập, mở /seller-register, điền thông tin shop, địa chỉ lấy hàng, ngân hàng, giấy tờ cần thiết, gửi hồ sơ và chờ duyệt.",
    links: [
      { label: "Đăng ký bán hàng", href: "/seller-register" },
      { label: "Hướng dẫn seller", href: "/guide/seller" },
    ],
  },
  {
    id: "seller-status",
    title: "Trạng thái hồ sơ seller",
    mode: "online",
    keywords: ["trang thai ho so", "trạng thái hồ sơ", "ho so seller", "hồ sơ seller", "shop cua toi", "shop của tôi"],
    answer:
      "Cần dữ liệu online. Aivy chỉ kiểm tra hồ sơ seller thuộc tài khoản đang đăng nhập.",
    links: [{ label: "Kênh người bán", href: "/seller-channel" }],
  },
  {
    id: "counterfeit-report",
    title: "Báo cáo hàng giả",
    mode: "offline",
    keywords: ["hang gia", "hàng giả", "bao cao", "báo cáo", "nghi van", "nghi vấn", "gia mao", "giả mạo", "counterfeit"],
    answer:
      "Vào /report-counterfeit, nhập QR/serial, tên sản phẩm, lý do nghi vấn và tải ảnh tem, bao bì, hóa đơn. Aivy không tự gửi báo cáo nếu bạn chưa xác nhận rõ.",
    links: [{ label: "Báo cáo hàng giả", href: "/report-counterfeit" }],
  },
  {
    id: "support-contact",
    title: "Liên hệ hỗ trợ",
    mode: "offline",
    keywords: ["ho tro", "hỗ trợ", "lien he", "liên hệ", "hotline", "cskh", "support"],
    answer:
      "Bạn có thể vào /contact hoặc gọi hotline 1900 066 689. Với vấn đề đơn hàng, nên gửi kèm mã đơn để được xử lý nhanh.",
    links: [{ label: "Liên hệ", href: "/contact" }],
  },
]

export function normalizeVietnameseSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
}

function scoreEntry(entry: AivyKnowledgeEntry, normalizedMessage: string): number {
  return entry.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeVietnameseSearch(keyword)
    return normalizedMessage.includes(normalizedKeyword) ? score + normalizedKeyword.length : score
  }, 0)
}

export function findRelevantKnowledge(message: string, limit = 3): AivyKnowledgeEntry[] {
  const normalized = normalizeVietnameseSearch(message)
  return AIVY_KNOWLEDGE_BASE.map((entry) => ({
    entry,
    score: scoreEntry(entry, normalized),
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry)
}

export function buildOfflineKnowledgeReply(entries: AivyKnowledgeEntry[]): string {
  const offlineEntries = entries.filter((entry) => entry.mode === "offline").slice(0, 2)
  if (offlineEntries.length === 0) return ""

  return offlineEntries
    .map((entry) => {
      const links = entry.links
        .slice(0, 3)
        .map((item) => `${item.label}: ${item.href}`)
        .join("\n")
      return links ? `${entry.answer}\n${links}` : entry.answer
    })
    .join("\n\n")
}

export function knowledgeEntriesToText(entries: AivyKnowledgeEntry[]): string {
  if (entries.length === 0) return ""

  return entries
    .map((entry) => {
      const links = entry.links.map((item) => `- ${item.label}: ${item.href}`).join("\n")
      return [
        `### ${entry.title}`,
        `Che do: ${entry.mode}`,
        entry.answer,
        "Lien ket:",
        links,
      ].join("\n")
    })
    .join("\n\n")
}
