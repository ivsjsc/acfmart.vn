import { Link } from "react-router-dom"
import {
  ACFMART_HEAD_OFFICE,
  ACFMART_HOTLINE,
  ACFMART_LEGAL_DISPLAY,
  ACFMART_REPRESENTATIVE,
  ACFMART_SUPPORT_EMAIL,
  ACFMART_TAX_CODE,
} from "../lib/legal-profile"

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
            <h2 className="text-lg font-semibold">
              Pháp nhân sở hữu và vận hành: {ACFMART_LEGAL_DISPLAY}
            </h2>
            <p>
              ACFMart.vn, acfmart.store, acfmart.online và acfmart.cloud là các kênh dịch vụ của
              nền tảng ACFMart do <strong>{ACFMART_LEGAL_DISPLAY}</strong> sở hữu, phát triển và
              vận hành. Các tên miền này không phải pháp nhân độc lập.
            </p>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Tên pháp nhân hiển thị:</strong> {ACFMART_LEGAL_DISPLAY}</li>
              <li>• <strong>Mã số thuế:</strong> {ACFMART_TAX_CODE}</li>
              <li>• <strong>Trụ sở:</strong> {ACFMART_HEAD_OFFICE}</li>
              <li>• <strong>Đầu mối triển khai:</strong> {ACFMART_REPRESENTATIVE}</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Vai trò của nền tảng ACFMart</h2>
            <p>
              ACFMart là nền tảng thương mại điện tử định hướng chống hàng giả, kết nối người bán
              hợp pháp với người mua thông qua các công cụ xác thực, hồ sơ người bán, quản lý sản
              phẩm, đơn hàng và hỗ trợ sau bán hàng.
            </p>
            <ul className="mt-2 space-y-1">
              <li>• Xác thực QR và thông tin nguồn gốc sản phẩm theo quy trình được công bố.</li>
              <li>• Kiểm duyệt hồ sơ người bán, sản phẩm và nội dung bán hàng trước khi hiển thị.</li>
              <li>• Cung cấp công cụ vận hành, chăm sóc khách hàng và xử lý khiếu nại trên nền tảng.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Vai trò của IVS JSC</h2>
            <p>
              <strong>{ACFMART_LEGAL_DISPLAY}</strong> chịu trách nhiệm chính về hoạt động vận hành
              nền tảng, công nghệ, dữ liệu người dùng, chính sách công bố và các kênh hỗ trợ chính
              thức của ACFMart.
            </p>
            <ul className="mt-2 space-y-1">
              <li>• Sở hữu hoặc có quyền khai thác hợp pháp đối với mã nguồn, giao diện và quy trình nền tảng.</li>
              <li>• Tổ chức vận hành kỹ thuật, bảo mật, kiểm soát truy cập và lưu vết hệ thống.</li>
              <li>• Công bố, cập nhật và chịu trách nhiệm với các chính sách người mua, người bán và dữ liệu.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Định hướng chống hàng giả</h2>
            <p>
              ACFMart phối hợp với hệ sinh thái chống hàng giả và các bên chuyên môn để nâng cao
              độ tin cậy của sản phẩm trên môi trường số. Các bên đồng hành về chuyên môn, xác thực
              hoặc truyền thông không thay thế vai trò pháp nhân vận hành của{" "}
              <strong>{ACFMART_LEGAL_DISPLAY}</strong>.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold">Cam kết vận hành</h2>
            <ul className="mt-2 space-y-1">
              <li>• Công bố rõ ràng chính sách sử dụng, bảo mật dữ liệu, thanh toán, vận chuyển và đổi trả.</li>
              <li>• Không sử dụng số liệu tăng trưởng, doanh thu hoặc quy mô thị trường khi chưa có căn cứ công bố.</li>
              <li>• Ưu tiên bảo vệ quyền lợi người tiêu dùng, người bán hợp pháp và chủ thể quyền sở hữu trí tuệ.</li>
              <li>• Tiếp nhận báo cáo hàng giả, vi phạm chính sách hoặc khiếu nại vận hành qua kênh hỗ trợ chính thức.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Liên hệ và giải quyết tranh chấp</h2>
            <ul>
              <li>
                <strong>Hỗ trợ người dùng:</strong> Liên hệ ACFMart qua {ACFMART_HOTLINE} hoặc{" "}
                {ACFMART_SUPPORT_EMAIL} để được hỗ trợ về tài khoản, đơn hàng, thanh toán và đổi trả.
              </li>
              <li>
                <strong>Khiếu nại pháp lý:</strong> Gửi đến <strong>{ACFMART_LEGAL_DISPLAY}</strong>{" "}
                qua kênh hỗ trợ chính thức để được tiếp nhận, phân loại và xử lý theo quy định.
              </li>
              <li>
                <strong>Báo cáo hàng giả:</strong> Gửi thông tin sản phẩm, người bán và bằng chứng liên
                quan để ACFMart kiểm tra, xác minh và áp dụng biện pháp xử lý phù hợp.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
