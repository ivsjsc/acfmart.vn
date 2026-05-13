import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Clock, User, CreditCard, Lock, Globe, RotateCcw } from "lucide-react";

export default function PrivacyPolicy() {
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
            Chính sách Bảo Mật Dữ Liệu Cá Nhân
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sàn Thương Mại Điện Tử Chống Hàng Giả ACF
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Căn cứ pháp lý: Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân; Luật An ninh mạng 2018; Luật Giao dịch điện tử 2023; Nghị định 52/2013/NĐ-CP & 85/2021/NĐ-CP về thương mại điện tử.
          </p>

          <div className="prose prose-sm mt-8 max-w-none">
            <h2 className="text-lg font-bold text-neutral-900">I. ĐỊNH NGHĨA & PHẠM VI ÁP DỤNG</h2>
            <h3 className="text-md font-semibold text-neutral-800">1.1 Thuật ngữ quan trọng</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Thuật ngữ</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Định nghĩa</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Dữ liệu cá nhân</td>
                    <td className="px-4 py-3 text-sm">Thông tin dưới dạng ký hiệu, chữ viết, hình ảnh, âm thanh hoặc dạng điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể (theo NĐ 13/2023).</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Dữ liệu cá nhân nhạy cảm</td>
                    <td className="px-4 py-3 text-sm">Thông tin về quan điểm chính trị, tôn giáo, sức khỏe, đời sống tình dục, dữ liệu sinh trắc học, dữ liệu di truyền, dữ liệu về vị trí, dữ liệu tài chính.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Chủ thể dữ liệu</td>
                    <td className="px-4 py-3 text-sm">Cá nhân được xác định hoặc có thể xác định được thông qua dữ liệu cá nhân (Người mua, Người bán, Affiliate, nhân sự vận hành).</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Bên Kiểm soát & Xử lý dữ liệu</td>
                    <td className="px-4 py-3 text-sm">IVS JSC – đơn vị vận hành Sàn ACF, quyết định mục đích và phương tiện xử lý dữ liệu.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">II. MỤC ĐÍCH THU THẬP & XỬ LÝ DỮ LIỆU</h2>
            <p>
              ACF thu thập và xử lý dữ liệu cá nhân <strong>chỉ khi có sự đồng ý rõ ràng</strong> của Chủ thể dữ liệu, nhằm các mục đích hợp pháp sau:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mục đích</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Loại dữ liệu thu thập</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Căn cứ pháp lý</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Xác thực danh tính (KYC)</strong></td>
                    <td className="px-4 py-3 text-sm">Họ tên, CCCD/CMND, VNeID L2, khuôn mặt, số điện thoại, email</td>
                    <td className="px-4 py-3 text-sm">Điều 17 NĐ 13/2023; NĐ 52/2013 về TMĐT</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Vận hành giao dịch Escrow</strong></td>
                    <td className="px-4 py-3 text-sm">Thông tin tài khoản ngân hàng, lịch sử thanh toán, địa chỉ giao hàng</td>
                    <td className="px-4 py-3 text-sm">Hợp đồng điện tử; TT 40/2024/NHNN</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Cấp & xác thực mã QR ACF</strong></td>
                    <td className="px-4 py-3 text-sm">Dữ liệu sản phẩm, hành trình logistics, GPS timestamp, ảnh niêm phong</td>
                    <td className="px-4 py-3 text-sm">NĐ 98/2020 về quản lý hàng giả</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Hỗ trợ khiếu nại & giải quyết tranh chấp</strong></td>
                    <td className="px-4 py-3 text-sm">Ảnh/video bằng chứng, nội dung chat, log giao dịch, kết quả giám định</td>
                    <td className="px-4 py-3 text-sm">Luật Bảo vệ quyền lợi NTD 2023</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">III. LOẠI DỮ LIỆU THU THẬP</h2>
            <h3 className="text-md font-semibold text-neutral-800">3.1 Dữ liệu do Chủ thể cung cấp trực tiếp</h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Thông tin định danh:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Họ tên, ngày sinh, giới tính</li>
                <li>Số CCCD/CMND, mã số thuế (với seller/doanh nghiệp)</li>
                <li>Ảnh chân dung, video xác thực khuôn mặt (qua VNeID API)</li>
              </ul>
              
              <p className="font-medium mb-2 mt-3">Thông tin liên hệ & giao hàng:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Số điện thoại, email chính</li>
                <li>Địa chỉ thường trú, địa chỉ giao hàng (tỉnh/thành, quận/huyện, xã/phường, số nhà)</li>
              </ul>
              
              <p className="font-medium mb-2 mt-3">Thông tin tài chính:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Số tài khoản ngân hàng, tên ngân hàng, chi nhánh</li>
                <li>Lịch sử giao dịch Escrow (chỉ lưu mã tham chiếu, không lưu số thẻ đầy đủ)</li>
              </ul>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">IV. CƠ CHẾ ĐỒNG Ý & RÚT LẠI ĐỒNG Ý</h2>
            <p>
              <strong>Đồng ý rõ ràng (Explicit Consent):</strong> Mọi lần thu thập dữ liệu cá nhân đều được thực hiện sau khi Chủ thể dữ liệu <strong>chủ động tick checkbox</strong> hoặc <strong>nhấp nút xác nhận</strong> với nội dung rõ ràng về: loại dữ liệu, mục đích, thời gian lưu trữ, bên thứ ba tiếp cận.
            </p>
            
            <p className="mt-3">
              <strong>Quyền rút lại đồng ý:</strong> Chủ thể dữ liệu có quyền rút lại đồng ý bất kỳ lúc nào bằng cách:
            </p>
            <ul>
              <li>Vào <strong>Cài đặt tài khoản → Quyền riêng tư → Quản lý đồng ý</strong></li>
              <li>Gửi yêu cầu qua email <code>dpo@acfmart.vn</code> với tiêu đề "[RÚT ĐỒNG Ý] + [Số điện thoại/Email đăng ký]"</li>
              <li>Gọi hotline 1900 066 689 và yêu cầu kết nối bộ phận DPO</li>
            </ul>
            
            <p className="mt-3">
              <strong>Thời hạn xử lý:</strong> ACF cam kết xử lý yêu cầu rút đồng ý trong vòng <strong>07 ngày làm việc</strong>. Việc rút đồng ý không ảnh hưởng đến tính hợp pháp của hoạt động xử lý đã thực hiện trước thời điểm rút.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">V. CHIA SẺ & CHUYỂN GIAO DỮ LIỆU</h2>
            <p>
              ACF chỉ chia sẻ dữ liệu cá nhân với bên thứ ba khi: (1) Có sự đồng ý của Chủ thể; hoặc (2) Cần thiết để thực hiện dịch vụ đã cam kết; hoặc (3) Theo yêu cầu pháp luật.
            </p>
            
            <div className="overflow-x-auto mt-3">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Bên tiếp nhận</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Loại dữ liệu chia sẻ</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mục đích</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Biện pháp bảo vệ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Ngân hàng đối tác (Escrow)</strong></td>
                    <td className="px-4 py-3 text-sm">Họ tên, số TK, giá trị giao dịch, mã đơn hàng</td>
                    <td className="px-4 py-3 text-sm">Giữ tiền ký quỹ, giải ngân, đối soát</td>
                    <td className="px-4 py-3 text-sm">Hợp đồng bảo mật; mã hóa TLS 1.3; audit định kỳ</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Đơn vị vận chuyển (GHN/GHTK/Viettel Post)</strong></td>
                    <td className="px-4 py-3 text-sm">Tên, SĐT, địa chỉ giao hàng, ghi chú đơn</td>
                    <td className="px-4 py-3 text-sm">Giao nhận, cập nhật trạng thái logistics</td>
                    <td className="px-4 py-3 text-sm">API giới hạn scope; log truy cập; DPA ký kết</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Nhà cung cấp Cloud/AI</strong></td>
                    <td className="px-4 py-3 text-sm">Dữ liệu đã ẩn danh/mã hóa cho AI moderation, analytics</td>
                    <td className="px-4 py-3 text-sm">Kiểm duyệt nội dung, gợi ý sản phẩm</td>
                    <td className="px-4 py-3 text-sm">Data Processing Agreement; vùng lưu trữ Singapore/VN; encryption at rest</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">VIII. QUYỀN CỦA CHỦ THỂ DỮ LIỆU</h2>
            <p>
              Theo Điều 25–27 Nghị định 13/2023/NĐ-CP, Chủ thể dữ liệu có các quyền sau:
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Quyền</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cách thực hiện trên ACF</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Thời hạn phản hồi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Quyền được biết</strong></td>
                    <td className="px-4 py-3 text-sm">Xem "Trung tâm minh bạch" trong App: loại dữ liệu thu thập, mục đích, bên chia sẻ</td>
                    <td className="px-4 py-3 text-sm">Real-time</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Quyền truy cập</strong></td>
                    <td className="px-4 py-3 text-sm">Xuất bản sao dữ liệu cá nhân (machine-readable format: JSON/CSV) qua Setting</td>
                    <td className="px-4 py-3 text-sm">≤ 07 ngày làm việc</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Quyền chỉnh sửa</strong></td>
                    <td className="px-4 py-3 text-sm">Cập nhật thông tin cá nhân trực tiếp trong Profile; yêu cầu DPO hỗ trợ với dữ liệu hệ thống</td>
                    <td className="px-4 py-3 text-sm">≤ 03 ngày làm việc</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Quyền xóa</strong></td>
                    <td className="px-4 py-3 text-sm">Như Mục 7.2 (trong file gốc)</td>
                    <td className="px-4 py-3 text-sm">≤ 07 ngày làm việc</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm"><strong>Quyền khiếu nại</strong></td>
                    <td className="px-4 py-3 text-sm">Gửi khiếu nại đến DPO ACF → Cục Bảo vệ dữ liệu cá nhân → Tòa án</td>
                    <td className="px-4 py-3 text-sm">Theo luật định</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">X. CẬP NHẬT CHÍNH SÁCH & LIÊN HỆ</h2>
            <p>
              ACF có quyền điều chỉnh Chính sách Bảo mật này để phù hợp với thay đổi pháp luật, công nghệ hoặc mô hình kinh doanh. Mọi thay đổi sẽ được:
            </p>
            <ol className="mt-2">
              <li>Thông báo trước <strong>07 ngày</strong> qua email, in-app notification, và banner trên website</li>
              <li>Hiển thị rõ "Lịch sử phiên bản" với nội dung thay đổi, ngày hiệu lực</li>
              <li>Yêu cầu Người dùng xác nhận đồng ý lại với phiên bản mới tại lần đăng nhập tiếp theo (đối với thay đổi trọng yếu)</li>
            </ol>

            <h3 className="text-md font-semibold text-neutral-800 mt-4">Liên hệ & Khiếu nại</h3>
            <div className="overflow-x-auto mt-3">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mục đích</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kênh liên hệ</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Thời gian phản hồi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm">Hỏi đáp chung về bảo mật</td>
                    <td className="px-4 py-3 text-sm"><code>privacy@acfmart.vn</code></td>
                    <td className="px-4 py-3 text-sm">≤ 03 ngày làm việc</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Yêu cầu thực thi quyền (truy cập, xóa, chuyển dữ liệu)</td>
                    <td className="px-4 py-3 text-sm"><code>dpo@acfmart.vn</code></td>
                    <td className="px-4 py-3 text-sm">≤ 07 ngày làm việc</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm">Khiếu nại pháp lý về xử lý dữ liệu</td>
                    <td className="px-4 py-3 text-sm"><code>legal@acfmart.vn</code> + Hotline 1900 066 689</td>
                    <td className="px-4 py-3 text-sm">≤ 05 ngày làm việc</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}