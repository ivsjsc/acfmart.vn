import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import {
  ACFMART_HOTLINE,
  ACFMART_LEGAL_DISPLAY,
  ACFMART_REPRESENTATIVE,
  ACFMART_SUPPORT_EMAIL,
} from "../lib/legal-profile"

export function TermsOfServicePage() {
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
          Điều khoản sử dụng Sàn TMĐT ACFMart
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 18/05/2026 · Căn cứ Nghị định 52/2013/NĐ-CP &amp; Nghị định 85/2021/NĐ-CP
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <h2>1. Giới thiệu</h2>
          <p>
            Sàn Thương mại điện tử ACFMart (sau đây gọi là "Sàn") là nền tảng giao dịch trực tuyến
            do <strong>{ACFMART_LEGAL_DISPLAY}</strong> sở hữu và vận hành. Sàn đang hoàn thiện hồ sơ
            thông báo hoạt động tại Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương theo
            Nghị định 52/2013/NĐ-CP (sửa đổi, bổ sung bởi Nghị định 85/2021/NĐ-CP).
          </p>
          <p>
            Bằng việc truy cập và sử dụng Sàn, bạn đồng ý tuân thủ các điều khoản này. Nếu không đồng ý,
            vui lòng ngừng sử dụng dịch vụ.
          </p>

          <h2>2. Định nghĩa</h2>
          <ul>
            <li><strong>"Sàn"</strong>: Hệ thống TMĐT ACFMart hoạt động tại acfmart.vn, acfmart.store, acfmart.online, acfmart.cloud.</li>
            <li><strong>"Đơn vị vận hành"</strong>: {ACFMART_LEGAL_DISPLAY}, đại diện bởi ông {ACFMART_REPRESENTATIVE}.</li>
            <li><strong>"Người mua"</strong>: Cá nhân đăng ký tài khoản để mua sắm trên Sàn.</li>
            <li><strong>"Người bán"</strong>: Cá nhân, hộ kinh doanh hoặc doanh nghiệp đã đăng ký và được duyệt bán hàng trên Sàn.</li>
            <li><strong>"Người dùng"</strong>: Tất cả cá nhân truy cập và sử dụng Sàn.</li>
            <li><strong>"Giao dịch"</strong>: Hoạt động mua bán hàng hoá, dịch vụ giữa Người mua và Người bán trên Sàn.</li>
          </ul>

          <h2>3. Quyền và trách nhiệm của Sàn</h2>
          <h3>3.1. Quyền của Sàn</h3>
          <ul>
            <li>Xét duyệt hoặc từ chối đơn đăng ký Người bán theo tiêu chí nội bộ.</li>
            <li>Gỡ bỏ sản phẩm vi phạm quy định hoặc chính sách mà không cần báo trước.</li>
            <li>Tạm khoá hoặc chấm dứt tài khoản có hành vi vi phạm.</li>
            <li>Thu phí hoa hồng và phí dịch vụ theo biểu phí công khai.</li>
            <li>Sửa đổi điều khoản này và thông báo trước 15 ngày.</li>
          </ul>
          <h3>3.2. Trách nhiệm của Sàn</h3>
          <ul>
            <li>Cung cấp môi trường giao dịch trực tuyến an toàn, minh bạch.</li>
            <li>Xác minh danh tính Người bán thông qua quy trình KYC.</li>
            <li>Hỗ trợ giải quyết tranh chấp giữa Người mua và Người bán.</li>
            <li>Bảo mật thông tin cá nhân theo Nghị định 13/2023/NĐ-CP (PDPD).</li>
            <li>Lưu trữ nhật ký hoạt động (audit log) tối thiểu 24 tháng theo NĐ 85/2021.</li>
            <li>Báo cáo hoạt động định kỳ với Bộ Công Thương theo quy định.</li>
          </ul>

          <h2>4. Quyền và nghĩa vụ của Người mua</h2>
          <ul>
            <li>Được mua sắm, thanh toán an toàn và nhận hàng đúng cam kết.</li>
            <li>Được bảo vệ quyền lợi khi nhận hàng không đúng mô tả hoặc hàng giả.</li>
            <li>Được đổi trả hàng theo <Link to="/legal/return" className="text-brand-red-600 underline">Chính sách Đổi trả</Link>.</li>
            <li>Cung cấp thông tin chính xác khi đặt hàng.</li>
            <li>Không lạm dụng quyền đổi trả, khiếu nại sai sự thật.</li>
            <li>Không sử dụng Sàn cho mục đích bất hợp pháp.</li>
          </ul>

          <h2>5. Quyền và nghĩa vụ của Người bán</h2>
          <p>
            Chi tiết tại{" "}
            <Link to="/legal/seller-terms" className="text-brand-red-600 underline">
              Điều khoản Người bán
            </Link>{" "}
            và{" "}
            <Link to="/legal/seller-fees" className="text-brand-red-600 underline">
              Chính sách Phí
            </Link>.
          </p>

          <h2>6. Sản phẩm & Dịch vụ</h2>
          <h3>6.1. Hàng hoá được phép</h3>
          <p>Chỉ hàng hoá chính hãng, có nguồn gốc xuất xứ rõ ràng, tuân thủ quy định ghi nhãn (NĐ 43/2017/NĐ-CP).</p>
          <h3>6.2. Hàng hoá bị cấm</h3>
          <ul>
            <li>Hàng giả, hàng nhái, hàng vi phạm sở hữu trí tuệ.</li>
            <li>Vũ khí, chất cấm, thuốc lá điện tử, pháo nổ.</li>
            <li>Thuốc tân dược không có giấy phép lưu hành.</li>
            <li>Sản phẩm đồi truỵ, phản động hoặc vi phạm pháp luật Việt Nam.</li>
            <li>Động vật hoang dã, sản phẩm từ nguồn bất hợp pháp.</li>
          </ul>

          <h2>7. Thanh toán</h2>
          <p>
            Sàn hỗ trợ các hình thức thanh toán: chuyển khoản ngân hàng, VNPay, MoMo, ZaloPay, COD.
            Chi tiết tại{" "}
            <Link to="/legal/payment" className="text-brand-red-600 underline">
              Chính sách Thanh toán
            </Link>.
          </p>

          <h2>8. Xác minh nguồn gốc & Chống hàng giả</h2>
          <p>
            ACFMart tích hợp hệ thống xác minh QR code do Quỹ Chống Hàng Giả Việt Nam (ACF) cung cấp.
            Người mua có thể quét mã QR để xác thực nguồn gốc sản phẩm.
            Chi tiết tại{" "}
            <Link to="/anti-counterfeit" className="text-brand-red-600 underline">
              Chương trình Chống hàng giả
            </Link>.
          </p>

          <h2>9. Giải quyết tranh chấp</h2>
          <ol>
            <li><strong>Bước 1:</strong> Người mua và Người bán tự thương lượng qua hệ thống chat của Sàn.</li>
            <li><strong>Bước 2:</strong> Nếu không đạt thoả thuận trong 48 giờ, Sàn can thiệp hoà giải.</li>
            <li><strong>Bước 3:</strong> Nếu hoà giải không thành, các bên có quyền khiếu nại tại
              Cục Thương mại điện tử và Kinh tế số (Bộ Công Thương) hoặc khởi kiện tại Toà án nhân dân
              có thẩm quyền theo pháp luật Việt Nam.</li>
          </ol>

          <h2>10. Bảo mật thông tin</h2>
          <p>
            Thông tin cá nhân được bảo vệ theo Nghị định 13/2023/NĐ-CP. Chi tiết tại{" "}
            <Link to="/legal/privacy" className="text-brand-red-600 underline">
              Chính sách Bảo mật
            </Link>.
          </p>

          <h2>11. Sở hữu trí tuệ</h2>
          <p>
            Toàn bộ nội dung trên Sàn (logo, giao diện, cơ sở dữ liệu, quy trình vận hành và tài sản
            thương mại) thuộc quyền sở hữu hoặc quyền khai thác hợp pháp của {ACFMART_LEGAL_DISPLAY}.
            IVS JSC là cổ đông công nghệ và đối tác phát triển, chuyển giao tài sản công nghệ theo
            thỏa thuận nội bộ của ACFMart. Nghiêm cấm sao chép, phân phối mà không có sự đồng ý bằng văn bản.
          </p>

          <h2>12. Giới hạn trách nhiệm</h2>
          <p>
            Sàn là trung gian kết nối Người mua và Người bán. Sàn không chịu trách nhiệm về chất lượng
            hàng hoá do Người bán cung cấp, nhưng cam kết hỗ trợ giải quyết tranh chấp và xử lý nghiêm
            Người bán vi phạm.
          </p>

          <h2>13. Luật áp dụng</h2>
          <p>
            Điều khoản này được điều chỉnh bởi pháp luật nước Cộng hoà Xã hội Chủ nghĩa Việt Nam.
            Mọi tranh chấp phát sinh được giải quyết tại Toà án nhân dân có thẩm quyền tại Việt Nam.
          </p>

          <h2>14. Liên hệ</h2>
          <p>
            <strong>{ACFMART_LEGAL_DISPLAY}</strong><br />
            Người đại diện: {ACFMART_REPRESENTATIVE}<br />
            Email: {ACFMART_SUPPORT_EMAIL}<br />
            Hotline: {ACFMART_HOTLINE}<br />
            Website: <a href="https://acfmart.vn" className="text-brand-red-600 underline">acfmart.vn</a>
          </p>
        </div>
      </div>
    </div>
  )
}
