import { Link } from "react-router-dom";

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
            <h2 className="text-lg font-semibold">Chủ sở hữu website: Công ty TNHH Đầu tư ACF</h2>
            <p>
              Là chủ sở hữu pháp lý của website ACFMart.vn, Công ty TNHH Đầu tư ACF chịu trách nhiệm 
              về nội dung, hoạt động thương mại và tuân thủ pháp luật trong quá trình vận hành sàn.
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              <strong>Vốn góp:</strong> 6 tỷ VNĐ tiền mặt.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Đơn vị vận hành kỹ thuật: IVS JSC</h2>
            <p>
              IVS JSC chịu trách nhiệm vận hành kỹ thuật, quản lý hệ thống công nghệ thông tin, 
              đảm bảo hoạt động ổn định và an toàn cho toàn bộ nền tảng ACFMart theo hợp đồng ủy 
              quyền số được ký kết giữa hai bên.
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              <strong>Đóng góp:</strong> Vốn công nghệ, sở hữu trí tuệ và nhân sự chủ chốt (bao gồm Giám đốc điều hành toàn thời gian). 
              IVS JSC cam kết bear chi phí nhân sự Phase 0–2 và đảm bảo hiệu quả năng lực tuyệt đối.
            </p>
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
                <strong>Chủ sở hữu (Công ty ACF):</strong> Chịu trách nhiệm pháp lý đối với hoạt động 
                thương mại điện tử, đảm bảo tuân thủ các quy định pháp luật về sàn giao dịch.
              </li>
              <li>
                <strong>Đơn vị vận hành kỹ thuật (IVS JSC):</strong> Chịu trách nhiệm kỹ thuật, đảm bảo 
                hệ thống hoạt động ổn định, bảo mật và hiệu quả.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Cơ chế giải quyết tranh chấp</h2>
            <ul>
              <li>
                <strong>CSKH người tiêu dùng:</strong> Liên hệ với IVS JSC qua hotline/email CSKH 
                để được hỗ trợ các vấn đề về trải nghiệm mua sắm, đơn hàng, thanh toán.
              </li>
              <li>
                <strong>Khiếu nại pháp lý:</strong> Gửi trực tiếp đến Phòng Pháp chế của 
                Công ty TNHH Đầu tư ACF để giải quyết các vấn đề liên quan đến trách nhiệm pháp lý.
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