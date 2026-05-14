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
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Đơn vị vận hành kỹ thuật: IVS JSC</h2>
            <p>
              IVS JSC chịu trách nhiệm vận hành kỹ thuật, quản lý hệ thống công nghệ thông tin, 
              đảm bảo hoạt động ổn định và an toàn cho toàn bộ nền tảng ACFMart theo hợp đồng ủy 
              quyền số được ký kết giữa hai bên.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Bảo trợ chuyên môn: Quỹ & Trung tâm Kỹ thuật Chống Hàng Giả ACF</h2>
            <p>
              Đơn vị chuyên môn cung cấp công nghệ xác thực, kiểm tra và xác minh nguồn gốc sản phẩm, 
              đảm bảo tính xác thực của các mặt hàng trên sàn giao dịch. Trung tâm Kỹ thuật ACF cũng 
              là đầu mối tiếp nhận các báo cáo hàng giả từ người tiêu dùng.
            </p>
          </section>

          <section className="mb-6">
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
              <li>
                <strong>Trung tâm Kỹ thuật ACF:</strong> Chịu trách nhiệm về công nghệ xác thực, xác 
                minh nguồn gốc sản phẩm và xử lý các trường hợp hàng giả.
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
                <strong>Báo cáo hàng giả:</strong> Gửi qua kênh chuyên biệt của Trung tâm Kỹ thuật ACF 
                để tiến hành xác minh và xử lý hàng giả theo quy trình chuyên môn.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}