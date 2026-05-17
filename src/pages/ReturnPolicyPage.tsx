import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ACFMART_LEGAL_DISPLAY, ACFMART_SUPPORT_EMAIL } from "../lib/legal-profile";

export function ReturnPolicyPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600"
        >
          <ArrowLeft size={12} />
          Về trang chủ
        </Link>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-900">
            Chính sách Đổi trả & Hoàn tiền
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sàn TMĐT ACFMart - {ACFMART_LEGAL_DISPLAY}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Hiệu lực: Áp dụng cho mọi giao dịch phát sinh trên hệ thống ACF kể từ ngày công bố
          </p>

          <div className="prose prose-sm mt-8 max-w-none">
            <h2 className="text-lg font-bold text-neutral-900">I. CĂN CỨ PHÁP LÝ</h2>
            <p>
              Chính sách này được xây dựng dựa trên:
            </p>
            <ul>
              <li>Luật Bảo vệ quyền lợi người tiêu dùng 2023 (Điều 28, 29, 30): Quyền đổi trả hàng mua trực tuyến, nghĩa vụ hoàn tiền, chi phí vận chuyển.</li>
              <li>Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP: Quy định công khai chính sách đổi trả trên sàn TMĐT.</li>
              <li>Nghị định 98/2020/NĐ-CP: Cơ chế xử lý hàng giả, trách nhiệm sàn trong bảo vệ người tiêu dùng.</li>
              <li>Quy chế hoạt động Sàn ACF & Hợp đồng Người bán: Phân định trách nhiệm, cơ chế Escrow, chế tài vi phạm.</li>
            </ul>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">II. THỜI HẠN & PHẠM VI ÁP DỤNG</h2>
            <p>
              Các trường hợp đổi trả và thời hạn áp dụng:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Trường hợp</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Thời hạn áp dụng</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ghi chú pháp lý</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm">Đổi trả không cần lý do</td>
                    <td className="px-4 py-3 text-sm">07 ngày kể từ ngày nhận hàng</td>
                    <td className="px-4 py-3 text-sm">Áp dụng theo Điều 28 Luật BVQLNTD 2023. Người mua chịu phí vận chuyển chiều về.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Lỗi kỹ thuật / Sai mô tả / Giao nhầm</td>
                    <td className="px-4 py-3 text-sm">15 ngày kể từ ngày nhận hàng</td>
                    <td className="px-4 py-3 text-sm">Người bán chịu 100% phí vận chuyển 2 chiều.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Phát hiện hàng giả / Nhái / Sai nguồn gốc</td>
                    <td className="px-4 py-3 text-sm">Không giới hạn thời gian</td>
                    <td className="px-4 py-3 text-sm">Áp dụng cơ chế bồi thường 200% đặc thù ACF.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Đổi ý cá nhân (còn nguyên seal)</td>
                    <td className="px-4 py-3 text-sm">07–15 ngày tùy ngành hàng</td>
                    <td className="px-4 py-3 text-sm">Sản phẩm phải chưa qua sử dụng, còn đầy đủ tem nhãn, phụ kiện gốc.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">III. ĐIỀU KIỆN ĐỔI TRẢ HỢP LỆ</h2>
            <p>Người mua được yêu cầu đổi/trả khi đáp ứng đủ các tiêu chí:</p>
            <ul>
              <li>✅ Sản phẩm còn nguyên tem, nhãn mác, bao bì gốc, phụ kiện đi kèm.</li>
              <li>✅ Chưa qua sử dụng, chưa cắt mác, chưa làm mất tính chất thương mại.</li>
              <li>✅ Có bằng chứng rõ ràng: ảnh/video lỗi, kết quả quét QR ACF bất thường, hoặc hóa đơn/chứng từ không khớp.</li>
              <li>✅ Yêu cầu được tạo trên App/Website hoặc gọi 1900 066 689 trong thời hạn quy định.</li>
              <li>✅ Không thuộc danh mục ngoại lệ tại Mục II.</li>
            </ul>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">IV. QUY TRÌNH ĐỔI TRẢ & HOÀN TIỀN (5 BƯỚC)</h2>
            <p>Sơ đồ quy trình:</p>
            <ol>
              <li>Người mua tạo yêu cầu → Hệ thống giữ tiền Escrow</li>
              <li>Seller xác nhận / Từ chối có lý do</li>
              <li>Nếu đồng ý hoặc không phản hồi sau 48h → ACF Moderator xác minh</li>
              <li>Kết luận: Hợp lệ → Cấp mã trả hàng → ĐVVC đến lấy; Không hợp lệ → Từ chối có giải thích</li>
              <li>Seller nhận hàng kiểm tra (03 ngày) → Xác nhận hoàn tất → Escrow giải ngân hoàn tiền 3-5 ngày</li>
            </ol>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">V. CHÍNH SÁCH ĐẶC BIỆT: CHỐNG HÀNG GIẢ & BỒI THƯỜNG 200%</h2>
            <p>Cam kết riêng của ACF – Vượt mức yêu cầu pháp lý</p>
            <ol>
              <li>Xác minh độc lập: Quét mã QR ACF → Đối chiếu ledger Blockchain → Giám định bởi Trung tâm Kỹ thuật Chống hàng giả ACF.</li>
              <li>Hoàn tiền 100%: Giải ngân toàn bộ giá trị đơn hàng qua Escrow.</li>
              <li>Bồi thường thêm 100%: Trích từ 'Quỹ Bảo vệ Người tiêu dùng ACF', tổng nhận lại = 200% giá trị đơn hàng.</li>
              <li>Hỗ trợ pháp lý: ACF cử luật sư hỗ trợ miễn phí nếu phát sinh thiệt hại sức khỏe, tài phẩm hoặc chi phí giám định ngoài.</li>
              <li>Chế tài Seller: Khóa vĩnh viễn gian hàng, thu hồi toàn bộ hoa hồng chưa giải ngân, chuyển hồ sơ cho QLTT/Công an, đưa vào danh sách đen liên sàn.</li>
            </ol>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">KÊNH HỖ TRỢ & GIẢI ĐÁP</h2>
            <ul>
              <li>Hotline đổi trả & Khiếu nại: 1900 066 689</li>
              <li>Email chuyên trách: {ACFMART_SUPPORT_EMAIL}</li>
              <li>DPO & Pháp lý: dpo@acfmart.vn</li>
              <li>Tra cứu trạng thái đơn hoàn: https://acfmart.vn/tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
