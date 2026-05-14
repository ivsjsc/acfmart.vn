import { Link } from "react-router-dom"
import { ArrowLeft, Shield, Search, QrCode, AlertTriangle, CheckCircle } from "lucide-react"

export function AntiCounterfeitPage() {
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

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-red-600 to-brand-red-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={32} />
            <h1 className="text-2xl font-bold">Chương trình Chống hàng giả ACFMart</h1>
          </div>
          <p className="text-brand-red-100">
            100% sản phẩm trên ACFMart được xác thực nguồn gốc bởi Quỹ Chống Hàng Giả Việt Nam (ACF).
          </p>
        </div>

        <div className="prose prose-sm max-w-none">
          <h2>1. Cam kết của ACFMart</h2>
          <p>
            ACFMart là sàn TMĐT duy nhất tại Việt Nam tích hợp hệ thống xác minh nguồn gốc sản phẩm
            do Quỹ Chống Hàng Giả Việt Nam (ACF) cung cấp. Chúng tôi cam kết:
          </p>
          <ul>
            <li><strong>100% Người bán</strong> phải qua quy trình xác minh KYC trước khi được bán hàng.</li>
            <li><strong>100% sản phẩm</strong> phải có nguồn gốc xuất xứ rõ ràng, chứng từ nhập khẩu hoặc hoá đơn sản xuất.</li>
            <li><strong>Tem QR ACF</strong> được dán trên sản phẩm thuộc ngành hàng nhạy cảm (mỹ phẩm, TPCN, điện tử).</li>
            <li><strong>Đền gấp đôi</strong> nếu phát hiện hàng giả lọt sàn.</li>
          </ul>

          <h2>2. Hệ thống xác thực QR Code</h2>
          <div className="not-prose my-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
              <QrCode className="mx-auto mb-2 text-brand-red-600" size={32} />
              <p className="font-bold text-sm">Bước 1</p>
              <p className="text-xs text-neutral-600">Quét mã QR trên sản phẩm</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
              <Search className="mx-auto mb-2 text-brand-red-600" size={32} />
              <p className="font-bold text-sm">Bước 2</p>
              <p className="text-xs text-neutral-600">Hệ thống tra cứu cơ sở dữ liệu ACF</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
              <CheckCircle className="mx-auto mb-2 text-brand-red-600" size={32} />
              <p className="font-bold text-sm">Bước 3</p>
              <p className="text-xs text-neutral-600">Hiển thị kết quả xác thực</p>
            </div>
          </div>
          <p>
            Người mua có thể xác thực sản phẩm tại{" "}
            <Link to="/qr-verify" className="text-brand-red-600 underline">
              Xác thực QR
            </Link>{" "}
            hoặc quét mã QR trực tiếp bằng camera điện thoại.
          </p>

          <h2>3. Quy trình kiểm duyệt Người bán</h2>
          <ol>
            <li><strong>Xác minh danh tính (KYC):</strong> CCCD/CMND, Giấy phép kinh doanh, MST.</li>
            <li><strong>Xác minh sản phẩm:</strong> Chứng từ nguồn gốc, hoá đơn nhập, giấy phép (nếu ngành đặc thù).</li>
            <li><strong>Kiểm tra liên tục:</strong> AI moderation quét sản phẩm mới, báo cáo bất thường.</li>
            <li><strong>Kiểm định đột xuất:</strong> Random audit 10% sản phẩm hàng tháng bởi đội ngũ ACF.</li>
          </ol>

          <h2>4. Phân loại ngành hàng theo mức độ kiểm duyệt</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Mức độ</th>
                  <th>Ngành hàng</th>
                  <th>Yêu cầu</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-red-600">Cao</td>
                  <td>Mỹ phẩm, TPCN, Dược phẩm, Thực phẩm</td>
                  <td>Giấy phép ATTP, Công bố mỹ phẩm, Tem QR bắt buộc</td>
                </tr>
                <tr>
                  <td className="font-bold text-orange-600">Trung bình</td>
                  <td>Điện tử, Thời trang thương hiệu, Phụ kiện</td>
                  <td>Hoá đơn nhập khẩu/sản xuất, Uỷ quyền thương hiệu</td>
                </tr>
                <tr>
                  <td className="font-bold text-green-600">Tiêu chuẩn</td>
                  <td>Gia dụng, Sách, Văn phòng phẩm</td>
                  <td>Nguồn gốc xuất xứ, Ghi nhãn đúng NĐ 43/2017</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>5. Báo cáo hàng giả</h2>
          <p>
            Nếu nghi ngờ sản phẩm là hàng giả, Người mua có thể:
          </p>
          <ul>
            <li>
              <Link to="/report-counterfeit" className="text-brand-red-600 underline">
                Báo cáo hàng giả trực tuyến
              </Link>{" "}
              kèm bằng chứng (ảnh, video, kết quả quét QR).
            </li>
            <li>Liên hệ Hotline: <strong>1900-xxxx</strong> (bộ phận Chống hàng giả).</li>
            <li>Gửi email: <strong>support@acfmart.vn</strong>.</li>
          </ul>

          <h2>6. Xử lý vi phạm</h2>
          <div className="not-prose my-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-sm">Vi phạm lần 1</p>
                <p className="text-xs text-neutral-600">Cảnh cáo + gỡ sản phẩm + phạt tiền (nếu áp dụng).</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-sm">Vi phạm lần 2</p>
                <p className="text-xs text-neutral-600">Tạm khoá shop 30 ngày + giữ toàn bộ doanh thu chờ xử lý.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-sm">Vi phạm lần 3</p>
                <p className="text-xs text-neutral-600">Khoá vĩnh viễn + chuyển hồ sơ cho cơ quan chức năng theo NĐ 98/2020/NĐ-CP.</p>
              </div>
            </div>
          </div>

          <h2>7. Cơ sở pháp lý</h2>
          <ul>
            <li>Nghị định 98/2020/NĐ-CP — Xử phạt vi phạm hành chính về buôn bán hàng giả.</li>
            <li>Nghị định 43/2017/NĐ-CP — Ghi nhãn hàng hoá.</li>
            <li>Nghị định 52/2013/NĐ-CP & 85/2021/NĐ-CP — Quy định TMĐT.</li>
            <li>Luật Bảo vệ quyền lợi Người tiêu dùng 2023.</li>
          </ul>

          <h2>8. Liên hệ bộ phận Chống hàng giả</h2>
          <p>
            Email: <strong>support@acfmart.vn</strong><br />
            Hotline: <strong>1900-xxxx</strong> (nhấn phím 3)<br />
            Quỹ Chống Hàng Giả Việt Nam:{" "}
            <a href="https://acf.org.vn" target="_blank" rel="noopener noreferrer" className="text-brand-red-600 underline">
              acf.org.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
