/**
 * Help-center taxonomy for ACFMart.
 *
 * Structure mirrors Shopee Vietnam's Trung tâm trợ giúp (6 sections + nested
 * sub-topics + FAQ), adapted for ACFMart's anti-counterfeit marketplace.
 * Content is original; only the navigation pattern is borrowed.
 */

export type HelpAudience = "buyer" | "seller" | "both"

export interface HelpTopic {
  /** url-friendly id used for deep-linking in the page (e.g. ?topic=...). */
  id: string
  title: string
  summary?: string
}

export interface HelpSection {
  id: string
  title: string
  description: string
  audience: HelpAudience
  topics: HelpTopic[]
}

export interface HelpFAQ {
  id: string
  audience: HelpAudience
  question: string
  answer: string
}

// ─── Sections ─────────────────────────────────────────────────────────────

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "shopping",
    title: "Mua sắm cùng ACFMart",
    description: "Hướng dẫn cho người dùng mới và mẹo tìm sản phẩm chính hãng.",
    audience: "buyer",
    topics: [
      { id: "newbie", title: "Người dùng mới", summary: "ACFMart là gì, cách tạo tài khoản, xác minh số điện thoại." },
      { id: "search", title: "Tìm kiếm & danh mục", summary: "Lọc theo thương hiệu, danh mục, dải giá." },
      { id: "qr-verify", title: "Xác thực hàng chính hãng QR", summary: "Cách quét QR và đọc kết quả chống hàng giả." },
      { id: "live", title: "Livestream & video", summary: "Mua hàng từ phiên live, lưu sản phẩm, đặt nhắc nhở." },
      { id: "shop-detail", title: "Trang shop & follow", summary: "Theo dõi shop yêu thích, nhận thông báo." },
      { id: "popular", title: "Phổ biến", summary: "Các câu hỏi thường gặp khi mua sắm." },
    ],
  },
  {
    id: "promotions",
    title: "Khuyến mãi & Ưu đãi",
    description: "Voucher, ACF Coin, chương trình thành viên và Affiliate.",
    audience: "buyer",
    topics: [
      { id: "voucher", title: "Mã giảm giá & voucher", summary: "Cách thu thập, dùng và phối hợp voucher." },
      { id: "flash-sale", title: "Flash sale & săn deal", summary: "Lịch flash sale, đặt lịch nhắc." },
      { id: "loyalty", title: "Chương trình thành viên", summary: "Cấp bậc, điểm tích lũy, đặc quyền." },
      { id: "affiliate", title: "Affiliate ACFMart", summary: "Cách đăng ký, chia sẻ link, theo dõi hoa hồng." },
    ],
  },
  {
    id: "payments",
    title: "Thanh toán",
    description: "Ví, VNPay, Momo, ZaloPay, thẻ và hoá đơn VAT.",
    audience: "both",
    topics: [
      { id: "wallet", title: "Ví ACFMart", summary: "Kích hoạt, nạp tiền, rút tiền, liên kết ngân hàng." },
      { id: "vnpay-momo-zalopay", title: "VNPay, Momo, ZaloPay", summary: "Cách chọn cổng và xử lý lỗi thanh toán." },
      { id: "cod", title: "Thanh toán khi nhận hàng (COD)", summary: "Điều kiện áp dụng và phí." },
      { id: "vat", title: "Hoá đơn VAT", summary: "Yêu cầu xuất hoá đơn cho đơn hàng." },
    ],
  },
  {
    id: "orders-shipping",
    title: "Đơn hàng & Vận chuyển",
    description: "Đặt hàng, theo dõi và quản lý đơn mua / đơn bán.",
    audience: "both",
    topics: [
      { id: "place-order", title: "Đặt hàng & huỷ đơn", summary: "Quy trình đặt, sửa địa chỉ, huỷ đơn." },
      { id: "track", title: "Theo dõi vận chuyển", summary: "Tra cứu bằng mã đơn / mã vận đơn." },
      { id: "shipping-fee", title: "Phí & thời gian vận chuyển", summary: "Cách tính phí GHN, GHTK, Viettel Post." },
      { id: "review", title: "Đánh giá & bình luận", summary: "Quy trình đánh giá công khai / riêng tư." },
    ],
  },
  {
    id: "returns-refunds",
    title: "Trả hàng & Hoàn tiền",
    description: "Yêu cầu trả, theo dõi, hoàn tiền cho hàng giả / hàng lỗi.",
    audience: "both",
    topics: [
      { id: "return-rules", title: "Quy định chung", summary: "Điều kiện, thời hạn, sản phẩm được phép trả." },
      { id: "request-return", title: "Gửi yêu cầu trả hàng", summary: "Các bước thực hiện, ảnh chứng cứ." },
      { id: "refund", title: "Hoàn tiền", summary: "Thời gian, phương thức nhận hoàn." },
      { id: "counterfeit", title: "Báo cáo hàng giả", summary: "Quy trình ACF can thiệp khi nghi hàng giả." },
    ],
  },
  {
    id: "general",
    title: "Thông tin chung",
    description: "Chính sách, tài khoản, mua sắm an toàn, ứng dụng.",
    audience: "both",
    topics: [
      { id: "policy", title: "Chính sách ACFMart", summary: "Điều khoản dịch vụ, chính sách bảo mật." },
      { id: "account", title: "Tài khoản & bảo mật", summary: "Đổi mật khẩu, xác minh 2 bước." },
      { id: "safe", title: "Mua sắm an toàn", summary: "Cảnh báo lừa đảo, mẹo nhận biết." },
      { id: "app", title: "Ứng dụng ACFMart", summary: "Cài đặt, cập nhật, thông báo đẩy." },
    ],
  },
  // ─── Seller-only section ───────────────────────────────────────────────
  {
    id: "seller",
    title: "Dành cho Người bán",
    description: "Đăng ký, quản lý kho, đơn bán, khuyến mãi và tài chính.",
    audience: "seller",
    topics: [
      { id: "register-seller", title: "Đăng ký người bán", summary: "Hồ sơ KYC, giấy phép, thời gian duyệt." },
      { id: "inventory", title: "Quản lý kho & duyệt sản phẩm", summary: "Trạng thái nháp / chờ duyệt / đã duyệt." },
      { id: "showcase", title: "Trang trưng bày & trang trí", summary: "Banner, sản phẩm ghim, module hiển thị." },
      { id: "outgoing-orders", title: "Đơn vận chuyển đi", summary: "Đóng gói, mã vận đơn, đối soát ship." },
      { id: "promotions-seller", title: "Khuyến mãi của shop", summary: "Voucher, flash sale, combo." },
      { id: "finance-seller", title: "Tài chính & rút tiền", summary: "Đối soát doanh thu, phí sàn, lịch rút." },
      { id: "complaints", title: "Khiếu nại & tranh chấp", summary: "Quy trình tranh chấp đơn hoàn trả." },
    ],
  },
]

