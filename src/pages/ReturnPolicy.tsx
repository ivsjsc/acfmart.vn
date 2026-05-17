import { Package, Clock, RotateCcw, Truck, Tag, Shield } from "lucide-react";
import { ACFMART_HEAD_OFFICE, ACFMART_HOTLINE, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile";

export default function ReturnPolicy() {
  return (
    <div className="container-acf py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-6 px-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Chính sách đổi trả</h1>
          <p className="text-emerald-100 mt-2">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Package className="text-emerald-600" size={24} />
              Điều kiện đổi trả
            </h2>
            <p>
              Quý khách có quyền đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng với các điều kiện sau:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sản phẩm còn nguyên tem mác, nhãn hiệu và chưa qua sử dụng</li>
              <li>Sản phẩm không bị hư hỏng do sử dụng sai hướng dẫn</li>
              <li>Sản phẩm còn trong thời gian bảo hành theo quy định của nhà sản xuất</li>
              <li>Đầy đủ phụ kiện đi kèm (nếu có) và bao bì ban đầu</li>
              <li>Có hóa đơn hoặc bằng chứng mua hàng từ ACFMart.vn</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="text-emerald-600" size={24} />
              Thời gian xử lý
            </h2>
            <p>Thời gian xử lý yêu cầu đổi trả:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Phê duyệt yêu cầu:</strong> Trong vòng 24 giờ làm việc kể từ khi nhận được yêu cầu</li>
              <li><strong>Nhận sản phẩm đổi trả:</strong> Trong vòng 2-3 ngày làm việc sau khi phê duyệt</li>
              <li><strong>Hoàn tiền:</strong> Trong vòng 3-5 ngày làm việc sau khi nhận lại sản phẩm</li>
              <li><strong>Đổi sản phẩm mới:</strong> Trong vòng 3-7 ngày làm việc tùy khu vực</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Truck className="text-emerald-600" size={24} />
              Quy trình đổi trả
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Khởi tạo yêu cầu đổi trả trên ứng dụng ACFMart hoặc gọi tổng đài {ACFMART_HOTLINE}</li>
              <li>Cung cấp thông tin đơn hàng, lý do đổi trả và hình ảnh sản phẩm (nếu cần)</li>
              <li>Nhân viên ACFMart sẽ xác nhận yêu cầu và hướng dẫn gửi sản phẩm</li>
              <li>Đóng gói sản phẩm cùng hóa đơn và gửi về trung tâm xử lý đổi trả</li>
              <li>Chúng tôi kiểm tra sản phẩm và xử lý theo yêu cầu (hoàn tiền hoặc đổi mới)</li>
            </ol>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Tag className="text-emerald-600" size={24} />
              Sản phẩm không áp dụng đổi trả
            </h2>
            <p>Các sản phẩm sau không nằm trong chính sách đổi trả:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sản phẩm nội y, đồ lót vì lý do vệ sinh</li>
              <li>Sản phẩm giảm giá sâu hơn 50% hoặc trong chương trình flash sale</li>
              <li>Sản phẩm bị hư hỏng do sử dụng sai hướng dẫn hoặc tác động ngoại lực</li>
              <li>Sản phẩm đặc biệt theo yêu cầu của khách hàng</li>
              <li>Thực phẩm, mỹ phẩm đã mở nắp hoặc qua sử dụng</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Shield className="text-emerald-600" size={24} />
              Chính sách hoàn tiền
            </h2>
            <p>Phương thức hoàn tiền:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hoàn tiền qua ví điện tử: Trong vòng 3-5 ngày làm việc</li>
              <li>Hoàn tiền qua tài khoản ngân hàng: Trong vòng 5-7 ngày làm việc</li>
              <li>Hoàn tiền qua hình thức khác theo thỏa thuận (nếu có)</li>
            </ul>
            <p className="mt-2">
              Lưu ý: Phí vận chuyển đổi trả sẽ được hoàn lại nếu lỗi thuộc về nhà bán hoặc sản phẩm không đúng mô tả.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <RotateCcw className="text-emerald-600" size={24} />
              Chính sách đặc biệt cho hàng giả
            </h2>
            <p>
              Nếu bạn phát hiện sản phẩm là hàng giả, hàng nhái trên nền tảng ACFMart, vui lòng báo cáo thông qua:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ứng dụng ACFMart - tính năng quét mã QR xác thực</li>
              <li>Tổng đài CSKH: {ACFMART_HOTLINE}</li>
              <li>Email: {ACFMART_SUPPORT_EMAIL}</li>
            </ul>
            <p className="mt-2">
              Chúng tôi cam kết hoàn tiền 100% và bồi thường theo quy định nếu sản phẩm được xác nhận là hàng giả.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h3 className="font-bold text-neutral-900">Liên hệ hỗ trợ</h3>
            <p className="mt-2">
              Mọi thắc mắc về chính sách đổi trả, vui lòng liên hệ:
              <br />
              <strong>Hotline:</strong> {ACFMART_HOTLINE} (8:00 - 21:00 hàng ngày)
              <br />
              <strong>Email:</strong> {ACFMART_SUPPORT_EMAIL}
              <br />
              <strong>Địa chỉ:</strong> {ACFMART_HEAD_OFFICE}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
