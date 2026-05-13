import { Link } from "react-router-dom"
import { ArrowLeft, Shield, Database, Lock, Eye, Trash2, Globe, Bell } from "lucide-react"

export function DataProtectionPolicyPage() {
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
          Chính sách Bảo vệ Dữ liệu Cá nhân (PDPD)
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Cập nhật lần cuối: 14/05/2026 · Căn cứ Nghị định 13/2023/NĐ-CP, Luật An ninh mạng 2018
        </p>

        <div className="prose prose-sm mt-6 max-w-none">
          <div className="not-prose my-4 rounded-xl bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-blue-600" size={20} />
              <p className="font-bold text-sm text-blue-900">Cam kết của ACFMart</p>
            </div>
            <p className="text-xs text-blue-800">
              ACFMart cam kết bảo vệ dữ liệu cá nhân của Người dùng theo đúng quy định tại
              Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân (PDPD). Chúng tôi đã bổ nhiệm
              Nhân viên bảo vệ dữ liệu (DPO) và thực hiện Đánh giá tác động (DPIA) định kỳ.
            </p>
          </div>

          <h2>1. Bên kiểm soát dữ liệu</h2>
          <p>
            <strong>Công ty TNHH IVS JSC</strong> là bên kiểm soát dữ liệu cá nhân trên nền tảng ACFMart.
            Liên hệ DPO: <strong>dpo@acfmart.vn</strong>.
          </p>

          <h2>2. Dữ liệu cá nhân được thu thập</h2>
          <h3>2.1. Dữ liệu cơ bản</h3>
          <ul>
            <li>Họ và tên, ngày sinh, giới tính.</li>
            <li>Địa chỉ email, số điện thoại.</li>
            <li>Địa chỉ nhận hàng / địa chỉ đăng ký kinh doanh.</li>
            <li>Tên đăng nhập, mật khẩu (mã hoá).</li>
          </ul>
          <h3>2.2. Dữ liệu nhạy cảm (Người bán)</h3>
          <ul>
            <li>Số CCCD/CMND, ảnh chụp 2 mặt CCCD.</li>
            <li>Mã số thuế, giấy phép kinh doanh.</li>
            <li>Thông tin tài khoản ngân hàng.</li>
          </ul>
          <h3>2.3. Dữ liệu kỹ thuật</h3>
          <ul>
            <li>Địa chỉ IP (đã hash), User Agent, loại thiết bị.</li>
            <li>Cookie và dữ liệu phiên làm việc.</li>
            <li>Lịch sử duyệt web, tương tác trên Sàn.</li>
          </ul>

          <h2>3. Mục đích xử lý dữ liệu</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Mục đích</th>
                  <th>Cơ sở pháp lý</th>
                  <th>Dữ liệu sử dụng</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tạo và quản lý tài khoản</td>
                  <td>Hợp đồng</td>
                  <td>Email, SĐT, tên</td>
                </tr>
                <tr>
                  <td>Xử lý đơn hàng & giao hàng</td>
                  <td>Hợp đồng</td>
                  <td>Địa chỉ, SĐT, tên</td>
                </tr>
                <tr>
                  <td>Xác minh danh tính (KYC)</td>
                  <td>Nghĩa vụ pháp lý (NĐ 85/2021)</td>
                  <td>CCCD, GPKD, MST</td>
                </tr>
                <tr>
                  <td>Thanh toán & kế toán</td>
                  <td>Hợp đồng + Nghĩa vụ pháp lý</td>
                  <td>Thông tin ngân hàng</td>
                </tr>
                <tr>
                  <td>Chống gian lận</td>
                  <td>Lợi ích hợp pháp</td>
                  <td>IP, thiết bị, hành vi</td>
                </tr>
                <tr>
                  <td>Tiếp thị (khi đồng ý)</td>
                  <td>Đồng ý</td>
                  <td>Email, SĐT</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>4. Đồng ý (Consent)</h2>
          <p>
            Theo Điều 11 Nghị định 13/2023/NĐ-CP, Người dùng được thông báo rõ ràng về mục đích
            thu thập dữ liệu và có quyền:
          </p>
          <ul>
            <li><strong>Đồng ý cụ thể:</strong> Chọn từng mục đích (đặt hàng, tiếp thị, phân tích).</li>
            <li><strong>Rút lại đồng ý:</strong> Bất cứ lúc nào tại Cài đặt tài khoản → Quyền riêng tư.</li>
            <li><strong>Từ chối:</strong> Không ảnh hưởng đến dịch vụ cốt lõi (trừ dữ liệu bắt buộc cho giao dịch).</li>
          </ul>

          <h2>5. Quyền của chủ thể dữ liệu</h2>
          <p>Theo Điều 9 Nghị định 13/2023/NĐ-CP, Người dùng có các quyền sau:</p>
          <div className="not-prose my-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
              <Eye className="text-brand-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs">Quyền truy cập</p>
                <p className="text-xs text-neutral-600">Xem dữ liệu cá nhân đang được xử lý.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
              <Database className="text-brand-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs">Quyền chỉnh sửa</p>
                <p className="text-xs text-neutral-600">Cập nhật thông tin không chính xác.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
              <Trash2 className="text-brand-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs">Quyền xoá</p>
                <p className="text-xs text-neutral-600">Yêu cầu xoá dữ liệu (trừ nghĩa vụ lưu trữ pháp lý).</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
              <Globe className="text-brand-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs">Quyền di chuyển</p>
                <p className="text-xs text-neutral-600">Xuất dữ liệu ở định dạng có cấu trúc.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
              <Lock className="text-brand-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs">Quyền hạn chế</p>
                <p className="text-xs text-neutral-600">Yêu cầu ngừng xử lý cho mục đích cụ thể.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
              <Bell className="text-brand-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs">Quyền phản đối</p>
                <p className="text-xs text-neutral-600">Phản đối xử lý tự động, profiling.</p>
              </div>
            </div>
          </div>
          <p>
            Thực hiện quyền: Cài đặt tài khoản → Quyền riêng tư, hoặc email <strong>dpo@acfmart.vn</strong>.
            Thời gian xử lý: 15 ngày làm việc.
          </p>

          <h2>6. Lưu trữ & Thời hạn</h2>
          <ul>
            <li><strong>Dữ liệu giao dịch:</strong> Lưu 5 năm (theo yêu cầu thuế/kế toán).</li>
            <li><strong>Audit log:</strong> Lưu tối thiểu 24 tháng (NĐ 85/2021).</li>
            <li><strong>Dữ liệu KYC:</strong> Lưu 3 năm sau khi chấm dứt tài khoản.</li>
            <li><strong>Dữ liệu marketing:</strong> Xoá ngay khi rút đồng ý.</li>
            <li><strong>Dữ liệu kỹ thuật:</strong> Anonymize sau 90 ngày.</li>
          </ul>
          <p>Sau thời hạn lưu trữ, dữ liệu được xoá an toàn hoặc ẩn danh hoá.</p>

          <h2>7. Bảo mật dữ liệu</h2>
          <ul>
            <li>Mã hoá truyền tải: TLS 1.3 cho tất cả kết nối.</li>
            <li>Mã hoá lưu trữ: AES-256 cho dữ liệu nhạy cảm.</li>
            <li>Kiểm soát truy cập: RBAC (Role-Based Access Control).</li>
            <li>Kiểm tra bảo mật: Penetration testing hàng quý.</li>
            <li>Immutable audit logs: Nhật ký không thể sửa/xoá.</li>
            <li>Lưu trữ dữ liệu tại Việt Nam theo Điều 15 NĐ 13/2023.</li>
          </ul>

          <h2>8. Chia sẻ dữ liệu với bên thứ ba</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Bên thứ ba</th>
                  <th>Mục đích</th>
                  <th>Dữ liệu chia sẻ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Đối tác vận chuyển (GHN, GHTK, J&T)</td>
                  <td>Giao hàng</td>
                  <td>Tên, SĐT, địa chỉ nhận</td>
                </tr>
                <tr>
                  <td>Cổng thanh toán (VNPay, MoMo)</td>
                  <td>Xử lý thanh toán</td>
                  <td>Thông tin giao dịch</td>
                </tr>
                <tr>
                  <td>Cơ quan nhà nước</td>
                  <td>Nghĩa vụ pháp lý</td>
                  <td>Theo yêu cầu bằng văn bản</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            ACFMart <strong>không bán</strong> dữ liệu cá nhân cho bên thứ ba. Không chia sẻ
            dữ liệu xuyên biên giới trừ khi được sự đồng ý rõ ràng.
          </p>

          <h2>9. Thông báo vi phạm dữ liệu</h2>
          <p>
            Trong trường hợp xảy ra sự cố rò rỉ dữ liệu, ACFMart cam kết:
          </p>
          <ul>
            <li>Thông báo cho cơ quan có thẩm quyền trong vòng <strong>72 giờ</strong>.</li>
            <li>Thông báo cho chủ thể dữ liệu bị ảnh hưởng không chậm trễ.</li>
            <li>Triển khai biện pháp khắc phục ngay lập tức.</li>
            <li>Công bố báo cáo post-mortem trong 30 ngày.</li>
          </ul>

          <h2>10. Cookie & Tracking</h2>
          <p>
            ACFMart sử dụng cookie cho các mục đích:
          </p>
          <ul>
            <li><strong>Cookie bắt buộc:</strong> Đăng nhập, giỏ hàng, bảo mật (không cần đồng ý).</li>
            <li><strong>Cookie phân tích:</strong> Thống kê truy cập (cần đồng ý).</li>
            <li><strong>Cookie tiếp thị:</strong> Quảng cáo cá nhân hoá (cần đồng ý).</li>
          </ul>
          <p>Quản lý cookie tại: Cài đặt tài khoản → Quyền riêng tư → Cookie.</p>

          <h2>11. Cập nhật chính sách</h2>
          <p>
            Chính sách này có thể được cập nhật để phản ánh thay đổi pháp luật hoặc quy trình
            xử lý dữ liệu. Thay đổi quan trọng sẽ được thông báo qua email và hiển thị trên Sàn.
            Phiên bản trước được lưu trữ và có thể truy cập theo yêu cầu.
          </p>

          <h2>12. Liên hệ</h2>
          <p>
            <strong>Nhân viên Bảo vệ dữ liệu (DPO):</strong><br />
            Email: <strong>dpo@acfmart.vn</strong><br />
            Địa chỉ: Văn phòng ACFMart, Việt Nam<br /><br />
            Chi tiết chính sách bảo mật theo vai trò:{" "}
            <Link to="/legal/privacy/buyer" className="text-brand-red-600 underline">Người mua</Link>{" | "}
            <Link to="/legal/privacy/seller" className="text-brand-red-600 underline">Người bán</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
