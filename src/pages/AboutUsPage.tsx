import { Link } from "react-router-dom";
import {
  ACFMART_ENGLISH_NAME,
  ACFMART_HEAD_OFFICE,
  ACFMART_HOTLINE,
  ACFMART_LEGAL_DISPLAY,
  ACFMART_REPRESENTATIVE,
  ACFMART_SUPPORT_EMAIL,
  ACFMART_TAX_CODE,
  ACFMART_OWNERSHIP,
} from "../lib/legal-profile";

export function AboutUsPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          ← Về trang chủ
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900">Về Chúng Tôi</h1>
        
        <div className="prose prose-sm mt-6 max-w-none">
          <section className="mb-6">
            <h2 className="text-lg font-semibold">Pháp nhân sở hữu và vận hành: {ACFMART_LEGAL_DISPLAY}</h2>
            <p>
              ACFMart.vn, acfmart.store, acfmart.online và acfmart.cloud thuộc hệ sinh thái do
              {` ${ACFMART_LEGAL_DISPLAY} `}sở hữu và vận hành. Công ty chịu trách nhiệm về nội dung,
              hoạt động thương mại điện tử, bảo vệ dữ liệu cá nhân và tuân thủ pháp luật trong quá trình
              vận hành nền tảng.
            </p>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Tên tiếng Anh:</strong> {ACFMART_ENGLISH_NAME}</li>
              <li>• <strong>Người đại diện:</strong> {ACFMART_REPRESENTATIVE}</li>
              <li>• <strong>Mã số thuế:</strong> {ACFMART_TAX_CODE}</li>
              <li>• <strong>Trụ sở chính:</strong> {ACFMART_HEAD_OFFICE}</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Cơ cấu sở hữu và vai trò chiến lược</h2>
            <p>
              ACFMart được tổ chức theo mô hình công ty cổ phần. Các cổ đông và vai trò chính được
              xác định theo hồ sơ công ty:
            </p>
            <ul className="mt-2 space-y-1">
              {ACFMART_OWNERSHIP.map((owner) => (
                <li key={owner.name}>
                  • <strong>{owner.name} ({owner.percent}):</strong> {owner.role}
                </li>
              ))}
              <li>
                • <strong>Quỹ Chống Hàng Giả ACF:</strong> giám sát định hướng chống hàng giả và kết nối
                hệ sinh thái xác thực, không can thiệp vận hành hằng ngày.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Chủ trì dự án</h2>
            <p>
              <strong>Ông Nguyễn Minh Triết</strong> - Người đứng đầu triển khai dự án, với năng lực tích hợp đa lĩnh vực:
            </p>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Kỹ thuật:</strong> Làm chủ Full-stack Development, Kiến trúc hệ thống, Bảo mật & Tích hợp AI</li>
              <li>• <strong>Pháp lý:</strong> Am hiểu Luật TMĐT 2025, quy trình đăng ký Sàn TMĐT Bộ Công Thương</li>
              <li>• <strong>Quản trị:</strong> Vận hành sàn TMĐT End-to-End, hoạch định chiến lược & quản trị rủi ro</li>
            </ul>
            <p className="mt-2 text-sm">
              Xem thêm tại: <a href="https://minhtriet.online" target="_blank" rel="noopener noreferrer" className="text-brand-red-600 hover:underline">minhtriet.online</a>
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Lợi thế cạnh tranh "3 trong 1"</h2>
            <p>
              Dự án tích hợp năng lực đa chiều, xóa nhòa ranh giới giữa ba trụ cột then chốt:
            </p>
            <ul className="mt-2 space-y-1">
              <li>✅ <strong>Kỹ thuật:</strong> Không phụ thuộc bên thứ ba, chủ động tối ưu hiệu năng và kiểm soát chi phí</li>
              <li>✅ <strong>Pháp lý:</strong> Thiết kế hệ thống tuân thủ ngay từ đầu (KYC, Audit log, Lưu trữ giao dịch)</li>
              <li>✅ <strong>Quản trị:</strong> Mô hình vận hành tinh gọn, tự động hóa cao, kiểm soát OPEX</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Cam kết trách nhiệm</h2>
            <p>Với vai trò người đứng đầu triển khai, ông Nguyễn Minh Triết cam kết:</p>
            <ul className="mt-2 space-y-1">
              <li>• Đảm bảo minh bạch dữ liệu với cơ quan quản lý; sẵn sàng cung cấp tài liệu kỹ thuật, audit trail</li>
              <li>• Cập nhật liên tục hành lang pháp lý TMĐT; điều chỉnh vận hành kịp thời</li>
              <li>• Ưu tiên bảo vệ quyền lợi người tiêu dùng và nhà bán hợp pháp</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Phân biệt vai trò và trách nhiệm pháp lý</h2>
            <ul>
              <li>
                <strong>{ACFMART_LEGAL_DISPLAY}:</strong> Chịu trách nhiệm pháp lý đối với hoạt động
                thương mại điện tử, dữ liệu người dùng, vận hành nền tảng và các chính sách công bố.
              </li>
              <li>
                <strong>IVS JSC:</strong> Cổ đông công nghệ và đối tác phát triển hệ thống, chịu trách nhiệm
                kỹ thuật trong phạm vi được ACFMart phân quyền.
              </li>
              <li>
                <strong>Công ty TNHH Đầu tư ACF:</strong> Cổ đông chiến lược, tham gia định hướng thương hiệu
                và giám sát sứ mệnh chống hàng giả theo cơ cấu sở hữu.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Cơ chế giải quyết tranh chấp</h2>
            <ul>
              <li>
                <strong>CSKH người tiêu dùng:</strong> Liên hệ ACFMart qua {ACFMART_HOTLINE} hoặc{" "}
                {ACFMART_SUPPORT_EMAIL} để được hỗ trợ về trải nghiệm mua sắm, đơn hàng, thanh toán.
              </li>
              <li>
                <strong>Khiếu nại pháp lý:</strong> Gửi trực tiếp đến Phòng Pháp chế của 
                {` ${ACFMART_LEGAL_DISPLAY} `}để giải quyết các vấn đề liên quan đến trách nhiệm pháp lý.
              </li>
              <li>
                <strong>Báo cáo hàng giả:</strong> Gửi qua kênh chuyên biệt của hệ thống 
                để tiến hành xác minh và xử lý hàng giả theo quy trình chuyên môn.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
