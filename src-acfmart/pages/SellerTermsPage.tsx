import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export function SellerTermsPage() {
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
          Điều khoản Người bán trên ACFMart
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 01/05/2026
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <h2>1. Định nghĩa</h2>
          <p>
            <strong>"Người bán"</strong> là cá nhân, hộ kinh doanh hoặc doanh nghiệp đã đăng ký tài khoản
            bán hàng trên nền tảng ACFMart và được phê duyệt bởi đội ngũ kiểm duyệt.
          </p>
          <p>
            <strong>"Nền tảng"</strong> là hệ thống thương mại điện tử ACFMart hoạt động tại
            acfmart.vn và acfmart.store, tuân thủ Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP.
          </p>

          <h2>2. Điều kiện đăng ký</h2>
          <ul>
            <li>Cá nhân: CCCD/CMND còn hiệu lực, tài khoản ngân hàng chính chủ</li>
            <li>Hộ kinh doanh: Giấy chứng nhận đăng ký hộ kinh doanh + CCCD chủ hộ</li>
            <li>Doanh nghiệp: Giấy phép kinh doanh + CCCD người đại diện pháp luật + MST</li>
          </ul>

          <h2>3. Quy trình xác minh (KYC)</h2>
          <p>
            ACFMart áp dụng quy trình xác minh danh tính (Know Your Customer) gồm các cấp độ:
          </p>
          <ul>
            <li><strong>Basic:</strong> Xác minh CCCD và thông tin cơ bản</li>
            <li><strong>Verified:</strong> Xác minh giấy tờ kinh doanh + tài khoản ngân hàng</li>
            <li><strong>Premium:</strong> Xác minh qua VNeID Level 2 + kiểm tra tại chỗ</li>
          </ul>
          <p>Thời gian duyệt hồ sơ: 24-48 giờ làm việc.</p>

          <h2>4. Nghĩa vụ của Người bán</h2>
          <ul>
            <li>Cung cấp thông tin trung thực, chính xác, cập nhật khi có thay đổi</li>
            <li>Đảm bảo hàng hoá là chính hãng, có nguồn gốc xuất xứ rõ ràng</li>
            <li>Tuân thủ quy định ghi nhãn hàng hoá (Nghị định 43/2017/NĐ-CP)</li>
            <li>Xuất hoá đơn theo quy định pháp luật khi được yêu cầu</li>
            <li>Xử lý đơn hàng trong vòng 24 giờ, vận chuyển đúng thời hạn cam kết</li>
            <li>Giải quyết khiếu nại của khách hàng trong vòng 48 giờ</li>
          </ul>

          <h2>5. Hành vi bị nghiêm cấm</h2>
          <ul>
            <li>Bán hàng giả, hàng nhái, hàng vi phạm sở hữu trí tuệ</li>
            <li>Thao túng giá, đánh giá giả, giao dịch ảo</li>
            <li>Thu thập thông tin cá nhân khách hàng ngoài mục đích giao dịch</li>
            <li>Chuyển hướng giao dịch ra ngoài nền tảng</li>
          </ul>

          <h2>6. Chế tài xử lý</h2>
          <p>
            Vi phạm điều khoản sẽ bị xử lý theo mức độ: cảnh cáo, tạm khoá shop (7-30 ngày),
            khoá vĩnh viễn. Trường hợp nghiêm trọng sẽ được chuyển cơ quan chức năng xử lý
            theo Nghị định 98/2020/NĐ-CP.
          </p>

          <h2>7. Bảo vệ dữ liệu cá nhân</h2>
          <p>
            Dữ liệu cá nhân của Người bán được thu thập, xử lý theo Nghị định 13/2023/NĐ-CP (PDPD).
            Chi tiết tại{" "}
            <Link to="/legal/privacy" className="text-brand-red-600 underline">
              Chính sách Bảo mật
            </Link>.
          </p>

          <h2>8. Giải quyết tranh chấp</h2>
          <p>
            Tranh chấp giữa Người bán và Khách hàng được giải quyết qua cơ chế hoà giải của
            nền tảng. Nếu không đạt thoả thuận, các bên có quyền khiếu nại tại Cục Thương mại
            điện tử và Kinh tế số (Bộ Công Thương) hoặc khởi kiện tại Toà án có thẩm quyền.
          </p>
        </div>
      </div>
    </div>
  )
}
