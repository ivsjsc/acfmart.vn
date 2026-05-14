import { Link } from "react-router-dom"
import {
  MessageSquare,
  Megaphone,
  TrendingUp,
  Wallet,
  Settings,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { formatCurrency } from "../../../lib/format"
import { MOCK_SELLER_STATS } from "../mock-data"

interface SimpleScreenProps {
  icon: typeof MessageSquare
  title: string
  description: string
  highlight?: { label: string; value: string }
  cta?: string
  comingSoon?: string[]
}

function SimpleScreen({ icon: Icon, title, description, highlight, cta, comingSoon }: SimpleScreenProps) {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900 lg:text-3xl">{title}</h1>
      <p className="mb-6 text-sm text-neutral-600">{description}</p>

      {highlight && (
        <div className="card overflow-hidden mb-5">
          <div className="bg-gradient-to-br from-brand-red-500 to-brand-red-700 p-6 text-white">
            <div className="text-xs uppercase tracking-wider text-white/80">
              {highlight.label}
            </div>
            <div className="mt-2 text-4xl font-extrabold">{highlight.value}</div>
            {cta && (
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand-red-600 hover:scale-105">
                {cta} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {comingSoon && (
        <div className="card p-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900">
            <Sparkles size={16} className="text-brand-gold-500" />
            Tính năng đang phát triển
          </h2>
          <ul className="space-y-2">
            {comingSoon.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-sm text-neutral-700">
                <Icon size={14} className="mt-0.5 shrink-0 text-brand-red-500" />
                {feat}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/aivy"
        className="mt-5 card flex items-center justify-between p-4 hover:bg-neutral-50"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="text-brand-gold-500" />
          <div>
            <div className="font-semibold text-neutral-900">
              Aivy có thể hỗ trợ
            </div>
            <div className="text-xs text-neutral-500">
              Hỏi Aivy về tính năng này
            </div>
          </div>
        </div>
        <ArrowRight size={16} className="text-neutral-400" />
      </Link>
    </div>
  )
}

export function SellerChatScreen() {
  return (
    <SimpleScreen
      icon={MessageSquare}
      title="Tin nhắn khách hàng"
      description="Trả lời câu hỏi của khách, đính kèm sản phẩm, thiết lập câu trả lời tự động"
      highlight={{ label: "Tin nhắn chưa đọc", value: "5" }}
      cta="Mở hộp thư"
      comingSoon={[
        "Thread chat theo từng khách hàng",
        "Template trả lời nhanh (FAQ)",
        "Đính kèm sản phẩm/voucher trong chat",
        "Tự động trả lời ngoài giờ với Aivy",
        "Đánh giá chất lượng phản hồi của shop",
      ]}
    />
  )
}

export function SellerMarketingScreen() {
  return (
    <SimpleScreen
      icon={Megaphone}
      title="Khuyến mãi & Marketing"
      description="Tạo voucher, flash sale, livestream để tăng đơn hàng"
      comingSoon={[
        "Tạo voucher giảm giá theo shop (% hoặc cố định)",
        "Flash sale theo khung giờ với deal độc quyền",
        "Quảng cáo từ khoá - hiển thị trên search results",
        "Tham gia chương trình khuyến mãi chính hãng",
        "Lập lịch livestream Live Commerce",
      ]}
    />
  )
}

export function SellerAnalyticsScreen() {
  const stats = MOCK_SELLER_STATS
  return (
    <SimpleScreen
      icon={TrendingUp}
      title="Phân tích chi tiết"
      description="Hiểu rõ khách hàng, sản phẩm nào bán chạy, đâu là cơ hội tăng trưởng"
      highlight={{
        label: "Doanh thu 30 ngày",
        value: formatCurrency(stats.revenue.last30Days),
      }}
      cta="Xem báo cáo đầy đủ"
      comingSoon={[
        "Heatmap traffic theo giờ/ngày",
        "Top sản phẩm bán chạy, sản phẩm view nhiều nhưng không mua",
        "Phân tích khách hàng: tỉnh thành, độ tuổi, repeat buyer",
        "So sánh với shops cùng ngành hàng",
        "Dự báo doanh thu AI bởi Aivy",
      ]}
    />
  )
}

export function SellerFinanceScreen() {
  const stats = MOCK_SELLER_STATS
  return (
    <SimpleScreen
      icon={Wallet}
      title="Tài chính"
      description="Theo dõi doanh thu, lịch chi trả, xuất hoá đơn cho cơ quan thuế"
      highlight={{
        label: "Sắp được chi trả",
        value: formatCurrency(stats.revenue.pendingPayout),
      }}
      cta="Yêu cầu rút sớm"
      comingSoon={[
        "Lịch sử chi trả chi tiết theo từng kỳ",
        "Báo cáo doanh thu theo sản phẩm, danh mục",
        "Xuất hoá đơn VAT cho khách hàng B2B",
        "Theo dõi phí dịch vụ nền tảng",
        "Hoá đơn điện tử cho cơ quan thuế",
      ]}
    />
  )
}

export function SellerSettingsScreen() {
  return (
    <SimpleScreen
      icon={Settings}
      title="Cài đặt shop"
      description="Tài khoản đăng nhập, bảo mật, thông báo, quyền nhân viên"
      comingSoon={[
        "Quản lý nhân viên & phân quyền (admin, staff, marketing)",
        "Bật xác thực 2 lớp cho tài khoản shop",
        "Cấu hình thông báo email/Zalo/SMS",
        "Quản lý API key để tích hợp ERP",
        "Lịch sử hoạt động (audit log)",
      ]}
    />
  )
}
