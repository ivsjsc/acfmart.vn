import { useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { formatCurrency } from "../../../lib/format"
import { useRevenueBreakdown } from "../../../hooks/use-seller-finance"
import { SellerSimpleScreen } from "./SellerSimpleScreen"

export default function SellerAnalyticsScreen() {
  const range = useMemo(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 30)
    return { from, to }
  }, [])
  const { data, isLoading } = useRevenueBreakdown(range)

  const highlightValue = isLoading
    ? "Đang tính..."
    : formatCurrency(data?.totalRevenue ?? 0)

  return (
    <SellerSimpleScreen
      icon={TrendingUp}
      title="Phân tích chi tiết"
      description="Hiểu rõ khách hàng, sản phẩm nào bán chạy, đâu là cơ hội tăng trưởng"
      highlight={{
        label: "Doanh thu 30 ngày",
        value: highlightValue,
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
