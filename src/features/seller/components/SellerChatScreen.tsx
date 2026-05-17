import { MessageSquare } from "lucide-react"
import { SellerSimpleScreen } from "./SellerSimpleScreen"

export default function SellerChatScreen() {
  return (
    <SellerSimpleScreen
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
