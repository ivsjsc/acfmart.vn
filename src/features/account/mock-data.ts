export interface MockAddress {
  id: string
  label: "home" | "office" | "other"
  name: string
  phone: string
  address: string
  ward: string
  district: string
  city: string
  isDefault: boolean
}

export interface MockVoucher {
  id: string
  code: string
  title: string
  description: string
  discountType: "percent" | "fixed" | "shipping"
  discountValue: number
  maxDiscount?: number
  minOrder: number
  expiresAt: string
  status: "available" | "used" | "expired"
  appliesTo?: string
  usedAt?: string
}

export interface MockWalletTransaction {
  id: string
  date: string
  type: "topup" | "payment" | "refund" | "cashback" | "withdraw"
  amount: number
  balance: number
  description: string
  orderCode?: string
  status: "completed" | "pending" | "failed"
}

export interface MockChatConversation {
  id: string
  type: "shop" | "support" | "aivy"
  partyName: string
  partyAvatar: string
  lastMessage: string
  lastMessageAt: string
  unread: number
  isOnline: boolean
}

export interface MockChatMessage {
  id: string
  conversationId: string
  fromMe: boolean
  content: string
  timestamp: string
  read: boolean
  attachments?: { type: "image" | "file"; url: string; name?: string }[]
}

// Sprint 1 migration note:
// AddressManagementScreen now reads/writes Firestore through hooks/use-addresses.
// Keep this fixture only for unfinished prototypes/tests until all account screens migrate.
export const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: "addr1",
    label: "home",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "Số 1, Đường Láng",
    ward: "Phường Láng Hạ",
    district: "Đống Đa",
    city: "Hà Nội",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "office",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "Tầng 5, Toà nhà ABC, Nguyễn Huệ",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: false,
  },
]

export const MOCK_VOUCHERS: MockVoucher[] = [
  {
    id: "v1",
    code: "ACFMOI50K",
    title: "Giảm 50K cho đơn từ 500K",
    description: "Áp dụng cho mọi sản phẩm",
    discountType: "fixed",
    discountValue: 50000,
    minOrder: 500000,
    expiresAt: "2026-06-30T23:59:59Z",
    status: "available",
  },
  {
    id: "v2",
    code: "FREESHIP",
    title: "Miễn phí vận chuyển",
    description: "Toàn quốc, đơn từ 200K",
    discountType: "shipping",
    discountValue: 100,
    minOrder: 200000,
    expiresAt: "2026-05-31T23:59:59Z",
    status: "available",
  },
  {
    id: "v3",
    code: "MYPHAM10",
    title: "Giảm 10% mỹ phẩm",
    description: "Tối đa 100K",
    discountType: "percent",
    discountValue: 10,
    maxDiscount: 100000,
    minOrder: 300000,
    expiresAt: "2026-06-15T23:59:59Z",
    status: "available",
    appliesTo: "Danh mục Mỹ phẩm",
  },
  {
    id: "v4",
    code: "WELCOME20",
    title: "Giảm 20% cho đơn đầu",
    description: "Tối đa 50K",
    discountType: "percent",
    discountValue: 20,
    maxDiscount: 50000,
    minOrder: 0,
    expiresAt: "2026-04-30T23:59:59Z",
    status: "used",
    usedAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "v5",
    code: "EXPIRED99K",
    title: "Giảm 99K",
    description: "Áp dụng cho thời trang",
    discountType: "fixed",
    discountValue: 99000,
    minOrder: 500000,
    expiresAt: "2026-04-30T23:59:59Z",
    status: "expired",
  },
]

// Sprint 1 migration note:
// WalletScreen now reads/writes Firestore through hooks/use-wallet.
// Keep these fixtures only for unfinished prototypes/tests until full account migration is complete.
export const MOCK_WALLET_BALANCE = 1_245_000
export const MOCK_WALLET_LOCKED = 150_000

