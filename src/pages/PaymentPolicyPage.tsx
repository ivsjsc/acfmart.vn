import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export function PaymentPolicyPage() {
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
          Chính sách Thanh toán
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 14/05/2026 · Theo Quyết định 2429/QĐ-NHNN &amp; Thông tư 78/2021/TT-BTC
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <h2>1. Phương thức thanh toán</h2>
          <p>ACFMart hỗ trợ các phương thức thanh toán sau:</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Phương thức</th>
                  <th>Mô tả</th>
                  <th>Phí</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chuyển khoản ngân hàng</td>
                  <td>QR Pay / chuyển khoản nội địa</td>
                  <td>Miễn phí</td>
                </tr>
                <tr>
                  <td>VNPay</td>
                  <td>Thẻ ATM nội địa, thẻ quốc tế (Visa, Master)</td>
                  <td>Miễn phí cho Người mua</td>
                </tr>
                <tr>
                  <td>MoMo</td>
                  <td>Ví điện tử MoMo</td>
                  <td>Miễn phí cho Người mua</td>
                </tr>
                <tr>
                  <td>ZaloPay</td>
                  <td>Ví điện tử ZaloPay</td>
                  <td>Miễn phí cho Người mua</td>
                </tr>
                <tr>
                  <td>COD (Thu hộ)</td>
                  <td>Thanh toán khi nhận hàng</td>
                  <td>Miễn phí cho Người mua</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-500">
            Phí xử lý thanh toán do Sàn và Người bán chịu, không tính vào đơn hàng Người mua.
          </p>

          <h2>2. Cơ chế Escrow (Giữ tiền đảm bảo)</h2>
          <p>
            ACFMart áp dụng cơ chế escrow để bảo vệ Người mua:
          </p>
          <ol>
            <li>Người mua thanh toán → Tiền được giữ tại tài khoản trung gian của Sàn.</li>
            <li>Người bán giao hàng → Người mua xác nhận nhận hàng.</li>
            <li>Sau khi xác nhận (hoặc hết thời gian chờ 7 ngày), tiền được chuyển cho Người bán.</li>
          </ol>
          <p>
            Trong thời gian giữ tiền, nếu phát sinh tranh chấp (hàng giả, sai mô tả), Sàn sẽ
            tạm giữ tiền cho đến khi giải quyết xong.
          </p>

          <h2>3. Bảo mật thanh toán</h2>
          <ul>
            <li>Mã hoá TLS 1.3 cho tất cả giao dịch trực tuyến.</li>
            <li>ACFMart <strong>không lưu trữ</strong> thông tin thẻ tín dụng/ghi nợ — thông tin được xử lý bởi
              đối tác thanh toán (VNPay, MoMo) tuân thủ PCI-DSS.</li>
            <li>Xác thực OTP/3D Secure cho giao dịch thẻ quốc tế.</li>
            <li>Giám sát giao dịch bất thường 24/7 bằng hệ thống AI.</li>
          </ul>

          <h2>4. Hoá đơn điện tử</h2>
          <p>
            Theo Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC, ACFMart xuất hoá đơn
            điện tử cho mọi giao dịch:
          </p>
          <ul>
            <li>Hoá đơn được gửi tự động qua email sau khi đơn hàng hoàn tất.</li>
            <li>Người mua có thể tải hoá đơn từ mục Quản lý đơn hàng.</li>
            <li>Hoá đơn VAT (10%) cho doanh nghiệp: cung cấp MST khi đặt hàng.</li>
          </ul>

          <h2>5. Hoàn tiền</h2>
          <p>
            Chi tiết quy trình hoàn tiền tại{" "}
            <Link to="/legal/return" className="text-brand-red-600 underline">
              Chính sách Đổi trả & Hoàn tiền
            </Link>. Tóm tắt:
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Phương thức gốc</th>
                  <th>Hoàn về</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Thẻ/Ví điện tử</td>
                  <td>Phương thức gốc</td>
                  <td>3-5 ngày làm việc</td>
                </tr>
                <tr>
                  <td>Chuyển khoản</td>
                  <td>Tài khoản ngân hàng</td>
                  <td>1-3 ngày làm việc</td>
                </tr>
                <tr>
                  <td>COD</td>
                  <td>Chuyển khoản ngân hàng</td>
                  <td>3-5 ngày làm việc</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>6. Chính sách giá</h2>
          <ul>
            <li>Giá hiển thị trên Sàn đã bao gồm thuế VAT (trừ trường hợp ghi rõ).</li>
            <li>Giá không bao gồm phí vận chuyển (hiển thị riêng tại trang thanh toán).</li>
            <li>Sàn không chịu trách nhiệm về chênh lệch giá giữa Người bán và thị trường.</li>
            <li>Nghiêm cấm Người bán thao túng giá, tạo giao dịch ảo để tăng giá trị.</li>
          </ul>

          <h2>7. Thanh toán cho Người bán</h2>
          <p>
            Chi tiết biểu phí cho Người bán tại{" "}
            <Link to="/legal/seller-fees" className="text-brand-red-600 underline">
              Chính sách Phí Người bán
            </Link>.
          </p>
          <ul>
            <li>Chu kỳ thanh toán: Thứ 2 và Thứ 5 hàng tuần.</li>
            <li>Thời gian giữ tiền: 7 ngày sau đơn hoàn tất.</li>
            <li>Phương thức: Chuyển khoản ngân hàng.</li>
          </ul>

          <h2>8. Liên hệ</h2>
          <p>
            Hỗ trợ thanh toán:{" "}
            <Link to="/contact" className="text-brand-red-600 underline">
              Trung tâm Hỗ trợ
            </Link>{" "}
            | Email: <strong>support@acfmart.vn</strong> | Hotline: <strong>1900-xxxx</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