// ─── Popular FAQs ────────────────────────────────────────────────────────

export const HELP_FAQS: HelpFAQ[] = [
  {
    id: "faq-place-order",
    audience: "buyer",
    question: "Làm thế nào để đặt hàng trên ACFMart?",
    answer:
      "Thêm sản phẩm vào giỏ, chọn địa chỉ giao hàng, chọn phương thức thanh toán (VNPay/Momo/ZaloPay/COD) và bấm Đặt hàng. Bạn sẽ nhận mã đơn và email xác nhận.",
  },
  {
    id: "faq-cancel",
    audience: "buyer",
    question: "Tôi có thể huỷ đơn hàng sau khi đặt không?",
    answer:
      "Có, trong vòng 1 giờ kể từ khi đặt và trước khi shop xác nhận. Vào Đơn hàng của tôi → chọn đơn → Huỷ đơn.",
  },
  {
    id: "faq-tracking",
    audience: "both",
    question: "Tôi tra cứu mã vận đơn ở đâu?",
    answer:
      "Khách mua: Tài khoản → Theo dõi đơn. Người bán: Kênh người bán → Tra cứu đơn hàng (Đơn bán). Có thể tra theo mã đơn hoặc mã vận đơn của GHN/GHTK/Viettel Post.",
  },
  {
    id: "faq-counterfeit",
    audience: "buyer",
    question: "Tôi nghi sản phẩm là hàng giả, tôi báo cáo thế nào?",
    answer:
      "Quét QR trên sản phẩm tại trang Xác thực QR. Nếu kết quả là hàng giả hoặc không xác định, bấm Báo cáo để gửi tới Quỹ Chống Hàng Giả VN.",
  },
  {
    id: "faq-review-privacy",
    audience: "buyer",
    question: "Đánh giá của tôi có hiển thị công khai không?",
    answer:
      "Khi gửi đánh giá, bạn chọn chế độ Công khai hoặc Riêng tư. Đánh giá riêng tư chỉ shop và bạn thấy, đánh giá công khai hiển thị trên trang sản phẩm.",
  },
  {
    id: "faq-payment-online",
    audience: "buyer",
    question: "Đơn thanh toán online bị treo, làm sao?",
    answer:
      "Hệ thống đợi webhook xác nhận từ cổng thanh toán. Nếu sau 30 phút vẫn ở 'Chờ thanh toán', hãy liên hệ CSKH với mã đơn để được kiểm tra.",
  },
  {
    id: "faq-seller-register",
    audience: "seller",
    question: "Tôi cần giấy tờ gì để đăng ký người bán?",
    answer:
      "CMND/CCCD, giấy phép kinh doanh (nếu có), thông tin thuế và tài khoản ngân hàng để nhận tiền. Hồ sơ duyệt trong 1–3 ngày làm việc.",
  },
  {
    id: "faq-seller-inventory",
    audience: "seller",
    question: "Tại sao sản phẩm tôi đăng vẫn chưa hiển thị trên trang trưng bày?",
    answer:
      "Sản phẩm chỉ hiển thị khi đã được kiểm duyệt (status = approved). Kiểm tra tab Kho — nếu đang 'Chờ duyệt', đợi admin hoặc bổ sung thông tin nếu bị yêu cầu.",
  },
  {
    id: "faq-seller-payout",
    audience: "seller",
    question: "Khi nào tôi nhận được tiền sau khi giao hàng thành công?",
    answer:
      "Tiền được mở khoá sau khi khách xác nhận đã nhận hoặc tự động sau 7 ngày kể từ ngày giao thành công. Bạn có thể rút từ Ví → Yêu cầu rút.",
  },
]
