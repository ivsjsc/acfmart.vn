import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export function SellerFeesPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/seller-register"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Quay lại đăng ký
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900">
          Chính sách Phí Người bán
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 01/05/2026 · Minh bạch theo Thông tư 47/2014/TT-BTC
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <h2>1. Phí đăng ký</h2>
          <p>
            <strong>Miễn phí đăng ký.</strong> Không thu phí mở gian hàng, không yêu cầu
            đặt cọc khi đăng ký bán hàng trên ACFMart.
          </p>

          <h2>2. Phí hoa hồng (Commission)</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Ngành hàng</th>
                  <th>Phí hoa hồng</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Thời trang</td>
                  <td>5%</td>
                  <td>Tính trên giá bán thực tế</td>
                </tr>
                <tr>
                  <td>Mỹ phẩm / Sức khoẻ</td>
                  <td>6%</td>
                  <td>Bao gồm phí xác minh nguồn gốc</td>
                </tr>
                <tr>
                  <td>Điện tử / Công nghệ</td>
                  <td>3%</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Gia dụng / Đời sống</td>
                  <td>5%</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Thực phẩm / Đồ uống</td>
                  <td>4%</td>
                  <td>Yêu cầu giấy ATTP</td>
                </tr>
                <tr>
                  <td>Sách / Văn phòng phẩm</td>
                  <td>2%</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>Mẹ &amp; Bé</td>
                  <td>5%</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-500">
            Phí hoa hồng chỉ tính trên đơn hàng giao thành công. Đơn hoàn/trả không tính phí.
          </p>

          <h2>3. Phí thanh toán (Payment Processing)</h2>
          <ul>
            <li>COD (Thu hộ tiền mặt): 1.5% giá trị đơn + 5,000đ/đơn</li>
            <li>Thanh toán online (thẻ/ví): 1.8% giá trị đơn</li>
            <li>Chuyển khoản ngân hàng: Miễn phí</li>
          </ul>

          <h2>4. Phí vận chuyển</h2>
          <p>
            Phí vận chuyển do đối tác logistics tính. Người bán và Khách hàng có thể thoả thuận
            bên chịu phí. ACFMart hiển thị minh bạch phí vận chuyển trước khi xác nhận đơn.
          </p>

          <h2>5. Chu kỳ thanh toán</h2>
          <ul>
            <li>Thanh toán vào Thứ 2 và Thứ 5 hàng tuần</li>
            <li>Thời gian giữ tiền: 7 ngày sau khi đơn hoàn tất (bảo vệ người mua)</li>
            <li>Phương thức: Chuyển khoản ngân hàng (theo tài khoản đã đăng ký)</li>
          </ul>

          <h2>6. Phí khác</h2>
          <ul>
            <li>Đăng tin quảng cáo: Theo gói (liên hệ)</li>
            <li>Dán tem chống hàng giả ACF: 500đ/tem (từ 1,000 tem)</li>
            <li>Xác minh Premium (VNeID Level 2): Miễn phí</li>
          </ul>

          <h2>7. Cam kết minh bạch</h2>
          <p>
            ACFMart cam kết minh bạch toàn bộ phí và hoa hồng. Mọi thay đổi về phí sẽ được
            thông báo trước 30 ngày qua email và Zalo OA. Người bán có quyền rời nền tảng
            nếu không đồng ý với biểu phí mới.
          </p>
          <p>
            Khiếu nại về phí: Liên hệ{" "}
            <Link to="/contact" className="text-brand-red-600 underline">
              Trung tâm Hỗ trợ
            </Link>{" "}
            hoặc email <strong>support@acfmart.vn</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
