import { TrendingUp } from "lucide-react"
import { formatCurrency } from "../../../lib/format"
import { MOCK_SELLER_STATS } from "../mock-data"
import { SellerSimpleScreen } from "./SellerSimpleScreen"

export default function SellerAnalyticsScreen() {
  const stats = MOCK_SELLER_STATS

  return (
    <SellerSimpleScreen
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
