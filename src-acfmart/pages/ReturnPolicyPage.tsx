import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export function ReturnPolicyPage() {
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
          Chính sách Đổi trả & Hoàn tiền
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 14/05/2026 · Theo Luật Bảo vệ Quyền lợi Người tiêu dùng 2023
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <h2>1. Phạm vi áp dụng</h2>
          <p>
            Chính sách đổi trả áp dụng cho tất cả sản phẩm mua trên Sàn TMĐT ACFMart, trừ các
            trường hợp ngoại lệ được nêu tại Mục 5.
          </p>

          <h2>2. Thời hạn đổi trả</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Loại sản phẩm</th>
                  <th>Thời hạn đổi trả</th>
                  <th>Điều kiện</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hàng lỗi / Hàng giả</td>
                  <td>30 ngày</td>
                  <td>Kèm bằng chứng (ảnh/video)</td>
                </tr>
                <tr>
                  <td>Sai mô tả / Sai sản phẩm</td>
                  <td>7 ngày</td>
                  <td>Chưa qua sử dụng, còn nguyên bao bì</td>
                </tr>
                <tr>
                  <td>Đổi ý cá nhân</td>
                  <td>3 ngày</td>
                  <td>Chưa qua sử dụng, còn seal/tag</td>
                </tr>
                <tr>
                  <td>Thực phẩm / FMCG</td>
                  <td>24 giờ</td>
                  <td>Lỗi rõ ràng, kèm ảnh</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-500">
            Thời hạn tính từ ngày Người mua nhận hàng (theo xác nhận vận chuyển).
          </p>

          <h2>3. Quy trình đổi trả</h2>
          <ol>
            <li>
              <strong>Bước 1 — Gửi yêu cầu:</strong> Người mua vào Quản lý đơn hàng → chọn đơn cần trả
              → nhấn "Yêu cầu đổi/trả" → điền lý do, đính kèm ảnh/video.
            </li>
            <li>
              <strong>Bước 2 — Xem xét:</strong> Người bán xác nhận hoặc từ chối trong vòng 48 giờ.
              Nếu không phản hồi, yêu cầu tự động được duyệt.
            </li>
            <li>
              <strong>Bước 3 — Gửi trả hàng:</strong> Người mua gửi trả hàng qua đơn vị vận chuyển
              được chỉ định. Phí vận chuyển trả hàng do bên có lỗi chịu.
            </li>
            <li>
              <strong>Bước 4 — Hoàn tiền:</strong> Sau khi Người bán nhận hàng trả và xác nhận,
              tiền được hoàn trong 3-5 ngày làm việc.
            </li>
          </ol>

          <h2>4. Phương thức hoàn tiền</h2>
          <ul>
            <li><strong>Thanh toán online:</strong> Hoàn về phương thức gốc (thẻ, ví điện tử).</li>
            <li><strong>COD:</strong> Hoàn qua chuyển khoản ngân hàng (cần cung cấp STK).</li>
            <li><strong>Ví ACFMart:</strong> Hoàn vào ví nội bộ, có thể rút hoặc sử dụng cho đơn tiếp theo.</li>
          </ul>
          <p>Thời gian xử lý hoàn tiền: 3-5 ngày làm việc kể từ khi xác nhận.</p>

          <h2>5. Trường hợp không áp dụng đổi trả</h2>
          <ul>
            <li>Sản phẩm đã qua sử dụng, hư hỏng do lỗi của Người mua.</li>
            <li>Sản phẩm số (key, license, nội dung điện tử).</li>
            <li>Sản phẩm may đo theo yêu cầu riêng.</li>
            <li>Sản phẩm vệ sinh cá nhân đã mở seal (nội y, đồ tắm).</li>
            <li>Sản phẩm giảm giá trên 50% được ghi rõ "không đổi trả".</li>
          </ul>

          <h2>6. Hàng giả — Bảo vệ đặc biệt</h2>
          <p>
            Nếu phát hiện hàng giả (qua quét QR hoặc kiểm định chuyên gia), Người mua được:
          </p>
          <ul>
            <li><strong>Hoàn tiền 100%</strong> không cần trả hàng.</li>
            <li>Bồi thường thêm theo chính sách "Đền gấp đôi hàng giả" (nếu áp dụng).</li>
            <li>Người bán bị xử lý theo <Link to="/legal/seller-terms" className="text-brand-red-600 underline">Điều khoản Người bán</Link> (Mục 6 — Chế tài).</li>
          </ul>

          <h2>7. Giải quyết khiếu nại</h2>
          <p>
            Nếu Người mua không đồng ý với quyết định đổi trả, có thể:
          </p>
          <ol>
            <li>Yêu cầu Sàn can thiệp hoà giải (trong 48 giờ).</li>
            <li>Khiếu nại tại Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương.</li>
            <li>Khởi kiện tại Toà án nhân dân có thẩm quyền.</li>
          </ol>

          <h2>8. Liên hệ</h2>
          <p>
            Hỗ trợ đổi trả:{" "}
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
