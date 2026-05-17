import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { ACFMART_HOTLINE, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile"

export function AffiliatePolicyPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Về trang chủ
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900">
          Chính sách Chương trình Tiếp thị liên kết (Affiliate)
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 18/05/2026 · Theo Thông tư 40/2021/TT-BTC &amp; Nghị định 126/2020/NĐ-CP
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <h2>1. Giới thiệu chương trình</h2>
          <p>
            Chương trình Tiếp thị liên kết (Affiliate) ACFMart cho phép cá nhân và tổ chức
            giới thiệu sản phẩm trên Sàn ACFMart và nhận hoa hồng từ các đơn hàng thành công
            thông qua link/QR giới thiệu.
          </p>

          <h2>2. Điều kiện tham gia</h2>
          <ul>
            <li>Công dân Việt Nam hoặc tổ chức có đăng ký kinh doanh tại Việt Nam.</li>
            <li>Tài khoản ACFMart đã xác minh (email + SĐT).</li>
            <li>Cam kết tuân thủ quy tắc quảng bá của chương trình.</li>
            <li>Có kênh truyền thông (website, mạng xã hội, blog) với nội dung hợp pháp.</li>
          </ul>

          <h2>3. Biểu phí hoa hồng (Commission)</h2>
          <h3>3.1. Theo cấp bậc (Tier)</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Cấp bậc</th>
                  <th>Yêu cầu</th>
                  <th>Hoa hồng</th>
                  <th>Bonus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bronze</td>
                  <td>Mới đăng ký</td>
                  <td>3-5%</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Silver</td>
                  <td>≥10 đơn/tháng, GMV ≥50 triệu</td>
                  <td>5-8%</td>
                  <td>+2% sản phẩm mới</td>
                </tr>
                <tr>
                  <td>Gold</td>
                  <td>≥50 đơn/tháng, GMV ≥200 triệu</td>
                  <td>8-12%</td>
                  <td>+3% bonus, early access</td>
                </tr>
                <tr>
                  <td>Platinum</td>
                  <td>≥200 đơn/tháng, GMV ≥1 tỷ</td>
                  <td>12-15%</td>
                  <td>+5% bonus, AM riêng</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>3.2. Theo ngành hàng</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Ngành hàng</th>
                  <th>Hoa hồng</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Thời trang & Phụ kiện</td><td>10-15%</td></tr>
                <tr><td>Mỹ phẩm & Làm đẹp</td><td>12-18%</td></tr>
                <tr><td>Điện tử & Công nghệ</td><td>3-6%</td></tr>
                <tr><td>Gia dụng</td><td>8-12%</td></tr>
                <tr><td>Sách & Văn phòng phẩm</td><td>15-20%</td></tr>
                <tr><td>Thực phẩm & FMCG</td><td>5-8%</td></tr>
              </tbody>
            </table>
          </div>

          <h2>4. Cách thức hoạt động</h2>
          <ol>
            <li><strong>Đăng ký:</strong> Tạo tài khoản Affiliate tại <Link to="/affiliate" className="text-brand-red-600 underline">Affiliate Dashboard</Link>.</li>
            <li><strong>Tạo link:</strong> Chọn sản phẩm/shop cần quảng bá → hệ thống tạo link/QR code riêng.</li>
            <li><strong>Quảng bá:</strong> Chia sẻ link trên các kênh truyền thông của bạn.</li>
            <li><strong>Tracking:</strong> Hệ thống theo dõi clicks, conversions qua cookie (30 ngày).</li>
            <li><strong>Nhận hoa hồng:</strong> Hoa hồng tích luỹ, thanh toán theo chu kỳ.</li>
          </ol>

          <h2>5. Thanh toán hoa hồng</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Phương thức</th>
                  <th>Tối thiểu</th>
                  <th>Thời gian</th>
                  <th>Phí</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chuyển khoản ngân hàng</td>
                  <td>500,000đ</td>
                  <td>T+3-5 ngày</td>
                  <td>Miễn phí</td>
                </tr>
                <tr>
                  <td>Ví MoMo/ZaloPay</td>
                  <td>200,000đ</td>
                  <td>T+1 ngày</td>
                  <td>1-2%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Thời gian giữ (Hold period):</strong> 30-45 ngày sau đơn hàng hoàn tất, để xử lý
            trường hợp đổi trả/hoàn tiền.
          </p>

          <h2>6. Nghĩa vụ thuế</h2>
          <p>Theo Thông tư 40/2021/TT-BTC & Nghị định 126/2020/NĐ-CP:</p>
          <ul>
            <li><strong>Thu nhập dưới 100 triệu/năm:</strong> Miễn thuế TNCN.</li>
            <li><strong>Thu nhập từ 100 triệu/năm:</strong> Thuế TNCN 5% — Sàn khấu trừ tại nguồn.</li>
            <li><strong>Affiliate là doanh nghiệp:</strong> Xuất hoá đơn VAT, Sàn thanh toán tổng (gross).</li>
            <li>Sàn cung cấp chứng từ thuế hàng năm cho Affiliate.</li>
          </ul>

          <h2>7. Hành vi bị cấm</h2>
          <ul>
            <li><strong>Self-referral:</strong> Tự mua hàng qua link affiliate của mình.</li>
            <li><strong>Click fraud:</strong> Sử dụng bot, click farm, hoặc tạo traffic giả.</li>
            <li><strong>Cookie stuffing:</strong> Đặt cookie affiliate mà không có tương tác thực.</li>
            <li><strong>Spam:</strong> Gửi link qua email/tin nhắn hàng loạt mà không có sự đồng ý.</li>
            <li><strong>Quảng cáo sai sự thật:</strong> Phóng đại tính năng, giá cả sản phẩm.</li>
            <li><strong>Brand bidding:</strong> Đấu giá từ khoá thương hiệu "ACFMart" trên quảng cáo tìm kiếm.</li>
          </ul>

          <h2>8. Chế tài vi phạm</h2>
          <ul>
            <li><strong>Lần 1:</strong> Cảnh cáo, thu hồi hoa hồng vi phạm.</li>
            <li><strong>Lần 2:</strong> Tạm khoá tài khoản Affiliate 30 ngày.</li>
            <li><strong>Lần 3:</strong> Chấm dứt hợp đồng, khoá vĩnh viễn, thu hồi toàn bộ hoa hồng chưa thanh toán.</li>
          </ul>

          <h2>9. Chấm dứt tham gia</h2>
          <p>
            Affiliate có thể rời chương trình bất cứ lúc nào. Hoa hồng đã tích luỹ (trên mức tối thiểu)
            sẽ được thanh toán trong chu kỳ tiếp theo. Sàn có quyền chấm dứt hợp tác với Affiliate
            vi phạm điều khoản.
          </p>

          <h2>10. Liên hệ</h2>
          <p>
            Hỗ trợ Affiliate:{" "}
            <Link to="/contact" className="text-brand-red-600 underline">
              Trung tâm Hỗ trợ
            </Link>{" "}
            | Email: <strong>{ACFMART_SUPPORT_EMAIL}</strong> | Hotline: <strong>{ACFMART_HOTLINE}</strong> (nhấn phím 4)
          </p>
        </div>
      </div>
    </div>
  )
}
