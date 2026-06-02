/**
 * Help-center taxonomy for ACFMart.
 *
 * Structure mirrors Shopee Vietnam's Trung tâm trợ giúp (6 sections + nested
 * sub-topics + FAQ), adapted for ACFMart's anti-counterfeit marketplace.
 * Content is original; only the navigation pattern is borrowed.
 *
 * Mỗi topic có `answer` đầy đủ — dùng trực tiếp trong trang Trợ giúp và làm
 * nguồn trả lời cho Aivy qua nút "Hỏi Aivy về mục này" (xem
 * features/aivy/help-answer-service.ts).
 */

export type HelpAudience = "buyer" | "seller" | "both"

export interface HelpTopic {
  /** url-friendly id used for deep-linking in the page (e.g. ?topic=...). */
  id: string
  title: string
  /** Tóm tắt ngắn hiển thị dưới tiêu đề topic trong thẻ section. */
  summary?: string
  /** Câu trả lời đầy đủ, hỗ trợ xuống dòng (`\n`) và gạch đầu dòng. */
  answer: string
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
      {
        id: "newbie",
        title: "Người dùng mới",
        summary: "ACFMart là gì, cách tạo tài khoản, xác minh số điện thoại.",
        answer:
          "ACFMart là sàn thương mại điện tử chống hàng giả: mỗi sản phẩm chính hãng đều có mã QR xác thực và shop được chứng nhận.\n\nĐể bắt đầu:\n1. Tạo tài khoản bằng email, số điện thoại hoặc Google/Facebook/Zalo.\n2. Xác minh số điện thoại qua mã OTP để bảo vệ tài khoản và nhận thông báo đơn hàng.\n3. Hoàn tất Sổ địa chỉ trong Tài khoản (/account/addresses) trước khi đặt đơn đầu tiên.\n4. Tìm sản phẩm, kiểm tra huy hiệu \"Đã xác thực\" rồi đặt hàng.\n\nCần hỗ trợ nhanh, bạn hỏi Aivy hoặc gọi 1900 066 689.",
      },
      {
        id: "search",
        title: "Tìm kiếm & danh mục",
        summary: "Lọc theo thương hiệu, danh mục, dải giá.",
        answer:
          "Bạn tìm sản phẩm theo nhiều cách:\n• Ô tìm kiếm trên đầu trang: nhập tên sản phẩm, thương hiệu hoặc tên shop.\n• Trang Danh mục (/categories): duyệt theo ngành hàng.\n• Bộ lọc trong trang kết quả (/search): lọc theo thương hiệu, dải giá, đánh giá, shop được chứng nhận và sắp xếp theo bán chạy/mới/giá.\n\nMẹo: ưu tiên sản phẩm có huy hiệu \"Đã xác thực\" và shop có chứng nhận để đảm bảo hàng chính hãng.",
      },
      {
        id: "qr-verify",
        title: "Xác thực hàng chính hãng QR",
        summary: "Cách quét QR và đọc kết quả chống hàng giả.",
        answer:
          "Mỗi sản phẩm chính hãng trên ACFMart có mã QR/tem chống giả do hệ thống ACF cấp.\n\nCách xác thực:\n1. Mở trang Xác thực QR (/qr-verify).\n2. Quét mã QR trên tem/bao bì gốc, hoặc nhập mã serial thủ công.\n3. Đọc kết quả: Chính hãng (hợp lệ), Đã quét nhiều lần (cảnh báo) hoặc Không hợp lệ/Không tìm thấy.\n\nNếu kết quả nghi vấn, chụp tem, bao bì và hóa đơn rồi gửi báo cáo tại /report-counterfeit để Quỹ Chống Hàng Giả VN xử lý.",
      },
      {
        id: "live",
        title: "Livestream & video",
        summary: "Mua hàng từ phiên live, lưu sản phẩm, đặt nhắc nhở.",
        answer:
          "ACFMart có Livestream Commerce để mua hàng trực tiếp trong phiên phát.\n\nTrong phiên live (/live) bạn có thể:\n• Xem shop giới thiệu sản phẩm theo thời gian thực và đặt câu hỏi qua khung chat.\n• Thêm nhanh sản phẩm đang ghim vào giỏ và áp mã giảm giá riêng của phiên.\n• Lưu sản phẩm hoặc đặt nhắc nhở để không bỏ lỡ phiên sắp tới.\n\nSản phẩm bán trong live vẫn áp dụng đầy đủ chính sách xác thực QR và đổi trả của sàn.",
      },
      {
        id: "shop-detail",
        title: "Trang shop & follow",
        summary: "Theo dõi shop yêu thích, nhận thông báo.",
        answer:
          "Mỗi shop có trang riêng (/shops/:id) hiển thị hồ sơ, chứng nhận, danh sách sản phẩm, đánh giá và voucher của shop.\n\nBạn có thể:\n• Nhấn Theo dõi để nhận thông báo khi shop có sản phẩm mới, khuyến mãi hoặc lên live.\n• Chat trực tiếp với shop qua /account/chat để hỏi về sản phẩm hoặc đơn hàng.\n• Xem huy hiệu chứng nhận để biết shop đã được ACFMart xác minh.",
      },
      {
        id: "popular",
        title: "Phổ biến",
        summary: "Các câu hỏi thường gặp khi mua sắm.",
        answer:
          "Đây là các thắc mắc thường gặp nhất khi mua sắm: cách đặt hàng, huỷ đơn, theo dõi vận chuyển, đổi trả và xác thực hàng chính hãng.\n\nBạn cuộn xuống mục \"Câu hỏi thường gặp\" bên dưới để xem chi tiết, dùng ô tìm kiếm ở đầu trang, hoặc hỏi Aivy để được trả lời ngay.",
      },
    ],
  },
  {
    id: "promotions",
    title: "Khuyến mãi & Ưu đãi",
    description: "Voucher, ACF Coin, chương trình thành viên và Affiliate.",
    audience: "buyer",
    topics: [
      {
        id: "voucher",
        title: "Mã giảm giá & voucher",
        summary: "Cách thu thập, dùng và phối hợp voucher.",
        answer:
          "Voucher gồm 2 loại chính: voucher của sàn ACFMart và voucher riêng của từng shop.\n\nCách dùng:\n1. Thu thập voucher tại trang sản phẩm, trang shop, trang khuyến mãi hoặc trong phiên live.\n2. Voucher đã lưu nằm trong Tài khoản → Voucher (/account/vouchers).\n3. Ở bước thanh toán, chọn \"Áp dụng voucher\" — hệ thống tự gợi ý mã hợp lệ.\n\nLưu ý: mỗi voucher có điều kiện đơn tối thiểu, hạn dùng và phạm vi áp dụng; voucher sàn và voucher shop thường có thể cộng dồn.",
      },
      {
        id: "flash-sale",
        title: "Flash sale & săn deal",
        summary: "Lịch flash sale, đặt lịch nhắc.",
        answer:
          "Flash sale là khung giờ giảm giá sâu, số lượng giới hạn theo từng phiên.\n\nĐể săn deal hiệu quả:\n• Theo dõi lịch flash sale trên trang chủ và trang khuyến mãi.\n• Đặt nhắc nhở hoặc thêm sản phẩm vào Yêu thích trước giờ mở bán.\n• Hoàn tất Sổ địa chỉ và chuẩn bị voucher trước để thanh toán nhanh.\n\nGiá flash sale chỉ áp dụng trong thời gian phiên và khi còn suất; hết suất giá trở về bình thường.",
      },
      {
        id: "loyalty",
        title: "Chương trình thành viên",
        summary: "Cấp bậc, điểm tích lũy, đặc quyền.",
        answer:
          "Chương trình thành viên tích điểm thưởng (ACF Coin) cho các hoạt động như mua hàng và đánh giá.\n\n• Xem cấp bậc, số điểm và đặc quyền tại Tài khoản → Điểm thưởng (/account/loyalty).\n• Điểm có thể dùng để đổi voucher hoặc ưu đãi theo từng chương trình.\n• Cấp bậc càng cao, ưu đãi và quyền lợi càng nhiều.\n\nĐiểm và hạn sử dụng tuân theo thể lệ của từng chương trình đang chạy.",
      },
      {
        id: "affiliate",
        title: "Affiliate ACFMart",
        summary: "Cách đăng ký, chia sẻ link, theo dõi hoa hồng.",
        answer:
          "Affiliate cho phép bạn chia sẻ link sản phẩm và nhận hoa hồng khi có người mua qua link.\n\n• Đăng ký dùng ngay, không cần kiểm duyệt — vào /affiliate để bắt đầu.\n• Mỗi affiliate có trang công khai riêng (/affiliate/:slug) và link theo dõi click tự động.\n• Hoa hồng theo từng shop (tối đa 50%), tích luỹ lên hạng: Đồng → Bạc → Vàng → Bạch kim → Kim cương.\n\nBạn tự quản lý sản phẩm giới thiệu, thứ tự hiển thị và theo dõi hoa hồng trong bảng điều khiển Affiliate.",
      },
    ],
  },
  {
    id: "payments",
    title: "Thanh toán",
    description: "Ví, VNPay, Momo, ZaloPay, COD, giải ngân và hoá đơn VAT.",
    audience: "both",
    topics: [
      {
        id: "wallet",
        title: "Ví ACFMart",
        summary: "Kích hoạt, nạp tiền, rút tiền, liên kết ngân hàng.",
        answer:
          "Ví ACFMart giúp thanh toán nhanh và nhận hoàn tiền.\n\n• Kích hoạt và quản lý tại Tài khoản → Ví (/account/wallet).\n• Bạn có thể nạp tiền, liên kết ngân hàng và rút tiền về tài khoản đã liên kết.\n• Tiền hoàn từ đơn huỷ/đổi trả thường được trả về Ví để dùng cho lần sau.\n\nVì an toàn, không chia sẻ OTP/mật khẩu cho bất kỳ ai. Aivy không đọc số dư ví trong chat — bạn xem trực tiếp trong trang Ví.",
      },
      {
        id: "vnpay-momo-zalopay",
        title: "VNPay, Momo, ZaloPay",
        summary: "Cách chọn cổng và xử lý lỗi thanh toán.",
        answer:
          "Ở bước thanh toán, bạn chọn cổng phù hợp: VNPay, MoMo, ZaloPay, thẻ quốc tế (VISA) hoặc COD.\n\nNếu thanh toán lỗi hoặc đơn treo:\n1. Đừng thanh toán lại ngay — hệ thống đợi cổng xác nhận (webhook).\n2. Kiểm tra trạng thái đơn trong /account/orders sau vài phút.\n3. Nếu sau 30 phút vẫn \"Chờ thanh toán\", liên hệ CSKH kèm mã đơn để được đối soát.\n\nTiền chỉ được ghi nhận khi cổng xác nhận thành công; nếu bị trừ nhưng đơn chưa cập nhật, CSKH sẽ kiểm tra và xử lý.",
      },
      {
        id: "escrow-release",
        title: "Giải ngân & giữ tiền",
        summary: "Khi nào đơn được mở khóa, khi nào bị freeze.",
        answer:
          "ACFMart giữ tiền (escrow) để bảo vệ cả người mua và người bán.\n\n• Tiền thanh toán được giữ cho tới khi đơn giao thành công và qua cửa sổ khiếu nại/đổi trả.\n• Khi đơn hoàn tất, tiền chuyển sang số dư khả dụng của shop để rút theo chu kỳ.\n• Đơn đang khiếu nại, đổi trả hoặc nghi vấn hàng giả sẽ bị tạm giữ (freeze) tới khi có kết luận.\n\nCơ chế này đảm bảo người mua nhận đúng hàng trước khi người bán được giải ngân.",
      },
      {
        id: "cod",
        title: "Thanh toán khi nhận hàng (COD)",
        summary: "Điều kiện áp dụng, phí và đối soát thu hộ.",
        answer:
          "COD cho phép trả tiền mặt cho đơn vị vận chuyển khi nhận hàng (tuỳ đơn/shop hỗ trợ).\n\n• Khi đặt, chọn phương thức COD ở bước thanh toán nếu có.\n• Bạn nên kiểm tra tình trạng kiện hàng trước khi thanh toán cho shipper.\n• ACFMart ghi nhận trạng thái giao; phần tiền COD được đối soát qua tài khoản thu hộ theo ledger nội bộ.\n\nMột số khu vực hoặc đơn giá trị cao có thể yêu cầu thanh toán trước thay vì COD.",
      },
      {
        id: "vat",
        title: "Hoá đơn VAT",
        summary: "Yêu cầu xuất hoá đơn cho đơn hàng.",
        answer:
          "Bạn có thể yêu cầu xuất hoá đơn VAT cho đơn hàng cần chứng từ.\n\n• Nêu yêu cầu xuất hoá đơn và cung cấp thông tin (tên đơn vị, mã số thuế, địa chỉ) khi đặt hàng hoặc liên hệ shop/CSKH với mã đơn.\n• Hoá đơn được phát hành theo quy định hiện hành.\n• Hãy gửi yêu cầu sớm, tốt nhất trước khi đơn hoàn tất, để tránh phát sinh.\n\nNếu cần hỗ trợ, liên hệ CSKH (/contact) kèm mã đơn và thông tin xuất hoá đơn.",
      },
    ],
  },
  {
    id: "orders-shipping",
    title: "Đơn hàng & Vận chuyển",
    description: "Đặt hàng, theo dõi, RTO và quản lý trạng thái vận đơn.",
    audience: "both",
    topics: [
      {
        id: "place-order",
        title: "Đặt hàng & huỷ đơn",
        summary: "Quy trình đặt, sửa địa chỉ, huỷ đơn.",
        answer:
          "Đặt hàng:\n1. Thêm sản phẩm vào giỏ và mở Giỏ hàng (/cart).\n2. Chọn địa chỉ giao hàng (cần hoàn tất Sổ địa chỉ trước).\n3. Chọn vận chuyển và phương thức thanh toán, áp voucher nếu có.\n4. Bấm Đặt hàng — bạn nhận mã đơn và email/thông báo xác nhận.\n\nHuỷ đơn: vào /account/orders → chọn đơn → Huỷ đơn. Chỉ huỷ được trong khoảng 1 giờ sau khi đặt và trước khi shop xác nhận; sau đó cần liên hệ shop hoặc dùng quy trình đổi trả.",
      },
      {
        id: "track",
        title: "Theo dõi vận chuyển",
        summary: "Tra cứu bằng mã đơn / mã vận đơn.",
        answer:
          "Theo dõi đơn:\n• Khách mua: Tài khoản → Theo dõi đơn (/account/track) hoặc mở chi tiết đơn trong /account/orders.\n• Người bán: Kênh người bán → Tra cứu đơn (/seller/orders/track).\n\nBạn tra theo mã đơn ACFMart hoặc mã vận đơn của đơn vị vận chuyển (GHN/GHTK/J&T). Mã vận đơn xuất hiện sau khi shop đóng gói và bàn giao cho đơn vị vận chuyển.",
      },
      {
        id: "shipping-fee",
        title: "Phí & thời gian vận chuyển",
        summary: "Cách tính phí carrier và ETA hiển thị.",
        answer:
          "• Phí vận chuyển tính theo đơn vị vận chuyển (GHN/GHTK/J&T), dựa trên khối lượng/kích thước và khoảng cách giữa kho shop và địa chỉ nhận.\n• Phí và thời gian dự kiến (ETA) hiển thị ở bước thanh toán trước khi bạn đặt đơn.\n• Thời gian giao thông thường 2–4 ngày toàn quốc, có thể lâu hơn ở vùng xa hoặc dịp cao điểm.\n\nMột số shop có chương trình miễn phí/giảm phí vận chuyển hoặc voucher freeship.",
      },
      {
        id: "review",
        title: "Đánh giá & bình luận",
        summary: "Quy trình đánh giá công khai / riêng tư.",
        answer:
          "Sau khi đơn hoàn tất, bạn có thể đánh giá sản phẩm và shop.\n\n• Vào /account/orders → chọn đơn đã giao → Đánh giá (/account/orders/:id/review).\n• Chấm sao, viết nhận xét và đính kèm ảnh/video thực tế.\n• Chọn chế độ Công khai (hiển thị trên trang sản phẩm) hoặc Riêng tư (chỉ bạn và shop thấy).\n\nĐánh giá trung thực giúp người mua khác và góp phần phát hiện hàng không đạt chất lượng.",
      },
    ],
  },
  {
    id: "returns-refunds",
    title: "Trả hàng & Hoàn tiền",
    description: "7 ngày, 15 ngày, hoàn tiền, claim carrier và bồi thường hàng giả.",
    audience: "both",
    topics: [
      {
        id: "return-rules",
        title: "Quy định chung",
        summary: "Điều kiện, thời hạn, sản phẩm được phép trả.",
        answer:
          "Khung đổi trả chuẩn của ACFMart:\n• 7 ngày cho trường hợp đổi ý (sản phẩm còn nguyên tem, chưa qua sử dụng, đủ phụ kiện).\n• 15 ngày cho hàng lỗi, sai mô tả hoặc giao nhầm.\n• Hàng giả/sai nguồn gốc được xử lý theo chương trình chống hàng giả ACF sau khi xác minh.\n\nMột số mặt hàng đặc thù (hàng dễ hỏng, đồ lót, sản phẩm số…) có thể không áp dụng đổi trả. Chi tiết tại Chính sách đổi trả (/legal/return).",
      },
      {
        id: "request-return",
        title: "Gửi yêu cầu trả hàng",
        summary: "Các bước thực hiện, ảnh chứng cứ.",
        answer:
          "Các bước gửi yêu cầu trả hàng:\n1. Vào /account/orders → chọn đơn cần trả.\n2. Bấm Yêu cầu trả hàng/hoàn tiền (/account/orders/:orderId/return).\n3. Chọn lý do và tải ảnh/video bằng chứng (sản phẩm, tem, bao bì, hoá đơn).\n4. Gửi yêu cầu và theo dõi trạng thái xử lý ngay trong đơn.\n\nGiữ lại hàng và bao bì cho tới khi có hướng dẫn; cung cấp bằng chứng rõ ràng giúp xử lý nhanh hơn.",
      },
      {
        id: "refund",
        title: "Hoàn tiền",
        summary: "Thời gian, phương thức nhận hoàn.",
        answer:
          "Sau khi yêu cầu trả hàng được duyệt (hoặc đơn huỷ hợp lệ):\n• Tiền thường hoàn về Ví ACFMart hoặc về phương thức thanh toán ban đầu, tuỳ trường hợp.\n• Thời gian nhận tuỳ kênh: Ví gần như tức thì; thẻ/cổng thanh toán có thể mất vài ngày làm việc theo ngân hàng.\n• Với đơn escrow, tiền chỉ giải toả sau khi xác nhận trả hàng/kết luận xử lý.\n\nBạn theo dõi tiến trình hoàn tiền trong chi tiết đơn; nếu quá hạn dự kiến, liên hệ CSKH kèm mã đơn.",
      },
      {
        id: "counterfeit",
        title: "Báo cáo hàng giả",
        summary: "Quy trình ACF can thiệp khi nghi hàng giả.",
        answer:
          "Khi nghi sản phẩm là hàng giả:\n1. Quét QR tại /qr-verify để kiểm tra tính chính hãng.\n2. Nếu kết quả không hợp lệ/nghi vấn, mở /report-counterfeit.\n3. Nhập QR/serial, tên sản phẩm, lý do nghi vấn và tải ảnh tem, bao bì, hoá đơn.\n4. Gửi báo cáo — Quỹ Chống Hàng Giả VN và ACFMart sẽ vào cuộc xác minh.\n\nTrường hợp xác định là hàng giả được xử lý theo chương trình bảo vệ người mua; bạn cũng có thể liên hệ CSKH để được hỗ trợ song song.",
      },
    ],
  },
  {
    id: "general",
    title: "Thông tin chung",
    description: "Chính sách, sổ địa chỉ, tài khoản và mua sắm an toàn.",
    audience: "both",
    topics: [
      {
        id: "policy-center",
        title: "Trung tâm chính sách",
        summary: "Tổng quan giải ngân, COD, đổi trả, vận chuyển.",
        answer:
          "Trung tâm chính sách (/legal) tập hợp toàn bộ quy định của sàn:\n• Đổi trả (/legal/return), Vận chuyển (/legal/shipping), Thanh toán (/legal/payment).\n• Bảo vệ dữ liệu cá nhân (/legal/data-protection) và Điều khoản sử dụng (/legal/terms).\n• Điều khoản và biểu phí dành cho người bán (/legal/seller-terms, /legal/seller-fees).\n\nĐây là nguồn chính thức để hiểu rõ cơ chế giữ tiền (escrow), COD và quyền lợi đổi trả.",
      },
      {
        id: "address-book",
        title: "Sổ địa chỉ & đặt hàng",
        summary: "Địa chỉ bắt buộc trước khi đặt đơn.",
        answer:
          "ACFMart chỉ cho đặt đơn khi địa chỉ giao hàng đã đầy đủ: họ tên, số điện thoại, địa chỉ chi tiết, phường/xã, quận/huyện và tỉnh/thành.\n\n• Quản lý địa chỉ tại Tài khoản → Sổ địa chỉ (/account/addresses).\n• Đặt một địa chỉ làm mặc định để thanh toán nhanh hơn.\n\nĐịa chỉ đầy đủ giúp giảm giao nhầm/thất lạc và tránh phải trả hàng do thiếu thông tin.",
      },
      {
        id: "account",
        title: "Tài khoản & bảo mật",
        summary: "Đổi mật khẩu, xác minh 2 bước.",
        answer:
          "Bảo vệ tài khoản của bạn:\n• Đổi mật khẩu và quản lý bảo mật tại Tài khoản → Cài đặt (/account/settings).\n• Xác minh số điện thoại và bật xác thực 2 bước nếu có.\n• Quản lý quyền riêng tư, xuất/xoá dữ liệu tại /account/settings?tab=privacy.\n\nKhông chia sẻ mật khẩu/OTP cho bất kỳ ai. ACFMart và Aivy không bao giờ hỏi mật khẩu của bạn.",
      },
      {
        id: "safe",
        title: "Mua sắm an toàn",
        summary: "Cảnh báo lừa đảo, mẹo nhận biết.",
        answer:
          "Mẹo mua sắm an toàn trên ACFMart:\n• Ưu tiên sản phẩm có huy hiệu \"Đã xác thực\" và shop được chứng nhận; quét QR để kiểm tra hàng chính hãng.\n• Chỉ thanh toán và trao đổi trong nền tảng ACFMart; cảnh giác với yêu cầu chuyển khoản ngoài sàn.\n• Không cung cấp OTP/mật khẩu; cảnh giác link lạ giả mạo ACFMart.\n\nGặp dấu hiệu lừa đảo, báo cáo qua /report-counterfeit hoặc /contact và gọi 1900 066 689.",
      },
      {
        id: "app",
        title: "Ứng dụng ACFMart",
        summary: "Cài đặt, cập nhật, thông báo đẩy.",
        answer:
          "ACFMart hoạt động mượt trên trình duyệt di động và máy tính.\n• Bạn có thể \"Thêm vào màn hình chính\" để dùng như ứng dụng và mở nhanh.\n• Bật thông báo để nhận cập nhật đơn hàng, khuyến mãi và phiên live.\n• Luôn truy cập đúng tên miền chính thức acfmart.vn để tránh trang giả mạo.\n\nNếu gặp lỗi hiển thị, thử tải lại trang hoặc xoá cache trình duyệt; cần hỗ trợ thì liên hệ CSKH.",
      },
    ],
  },
  // ─── Seller-only section ───────────────────────────────────────────────
  {
    id: "seller",
    title: "Dành cho Người bán",
    description: "Đăng ký, quản lý kho, đơn bán, khuyến mãi và tài chính.",
    audience: "seller",
    topics: [
      {
        id: "register-seller",
        title: "Đăng ký người bán",
        summary: "Hồ sơ KYC, giấy phép, thời gian duyệt.",
        answer:
          "Để mở shop trên ACFMart:\n1. Đăng nhập rồi mở Đăng ký người bán (/seller-register).\n2. Điền thông tin shop, địa chỉ lấy hàng và tài khoản ngân hàng nhận tiền.\n3. Tải giấy tờ: CMND/CCCD, giấy phép kinh doanh (nếu có) và thông tin thuế.\n4. Gửi hồ sơ và chờ duyệt (thường 1–3 ngày làm việc).\n\nTheo dõi trạng thái hồ sơ tại /seller-channel. Xem hướng dẫn chi tiết tại /guide/seller.",
      },
      {
        id: "inventory",
        title: "Quản lý kho & duyệt sản phẩm",
        summary: "Trạng thái nháp / chờ duyệt / đã duyệt.",
        answer:
          "Sản phẩm đi theo quy trình duyệt: Nháp → Chờ duyệt → Đã duyệt/Bị từ chối.\n\n• Tạo và quản lý sản phẩm tại Kênh người bán → Sản phẩm (/seller/products), thêm mới tại /seller/products/new.\n• Chỉ sản phẩm \"Đã duyệt\" (approved) mới hiển thị trên trang trưng bày.\n• Nếu bị từ chối, đọc lý do, bổ sung thông tin/hình ảnh rồi gửi duyệt lại.\n\nSản phẩm chính hãng cần khai báo đúng để được cấp tem/QR xác thực.",
      },
      {
        id: "showcase",
        title: "Trang trưng bày & trang trí",
        summary: "Banner, sản phẩm ghim, module hiển thị.",
        answer:
          "Trang trí shop giúp tăng chuyển đổi.\n• Tuỳ chỉnh giao diện shop tại /seller/shop và /seller/shop/customize.\n• Thêm banner, sản phẩm ghim và các module hiển thị (bán chạy, mới về, theo bộ sưu tập).\n• Sắp xếp bố cục để khách dễ tìm sản phẩm nổi bật.\n\nHình ảnh rõ nét và bố cục gọn gàng giúp shop chuyên nghiệp và đáng tin hơn.",
      },
      {
        id: "outgoing-orders",
        title: "Đơn vận chuyển đi",
        summary: "Đóng gói, mã vận đơn, đối soát ship.",
        answer:
          "Xử lý đơn bán:\n1. Vào Kênh người bán → Đơn hàng (/seller/orders), xác nhận đơn mới.\n2. Đóng gói đúng quy cách và tạo/được cấp mã vận đơn.\n3. Bàn giao cho đơn vị vận chuyển (GHN/GHTK/J&T) đúng hạn.\n4. Theo dõi và đối soát tại /seller/orders/track.\n\nXác nhận và giao nhanh giúp giảm huỷ đơn và tăng điểm uy tín shop.",
      },
      {
        id: "promotions-seller",
        title: "Khuyến mãi của shop",
        summary: "Voucher, flash sale, combo.",
        answer:
          "Công cụ khuyến mãi cho shop:\n• Tạo voucher riêng của shop tại /seller/vouchers (giảm theo số tiền/%, đơn tối thiểu, số lượng, hạn dùng).\n• Tham gia flash sale và tạo combo/giảm giá để kích cầu.\n• Voucher shop thường cộng dồn được với voucher sàn.\n\nĐặt điều kiện hợp lý để vừa tăng đơn vừa đảm bảo biên lợi nhuận.",
      },
      {
        id: "finance-seller",
        title: "Tài chính & rút tiền",
        summary: "Đối soát doanh thu, phí sàn, lịch rút.",
        answer:
          "Quản lý dòng tiền tại Kênh người bán → Tài chính (/seller/finance).\n\n• Doanh thu từ đơn được giữ (escrow) tới khi đơn hoàn tất và qua cửa sổ khiếu nại.\n• Khi chuyển sang số dư khả dụng, bạn rút tiền theo chu kỳ thanh toán về ngân hàng đã liên kết.\n• Phí sàn và các khoản khấu trừ được thể hiện trong đối soát; xem biểu phí tại /legal/seller-fees.\n\nĐơn đang đổi trả/khiếu nại sẽ bị giữ lại cho tới khi có kết luận.",
      },
      {
        id: "complaints",
        title: "Khiếu nại & tranh chấp",
        summary: "Quy trình tranh chấp đơn hoàn trả.",
        answer:
          "Khi có tranh chấp đơn (đổi trả, hoàn tiền, khiếu nại của khách):\n• Theo dõi và phản hồi trong chi tiết đơn ở /seller/orders; trao đổi với khách qua /seller/chat.\n• Cung cấp bằng chứng (ảnh đóng gói, mã vận đơn, video) để bảo vệ quyền lợi.\n• Trong thời gian xử lý, khoản tiền liên quan có thể bị tạm giữ.\n\nACFMart làm trung gian dựa trên bằng chứng hai bên; phản hồi sớm và đầy đủ giúp giải quyết nhanh và công bằng.",
      },
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
    id: "faq-address-book",
    audience: "buyer",
    question: "Vì sao phải hoàn tất Sổ địa chỉ trước khi đặt hàng?",
    answer:
      "ACFMart chỉ cho đặt đơn khi địa chỉ giao hàng đã đủ các phần: tên, số điện thoại, địa chỉ chi tiết, phường/xã, quận/huyện và tỉnh/thành. Điều này giúp giảm lỗi giao hàng và tránh trả hàng do thiếu địa chỉ.",
  },
  {
    id: "faq-tracking",
    audience: "both",
    question: "Tôi tra cứu mã vận đơn ở đâu?",
    answer:
      "Khách mua: Tài khoản → Theo dõi đơn. Người bán: Kênh người bán → Tra cứu đơn hàng (Đơn bán). Có thể tra theo mã đơn hoặc mã vận đơn của carrier đang dùng.",
  },
  {
    id: "faq-shipping-fee",
    audience: "both",
    question: "Phí vận chuyển được tính như thế nào?",
    answer:
      "Phí tính theo đơn vị vận chuyển (GHN/GHTK/J&T) dựa trên khối lượng, kích thước và khoảng cách giao. Phí và thời gian dự kiến hiển thị ngay ở bước thanh toán trước khi bạn đặt đơn. Một số shop có chương trình miễn/giảm phí hoặc voucher freeship.",
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
    id: "faq-voucher",
    audience: "buyer",
    question: "Làm sao thu thập và sử dụng voucher?",
    answer:
      "Thu thập voucher tại trang sản phẩm, trang shop, trang khuyến mãi hoặc trong phiên live; voucher đã lưu nằm ở Tài khoản → Voucher. Ở bước thanh toán, chọn Áp dụng voucher để hệ thống gợi ý mã hợp lệ. Voucher sàn và voucher shop thường có thể cộng dồn nếu đủ điều kiện đơn tối thiểu.",
  },
  {
    id: "faq-wallet",
    audience: "both",
    question: "Ví ACFMart dùng để làm gì?",
    answer:
      "Ví ACFMart (Tài khoản → Ví) giúp thanh toán nhanh, nhận hoàn tiền và rút về ngân hàng đã liên kết. Tiền hoàn từ đơn huỷ/đổi trả thường được trả về Ví. Vì an toàn, không chia sẻ OTP/mật khẩu cho bất kỳ ai.",
  },
  {
    id: "faq-loyalty",
    audience: "buyer",
    question: "Điểm thưởng (ACF Coin) dùng thế nào?",
    answer:
      "Bạn tích điểm qua mua hàng và đánh giá; xem cấp bậc, số điểm và đặc quyền tại Tài khoản → Điểm thưởng. Điểm có thể đổi voucher hoặc ưu đãi theo từng chương trình; cấp bậc càng cao quyền lợi càng nhiều.",
  },
  {
    id: "faq-affiliate",
    audience: "buyer",
    question: "Làm sao kiếm hoa hồng với Affiliate ACFMart?",
    answer:
      "Vào trang Affiliate để đăng ký — dùng được ngay, không cần kiểm duyệt. Bạn chia sẻ link sản phẩm và nhận hoa hồng (tối đa 50% tuỳ shop) khi có người mua qua link. Mỗi affiliate có trang công khai riêng và bảng theo dõi click/hoa hồng.",
  },
  {
    id: "faq-payment-online",
    audience: "buyer",
    question: "Đơn thanh toán online bị treo, làm sao?",
    answer:
      "Hệ thống đợi webhook xác nhận từ cổng thanh toán. Nếu sau 30 phút vẫn ở trạng thái chờ, hãy liên hệ CSKH với mã đơn để được kiểm tra. Tiền không tự nhảy vào payout seller cho tới khi đơn được chốt.",
  },
  {
    id: "faq-cod-settlement",
    audience: "buyer",
    question: "COD xong tiền sẽ đi đâu?",
    answer:
      "Khách trả tiền cho đơn vị vận chuyển khi nhận hàng. ACFMart ghi nhận trạng thái giao, còn phần đối soát COD được xử lý theo tài khoản thu hộ và ledger nội bộ của nền tảng.",
  },
  {
    id: "faq-escrow",
    audience: "both",
    question: "Vì sao ACFMart giữ tiền của đơn hàng?",
    answer:
      "ACFMart giữ tiền (escrow) để bảo vệ cả hai bên: tiền chỉ giải ngân cho shop sau khi đơn giao thành công và qua cửa sổ khiếu nại/đổi trả. Đơn đang khiếu nại, đổi trả hoặc nghi vấn hàng giả sẽ bị tạm giữ tới khi có kết luận.",
  },
  {
    id: "faq-vat",
    audience: "both",
    question: "Tôi muốn xuất hoá đơn VAT thì làm thế nào?",
    answer:
      "Nêu yêu cầu xuất hoá đơn và cung cấp thông tin (tên đơn vị, mã số thuế, địa chỉ) khi đặt hàng hoặc liên hệ shop/CSKH kèm mã đơn. Nên gửi yêu cầu sớm, tốt nhất trước khi đơn hoàn tất, để tránh phát sinh.",
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
      "Tiền ở trạng thái chờ đối soát cho tới khi hết cửa sổ khiếu nại hoặc có kết luận xử lý. Khi số dư chuyển sang khả dụng, bạn có thể rút theo chu kỳ thanh toán. Đơn đang trả hàng hoặc claim sẽ bị giữ lại.",
  },
  {
    id: "faq-return-window",
    audience: "buyer",
    question: "Thời hạn đổi trả của ACFMart là bao lâu?",
    answer:
      "Khung chuẩn là 7 ngày cho đổi ý và 15 ngày cho lỗi, sai mô tả hoặc giao nhầm. Hàng giả hoặc sai nguồn gốc được xử lý theo chương trình chống hàng giả ACF sau khi xác minh.",
  },
]