export const MOCK_WALLET_TRANSACTIONS: MockWalletTransaction[] = [
  {
    id: "wt1",
    date: "2026-05-12T10:30:00Z",
    type: "cashback",
    amount: 18000,
    balance: 1_245_000,
    description: "Hoàn tiền 1% đơn ACF24051200001",
    orderCode: "ACF24051200001",
    status: "completed",
  },
  {
    id: "wt2",
    date: "2026-05-10T14:20:00Z",
    type: "payment",
    amount: -450000,
    balance: 1_227_000,
    description: "Thanh toán đơn ACF24051000023",
    orderCode: "ACF24051000023",
    status: "completed",
  },
  {
    id: "wt3",
    date: "2026-05-08T09:00:00Z",
    type: "topup",
    amount: 1_000_000,
    balance: 1_677_000,
    description: "Nạp tiền qua Momo",
    status: "completed",
  },
  {
    id: "wt4",
    date: "2026-05-05T16:30:00Z",
    type: "refund",
    amount: 280000,
    balance: 677_000,
    description: "Hoàn tiền đơn ACF24050200007 (trả hàng)",
    orderCode: "ACF24050200007",
    status: "completed",
  },
  {
    id: "wt5",
    date: "2026-05-02T11:00:00Z",
    type: "payment",
    amount: -180000,
    balance: 397_000,
    description: "Thanh toán đơn ACF24050200007",
    orderCode: "ACF24050200007",
    status: "completed",
  },
]

export const MOCK_CONVERSATIONS: MockChatConversation[] = [
  {
    id: "c1",
    type: "shop",
    partyName: "Natural Beauty Shop",
    partyAvatar: "https://placehold.co/80x80/dc2626/ffffff?text=NB",
    lastMessage: "Cảm ơn bạn, shop đã ghi nhận yêu cầu",
    lastMessageAt: "2026-05-12T15:20:00Z",
    unread: 2,
    isOnline: true,
  },
  {
    id: "c2",
    type: "shop",
    partyName: "TechZone VN",
    partyAvatar: "https://placehold.co/80x80/f59e0b/ffffff?text=TZ",
    lastMessage: "Đơn của bạn đã được đóng gói, sẽ giao trong 2 ngày",
    lastMessageAt: "2026-05-11T18:00:00Z",
    unread: 0,
    isOnline: false,
  },
  {
    id: "c3",
    type: "support",
    partyName: "CSKH chính hãng",
    partyAvatar: "https://placehold.co/80x80/991b1b/ffffff?text=ACF",
    lastMessage: "Xin chào, bộ phận hỗ trợ có thể giúp gì cho bạn?",
    lastMessageAt: "2026-05-10T10:00:00Z",
    unread: 0,
    isOnline: true,
  },
  {
    id: "c4",
    type: "shop",
    partyName: "Sunhouse Official",
    partyAvatar: "https://placehold.co/80x80/0ea5e9/ffffff?text=SH",
    lastMessage: "Cảm ơn bạn đã đánh giá 5 sao!",
    lastMessageAt: "2026-05-05T20:00:00Z",
    unread: 0,
    isOnline: false,
  },
]

export const MOCK_MESSAGES: Record<string, MockChatMessage[]> = {
  c1: [
    {
      id: "m1",
      conversationId: "c1",
      fromMe: true,
      content: "Chào shop, em muốn hỏi về son SPF 15 có bị nhờn không ạ?",
      timestamp: "2026-05-12T14:00:00Z",
      read: true,
    },
    {
      id: "m2",
      conversationId: "c1",
      fromMe: false,
      content: "Dạ chào bạn! Son này không gây nhờn, chất kem mềm, thấm nhanh. Bạn có thể yên tâm sử dụng nhé.",
      timestamp: "2026-05-12T14:05:00Z",
      read: true,
    },
    {
      id: "m3",
      conversationId: "c1",
      fromMe: true,
      content: "Vậy em muốn đổi sang màu đỏ cam được không ạ?",
      timestamp: "2026-05-12T15:00:00Z",
      read: true,
    },
    {
      id: "m4",
      conversationId: "c1",
      fromMe: false,
      content: "Cảm ơn bạn, shop đã ghi nhận yêu cầu. Bạn vui lòng gửi mã đơn hàng để shop hỗ trợ đổi nhé.",
      timestamp: "2026-05-12T15:20:00Z",
      read: false,
    },
  ],
}
