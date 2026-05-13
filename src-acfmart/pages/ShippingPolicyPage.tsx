import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export function ShippingPolicyPage() {
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
          Chính sách Vận chuyển
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 14/05/2026
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <h2>1. Phạm vi giao hàng</h2>
          <p>
            ACFMart giao hàng toàn quốc 63 tỉnh/thành phố Việt Nam thông qua các đối tác
            logistics được xác minh.
          </p>

          <h2>2. Đối tác vận chuyển</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Đối tác</th>
                  <th>Phạm vi</th>
                  <th>Thời gian giao</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Giao Hàng Nhanh (GHN)</td>
                  <td>Toàn quốc</td>
                  <td>2-5 ngày</td>
                </tr>
                <tr>
                  <td>Giao Hàng Tiết Kiệm (GHTK)</td>
                  <td>Toàn quốc</td>
                  <td>3-7 ngày</td>
                </tr>
                <tr>
                  <td>J&amp;T Express</td>
                  <td>Toàn quốc</td>
                  <td>2-5 ngày</td>
                </tr>
                <tr>
                  <td>Giao nội thành</td>
                  <td>HCM, Hà Nội</td>
                  <td>2-4 giờ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Phí vận chuyển</h2>
          <ul>
            <li>Phí vận chuyển được tính tự động dựa trên: khoảng cách, trọng lượng, kích thước kiện hàng.</li>
            <li>Phí vận chuyển hiển thị minh bạch tại trang thanh toán trước khi xác nhận đơn.</li>
            <li><strong>Miễn phí vận chuyển:</strong> Đơn hàng từ 500,000đ (nội thành HCM/Hà Nội) hoặc từ 1,000,000đ (toàn quốc). Áp dụng theo chương trình khuyến mãi.</li>
          </ul>

          <h2>4. Thời gian xử lý đơn hàng</h2>
          <ul>
            <li><strong>Xác nhận đơn:</strong> Trong vòng 2 giờ (giờ hành chính).</li>
            <li><strong>Đóng gói & bàn giao:</strong> 12-24 giờ sau khi xác nhận.</li>
            <li><strong>Vận chuyển:</strong> Theo thời gian giao của đơn vị vận chuyển.</li>
          </ul>
          <p>
            Đơn đặt sau 17:00 hoặc vào cuối tuần/ngày lễ sẽ được xử lý vào ngày làm việc tiếp theo.
          </p>

          <h2>5. Theo dõi đơn hàng</h2>
          <p>
            Người mua có thể theo dõi trạng thái đơn hàng real-time tại{" "}
            <Link to="/track-order" className="text-brand-red-600 underline">
              Theo dõi đơn hàng
            </Link>{" "}
            hoặc trong mục Quản lý đơn hàng. Hệ thống tự động gửi thông báo qua app/Zalo khi:
          </p>
          <ul>
            <li>Đơn hàng được xác nhận.</li>
            <li>Hàng được bàn giao cho đơn vị vận chuyển.</li>
            <li>Hàng đang giao / giao không thành công.</li>
            <li>Giao hàng thành công.</li>
          </ul>

          <h2>6. Giao hàng không thành công</h2>
          <p>Nếu giao hàng không thành công (người nhận vắng, sai địa chỉ, từ chối nhận):</p>
          <ul>
            <li>Đơn vị vận chuyển liên hệ lại 1 lần và giao lại trong 24 giờ.</li>
            <li>Sau 2 lần giao không thành, đơn hàng được hoàn về Người bán.</li>
            <li>Phí vận chuyển 2 chiều do bên có lỗi chịu (Người mua nếu sai địa chỉ/từ chối, Người bán nếu gửi sai hàng).</li>
          </ul>

          <h2>7. Hàng hoá hư hỏng trong quá trình vận chuyển</h2>
          <p>
            Nếu hàng hoá bị hư hỏng do vận chuyển, Người mua gửi yêu cầu kèm ảnh/video
            chứng minh trong vòng 24 giờ sau khi nhận hàng. Sàn sẽ hỗ trợ hoàn tiền hoặc
            gửi hàng thay thế theo{" "}
            <Link to="/legal/return" className="text-brand-red-600 underline">
              Chính sách Đổi trả
            </Link>.
          </p>

          <h2>8. Hàng cồng kềnh & Đặc biệt</h2>
          <ul>
            <li>Hàng trên 30kg hoặc kích thước lớn: phí vận chuyển được tính riêng, hiển thị trước khi đặt hàng.</li>
            <li>Hàng dễ vỡ: đóng gói đặc biệt, phí bổ sung (nếu có).</li>
            <li>Hàng hạn chế vận chuyển hàng không (pin lithium, chất lỏng): chỉ giao đường bộ.</li>
          </ul>

          <h2>9. Liên hệ</h2>
          <p>
            Hỗ trợ vận chuyển:{" "}
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
