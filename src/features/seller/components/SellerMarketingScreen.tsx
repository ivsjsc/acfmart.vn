import { Megaphone } from "lucide-react"
import { SellerSimpleScreen } from "./SellerSimpleScreen"

export default function SellerMarketingScreen() {
  return (
    <SellerSimpleScreen
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
