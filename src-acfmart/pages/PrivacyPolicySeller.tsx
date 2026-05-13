import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServiceSeller() {
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
            Điều khoản Dịch vụ Dành Cho Người Bán
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sàn Thương Mại Điện Tử Chống Hàng Giả ACF
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Hiệu lực: Kể từ ngày Người bán nhấp chọn "Tôi đồng ý" trong Seller Center hoặc thực hiện niêm yết sản phẩm đầu tiên trên hệ thống ACF.
          </p>

          <div className="prose prose-sm mt-8 max-w-none">
            <h2 className="text-lg font-bold text-neutral-900">I. ĐỊNH NGHĨA & GIẢI THÍCH TỪ NGỮ</h2>
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
                    <td className="px-4 py-3 text-sm font-medium">Sàn ACF</td>
                    <td className="px-4 py-3 text-sm">Nền tảng TMĐT chuyên biệt chống hàng giả, vận hành bởi <strong>IVS JSC</strong>, tích hợp 3 trụ cột: Marketplace – Logistics – Escrow.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Người bán (Seller)</td>
                    <td className="px-4 py-3 text-sm">Thương nhân/tổ chức/cá nhân đã hoàn tất xác thực VNeID Mức 2, ký hợp đồng điện tử và niêm yết hàng hóa trên Sàn ACF.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Seller Pro/Mall</td>
                    <td className="px-4 py-3 text-sm">Phân hạng Người bán đạt tiêu chuẩn cao: có thương hiệu, giấy phép phân phối chính hãng, cam kết tỷ lệ hàng giả &lt;0.1%.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Mã QR ACF</td>
                    <td className="px-4 py-3 text-sm">Mã định danh duy nhất do hệ thống ACF cấp, gắn với từng SKU, cho phép truy xuất nguồn gốc và xác minh tính chính hãng qua Blockchain.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Cơ chế Escrow</td>
                    <td className="px-4 py-3 text-sm">Phương thức thanh toán ký quỹ: tiền của Người mua được giữ tại tài khoản ngân hàng đối tác (được NHNN cấp phép), chỉ giải ngân cho Người bán khi Người mua xác nhận "Đã nhận đúng hàng".</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">QR Checkpoint</td>
                    <td className="px-4 py-3 text-sm">Quy trình 5 bước quét mã bắt buộc trong hành trình logistics: (1) Xuất kho → (2) Pickup → (3) Kiểm định Hub → (4) Giao hàng → (5) Xác nhận bởi Buyer.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">II. PHẠM VI ÁP DỤNG & CHẤP THUẬN</h2>
            <ol>
              <li>Điều khoản này điều chỉnh quyền, nghĩa vụ của Người bán khi: đăng ký tài khoản, niêm yết sản phẩm, xử lý đơn hàng, tham gia chương trình khuyến mãi/affiliate, và giải quyết khiếu nại trên Sàn ACF.</li>
              <li>Việc hoàn tất đăng ký Seller Center, tải lên giấy phép kinh doanh, hoặc nhấp nút "Đăng sản phẩm" được xem là sự <strong>chấp thuận đầy đủ và không điều kiện</strong> đối với bản Điều khoản này, theo đúng quy định về hợp đồng điện tử tại Luật Giao dịch điện tử 2023.</li>
              <li>Sàn ACF có quyền sửa đổi Điều khoản này. Thay đổi sẽ được thông báo trước <strong>15 ngày</strong> qua email đăng ký và thông báo trong Seller Center. Việc tiếp tục sử dụng dịch vụ sau thời hạn thông báo được xem là đồng ý với phiên bản mới.</li>
            </ol>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">III. ĐĂNG KÝ TÀI KHOẢN & XÁC THỰC DANH TÍNH</h2>
            <h3 className="text-md font-semibold text-neutral-800">3.1 Điều kiện đăng ký</h3>
            <ul>
              <li><strong>Cá nhân kinh doanh</strong>: Từ 18 tuổi trở lên, có CCCD/CMND hợp lệ, đã xác thực VNeID Mức 2.</li>
              <li><strong>Tổ chức/Doanh nghiệp</strong>: Có Giấy phép đăng ký kinh doanh còn hiệu lực, người đại diện pháp luật đã xác thực VNeID Mức 2.</li>
              <li><strong>Ngành hàng đặc thù</strong> (dược mỹ phẩm, TPCN, thiết bị y tế, hàng hiệu): Phải cung cấp thêm giấy chứng nhận lưu hành, giấy ủy quyền phân phối, hoặc chứng từ nhập khẩu hợp pháp.</li>
            </ul>

            <h3 className="text-md font-semibold text-neutral-800 mt-4">3.2 Quy trình xác thực 3 lớp (ACF Verification Standard)</h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Lớp 1: Xác thực danh tính điện tử</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>VNeID L2 API integration</li>
                <li>So khớp khuôn mặt + CCCD</li>
                <li>Kết quả: &lt; 5 phút</li>
              </ul>
              
              <p className="font-medium mb-2 mt-3">Lớp 2: Xác thực pháp lý</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>OCR giấy phép kinh doanh + chữ ký số</li>
                <li>Kiểm tra mã số thuế trên hệ thống Tổng cục Thuế</li>
                <li>Kết quả: 24–48 giờ làm việc</li>
              </ul>
              
              <p className="font-medium mb-2 mt-3">Lớp 3: Audit ngẫu nhiên (Random Audit)</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Phỏng vấn video với đại diện seller</li>
                <li>Yêu cầu mẫu sản phẩm + chứng từ nguồn gốc</li>
                <li>Tần suất: 10–20% seller mới, 2–5% seller hiện hữu</li>
              </ul>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">IV. NIÊM YẾT SẢN PHẨM & KIỂM DUYỆT NỘI DUNG</h2>
            <h3 className="text-md font-semibold text-neutral-800">4.1 Yêu cầu bắt buộc khi đăng sản phẩm</h3>
            <ul>
              <li>✅ <strong>Thông tin sản phẩm</strong>: Tên, mô tả, thông số kỹ thuật, hình ảnh/video thực tế, giá niêm yết (đã bao gồm VAT nếu áp dụng).</li>
              <li>✅ <strong>Chứng từ nguồn gốc</strong>: Hóa đơn nhập khẩu, giấy ủy quyền phân phối, công bố chất lượng (tùy ngành hàng).</li>
              <li>✅ <strong>Phân loại ngành hàng</strong>: Chọn đúng danh mục để áp dụng chính sách hoa hồng, logistics và kiểm duyệt phù hợp.</li>
              <li>✅ <strong>Cam kết chống hàng giả</strong>: Tick xác nhận "Sản phẩm này là chính hãng, đúng mô tả, sẵn sàng chịu chế tài nếu vi phạm".</li>
            </ul>

            <h3 className="text-md font-semibold text-neutral-800 mt-4">4.3 Hành vi bị nghiêm cấm khi niêm yết</h3>
            <ul>
              <li>❌ Đăng sản phẩm giả, nhái, không rõ nguồn gốc, hoặc vi phạm sở hữu trí tuệ.</li>
              <li>❌ Sử dụng hình ảnh/logo thương hiệu khi không có ủy quyền hợp pháp.</li>
              <li>❌ Mô tả sai công dụng, thổi phồng hiệu quả (đặc biệt với ngành sức khỏe, mỹ phẩm).</li>
              <li>❌ Đăng cùng 1 SKU với nhiều mức giá khác nhau để thao túng thuật toán.</li>
              <li>❌ Tạo sản phẩm "ảo" để hút traffic, không có khả năng giao hàng.</li>
            </ul>
            <p className="mt-2"><strong>Chế tài</strong>: Vi phạm lần 1 → Cảnh báo + gỡ sản phẩm; Lần 2 → Khóa gian hàng 7–30 ngày + phạt 10–50% doanh thu đơn vi phạm; Lần 3 → Khóa vĩnh viễn + chuyển hồ sơ cho QLTT/Công an.</p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">V. GIÁ CẢ, HOA HỒNG AFFILIATE & THANH TOÁN ESCROW</h2>
            <h3 className="text-md font-semibold text-neutral-800">5.1 Chính sách giá & phí sàn</h3>
            <ul>
              <li><strong>Giá niêm yết</strong>: Do Người bán tự quyết định, phải bao gồm VAT (trừ khi có thỏa thuận khác). ACF không can thiệp giá, nhưng có quyền đề xuất điều chỉnh nếu phát hiện cạnh tranh không lành mạnh.</li>
              <li><strong>Phí dịch vụ sàn (Take rate)</strong>:
                <ul className="list-disc pl-5 mt-1">
                  <li>Ngành hàng thông thường: <strong>3–5%</strong> trên GMV thành công.</li>
                  <li>Ngành hàng chiến lược (mỹ phẩm, TPCN, hàng hiệu): <strong>5–8%</strong> (bao gồm phí xác thực QR, bảo hiểm chống giả).</li>
                  <li>Seller Pro/Mall: Được ưu đãi phí theo thỏa thuận riêng.</li>
                </ul>
              </li>
            </ul>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">VI. XỬ LÝ ĐƠN HÀNG & TUÂN THỦ QR CHECKPOINT</h2>
            <h3 className="text-md font-semibold text-neutral-800">6.1 Nghĩa vụ giao hàng của Người bán</h3>
            <ul>
              <li>Đóng gói sản phẩm đúng tiêu chuẩn ACF: có tem niêm phong, ảnh đóng gói upload lên hệ thống.</li>
              <li>Bàn giao cho đơn vị vận chuyển (3PL tích hợp hoặc ACF Logistics) trong vòng <strong>24 giờ</strong> kể từ khi đơn được xác nhận.</li>
              <li><strong>Quét QR bắt buộc tại bước "Xuất kho"</strong>: Seller phải quét mã QR ACF trên sản phẩm trước khi bàn giao cho shipper. Hành động này được ghi nhận trên blockchain và là điều kiện tiên quyết để kích hoạt giải ngân Escrow.</li>
            </ul>

            <h3 className="text-md font-semibold text-neutral-800 mt-4">6.2 Quy trình QR Checkpoint 5 bước (Bắt buộc với mọi đơn hàng)</h3>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <ol className="list-decimal pl-5 space-y-1">
                <li>[Seller] Đóng gói → Quét QR "Xuất kho" + upload ảnh niêm phong</li>
                <li>[Shipper] Nhận hàng → Quét QR "Pickup" + GPS timestamp</li>
                <li>[Hub ACF] Kiểm định → Quét QR "Kiểm định" + xác nhận tình trạng</li>
                <li>[Shipper] Giao hàng → Quét QR "Delivery" + OTP buyer</li>
                <li>[Buyer] Nhận hàng → Quét QR "Xác nhận" → Kích hoạt giải ngân Escrow</li>
              </ol>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">VII. CHÍNH SÁCH ĐỔI TRẢ, HOÀN TIỀN & TRÁCH NHIỆM VỚI HÀNG GIẢ</h2>
            <h3 className="text-md font-semibold text-neutral-800">7.2 Cơ chế bồi thường 200% – Trách nhiệm liên đới</h3>
            <p>Khi sản phẩm của Người bán được kết luận là <strong>hàng giả</strong> thông qua quy trình xác thực ACF (QR + Blockchain + Giám định độc lập):</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800">Người mua được:</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Hoàn tiền 100% qua Escrow</li>
                  <li>Bồi thường thêm 100% từ "Quỹ Bảo vệ NTD ACF"</li>
                  <li>Hỗ trợ pháp lý miễn phí nếu có thiệt hại sức khỏe/tài sản</li>
                </ul>
              </div>
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                <h4 className="font-bold text-red-800">Người bán phải chịu:</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Hoàn trả 100% giá trị đơn hàng cho Quỹ Bảo vệ NTD</li>
                  <li>Phạt vi phạm hợp đồng: 200–500% giá trị đơn hàng (tùy mức độ)</li>
                  <li>Khóa vĩnh viễn gian hàng, thu hồi toàn bộ hoa hồng chưa giải ngân</li>
                  <li>Chuyển hồ sơ cho Quản lý thị trường/Công an để xử lý hình sự</li>
                </ul>
              </div>
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">VIII. QUYỀN & NGHĨA VỤ CỦA NGƯỜI BÁN</h2>
            <h3 className="text-md font-semibold text-neutral-800">✅ Quyền lợi của Người bán</h3>
            <ul>
              <li>Được cung cấp dashboard real-time: theo dõi GMV, đơn hàng, hoa hồng affiliate, tỷ lệ chuyển đổi, CSAT.</li>
              <li>Được bảo vệ bởi cơ chế Escrow: giảm thiểu rủi ro chargeback fraud, buyer "bomb hàng".</li>
              <li>Được hỗ trợ pháp lý và kỹ thuật 24/7 qua kênh Seller Support.</li>
              <li>Được tham gia các chương trình marketing, flash sale, livestream do ACF tổ chức.</li>
              <li>Được xuất dữ liệu giao dịch (đã ẩn danh buyer) để phục vụ báo cáo nội bộ, tuân thủ kế toán.</li>
            </ul>

            <h3 className="text-md font-semibold text-neutral-800 mt-4">📌 Nghĩa vụ của Người bán</h3>
            <ul>
              <li>Cung cấp thông tin đăng ký, chứng từ nguồn gốc <strong>trung thực, chính xác, đầy đủ</strong>.</li>
              <li>Niêm yết sản phẩm đúng mô tả, không vi phạm sở hữu trí tuệ, không quảng cáo sai công dụng.</li>
              <li>Tuân thủ quy trình QR Checkpoint, đóng gói đúng chuẩn, bàn giao hàng đúng hạn.</li>
              <li>Phối hợp giải quyết khiếu nại trong SLA quy định (≤48 giờ cho phản hồi đầu tiên).</li>
              <li>Không tạo đơn ảo, tự mua hàng của mình, hoặc thao túng đánh giá/review.</li>
              <li>Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.</li>
              <li>Chịu trách nhiệm pháp lý về chất lượng, bảo hành, và nguồn gốc sản phẩm mình bán.</li>
            </ul>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">IX. VAI TRÒ CỦA SÀN ACF & GIỚI HẠN TRÁCH NHIỆM</h2>
            <h3 className="text-md font-semibold text-neutral-800">9.1 Vai trò trung gian công nghệ</h3>
            <p>
              ACF đóng vai trò <strong>nền tảng kết nối</strong>, cung cấp hạ tầng kỹ thuật: marketplace, logistics orchestration, escrow payment, AI moderation, blockchain traceability.
              ACF <strong>không trực tiếp</strong> sản xuất, nhập khẩu, sở hữu, hoặc bán hàng hóa niêm yết trên sàn.
              Trách nhiệm về chất lượng, bảo hành, và nghĩa vụ với người tiêu dùng thuộc về <strong>Người bán</strong>.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">X. BẢO VỆ DỮ LIỆU & TUÂN THỦ PHÁP LUẬT</h2>
            <h3 className="text-md font-semibold text-neutral-800">10.1 Tuân thủ Nghị định 13/2023/NĐ-CP</h3>
            <p>
              Dữ liệu cá nhân của Người bán (thông tin pháp lý, tài khoản ngân hàng, log giao dịch) được thu thập trên cơ sở <strong>đồng ý rõ ràng</strong> và <strong>mục đích giới hạn</strong>: xác thực danh tính, vận hành escrow, cấp QR, hỗ trợ khiếu nại.
            </p>
            <p>
              Người bán có quyền: truy cập, chỉnh sửa, xóa, chuyển dữ liệu, rút đồng ý, hoặc khiếu nại. Yêu cầu được xử lý trong vòng <strong>07 ngày làm việc</strong> qua email <code>dpo@acfmart.vn</code>.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">XIII. GIẢI QUYẾT TRANH CHẤP & PHÁP LUẬT ÁP DỤNG</h2>
            <ol>
              <li><strong>Ưu tiên hòa giải nội bộ</strong>: Mọi tranh chấp giữa Seller và ACF, hoặc giữa Seller và Buyer, sẽ được ưu tiên giải quyết thông qua cơ chế hòa giải trên nền tảng ACF. Thời hạn hòa giải: <strong>≤15 ngày</strong>.</li>
              <li><strong>Trọng tài/Tòa án</strong>: Nếu không đạt thỏa thuận, tranh chấp sẽ được đưa ra:
                <ul className="list-disc pl-5 mt-1">
                  <li>(a) <strong>Trung tâm Trọng tài Quốc tế Việt Nam (VIAC)</strong>; hoặc</li>
                  <li>(b) <strong>Tòa án nhân dân có thẩm quyền tại tỉnh Đồng Nai, Việt Nam</strong>.</li>
                </ul>
              </li>
              <li><strong>Pháp luật áp dụng</strong>: Pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</li>
            </ol>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">XV. THÔNG TIN LIÊN HỆ & HỖ TRỢ</h2>
            <div className="overflow-x-auto mt-3">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kênh</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Thông tin</th>
                    <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Mục đích</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Tổng đài Seller Support</td>
                    <td className="px-4 py-3 text-sm">1900 066 689 (24/7)</td>
                    <td className="px-4 py-3 text-sm">Hỗ trợ kỹ thuật, xử lý đơn, khiếu nại nhanh</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Email vận hành</td>
                    <td className="px-4 py-3 text-sm"><code>seller@acfmart.vn</code></td>
                    <td className="px-4 py-3 text-sm">Tra cứu chính sách, yêu cầu xuất dữ liệu</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Email pháp lý & DPO</td>
                    <td className="px-4 py-3 text-sm"><code>dpo@acfmart.vn</code></td>
                    <td className="px-4 py-3 text-sm">Khiếu nại bảo mật, yêu cầu xóa dữ liệu, DPIA</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium">Cổng tra cứu minh bạch</td>
                    <td className="px-4 py-3 text-sm"><code>https://verify.acfmart.vn</code></td>
                    <td className="px-4 py-3 text-sm">Kiểm tra trạng thái QR, escrow, audit log</td>
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
import { Shield, Clock, User, CreditCard, Lock, Globe, RotateCcw, Briefcase } from "lucide-react";

export default function PrivacyPolicySeller() {
  return (
    <div className="container-acf py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-gold-600 to-brand-gold-700 py-6 px-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Chính sách bảo mật cho người bán</h1>
          <p className="text-brand-gold-100 mt-2">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Briefcase className="text-brand-gold-600" size={24} />
              Mục tiêu chính sách
            </h2>
            <p>
              Chính sách bảo mật cho người bán này mô tả cách ACFMart.vn thu thập, sử dụng và bảo vệ 
              thông tin cá nhân và thương mại của các đối tác bán hàng trên nền tảng của chúng tôi.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <User className="text-brand-gold-600" size={24} />
              Thông tin thu thập từ người bán
            </h2>
            <p>Chúng tôi thu thập các thông tin sau từ người bán:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Thông tin cá nhân của người đại diện: họ tên, email, số điện thoại, CCCD/CMND</li>
              <li>Thông tin doanh nghiệp: tên công ty, mã số thuế, giấy phép kinh doanh</li>
              <li>Thông tin tài khoản ngân hàng để thanh toán doanh thu</li>
              <li>Thông tin về sản phẩm và hoạt động bán hàng trên nền tảng</li>
              <li>Dữ liệu tài chính và giao dịch liên quan đến việc bán hàng</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="text-brand-gold-600" size={24} />
              Mục đích sử dụng thông tin
            </h2>
            <p>Thông tin của người bán được sử dụng cho các mục đích sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Xác minh danh tính và tư cách pháp lý của người bán</li>
              <li>Quản lý hoạt động bán hàng và sản phẩm trên nền tảng</li>
              <li>Thanh toán doanh thu cho người bán theo chu kỳ đã công bố</li>
              <li>Cung cấp hỗ trợ kỹ thuật và dịch vụ cho người bán</li>
              <li>Đảm bảo tuân thủ các điều khoản sử dụng nền tảng</li>
              <li>Ngăn ngừa gian lận và bảo vệ người mua</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Lock className="text-brand-gold-600" size={24} />
              Bảo mật thông tin người bán
            </h2>
            <p>Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mã hóa thông tin nhạy cảm như tài khoản ngân hàng và số CCCD</li>
              <li>Truy cập hạn chế đến thông tin người bán cho nhân viên có thẩm quyền</li>
              <li>Các biện pháp vật lý, điện tử và quản lý để bảo vệ dữ liệu</li>
              <li>Không tiết lộ thông tin người bán cho bên thứ ba trừ khi có yêu cầu pháp lý</li>
              <li>Luôn cập nhật hệ thống bảo mật để ngăn chặn truy cập trái phép</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Globe className="text-brand-gold-600" size={24} />
              Quyền của người bán
            </h2>
            <p>Là người bán trên nền tảng, bạn có quyền:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Truy cập thông tin tài khoản và hồ sơ người bán của mình</li>
              <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin không chính xác</li>
              <li>Biết cách thông tin của bạn được sử dụng và chia sẻ</li>
              <li>Yêu cầu xóa tài khoản và ngừng xử lý dữ liệu (với điều kiện)</li>
              <li>Phản đối việc sử dụng dữ liệu cho mục đích tiếp thị không liên quan</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="text-brand-gold-600" size={24} />
              Lưu trữ và xóa dữ liệu
            </h2>
            <p>
              Chúng tôi lưu trữ thông tin người bán theo quy định pháp luật và cho đến khi hết mục 
              đích sử dụng. Khi tài khoản bị khóa hoặc người bán yêu cầu xóa, chúng tôi sẽ tiến 
              hành xóa dữ liệu theo quy định, trừ khi cần giữ lại để phục vụ yêu cầu pháp lý hoặc 
              tranh chấp.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <RotateCcw className="text-brand-gold-600" size={24} />
              Cập nhật chính sách
            </h2>
            <p>
              Chính sách này có thể được cập nhật để phản ánh các thay đổi trong quy trình xử lý 
              dữ liệu hoặc yêu cầu pháp lý mới. Người bán sẽ được thông báo về những thay đổi đáng 
              kể và phiên bản cập nhật sẽ được đăng tải tại trang này.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h3 className="font-bold text-neutral-900">Liên hệ hỗ trợ người bán</h3>
            <p className="mt-2">
              Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
              <br />
              <strong>Email:</strong> support@acfmart.vn
              <br />
              <strong>Hotline hỗ trợ người bán:</strong> 1900 xxx xxx
              <br />
              <strong>Địa chỉ:</strong> Văn phòng ACFMart, Việt Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}