import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyBuyer() {
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
            Điều khoản Dịch vụ Dành Cho Người Mua
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sàn Thương Mại Điện Tử Chống Hàng Giả ACF
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Hiệu lực: Kể từ ngày Người mua nhấp chọn "Tôi đồng ý" hoặc thực hiện giao dịch đầu tiên trên hệ thống ACF.
          </p>

          <div className="prose prose-sm mt-8 max-w-none">
            <h2 className="text-lg font-bold text-neutral-900">I. ĐỊNH NGHĨA & GIẢI THÍCH TỪ NGỮ</h2>
            <p>
              <strong>"Sàn ACF"</strong>: Nền tảng TMĐT ACF được vận hành bởi IVS JSC<br />
              <strong>"Người mua"</strong>: Cá nhân/tổ chức đăng ký tài khoản và thực hiện giao dịch mua hàng hóa/dịch vụ trên Sàn ACF.<br />
              <strong>"Người bán"</strong>: Thương nhân/tổ chức/cá nhân đã xác thực VNeID Mức 2, niêm yết và bán hàng hóa trên Sàn ACF.<br />
              <strong>"Mã QR ACF"</strong>: Mã định danh duy nhất do hệ thống ACF cấp, cho phép truy xuất nguồn gốc và xác minh tính chính hãng.<br />
              <strong>"Cơ chế Escrow"</strong>: Phương thức thanh toán trong đó tiền của Người mua được giữ tại tài khoản ký quỹ ngân hàng đối tác, chỉ giải ngân cho Người bán khi Người mua xác nhận "Đã nhận đúng hàng".<br />
              <strong>"Hàng giả/Hàng nhái"</strong>: Sản phẩm vi phạm quy định tại Nghị định 98/2020/NĐ-CP, bao gồm hàng giả về hình thức, chất lượng, nguồn gốc, nhãn hiệu hoặc không đúng mô tả niêm yết.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">II. PHẠM VI ÁP DỤNG & CHẤP THUẬN</h2>
            <p>
              Điều khoản này điều chỉnh quyền, nghĩa vụ của Người mua khi sử dụng dịch vụ đặt hàng, thanh toán, nhận hàng và khiếu nại trên Sàn ACF.
            </p>
            <p>
              Việc đăng ký tài khoản, xác thực danh tính, hoặc nhấp nút "Đặt hàng"/"Thanh toán" được xem là sự chấp thuận đầy đủ và không điều kiện đối với bản Điều khoản này, theo đúng quy định về hợp đồng điện tử tại Luật Giao dịch điện tử 2023.
            </p>
            <p>
              Sàn ACF có quyền sửa đổi Điều khoản này. Thay đổi sẽ được thông báo trước 15 ngày qua email/ứng dụng. Việc tiếp tục sử dụng dịch vụ sau thời hạn thông báo được xem là đồng ý với phiên bản mới.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">III. ĐĂNG KÝ TÀI KHOẢN & XÁC THỰC DANH TÍNH</h2>
            <p>
              Người mua phải từ 18 tuổi trở lên hoặc có sự đồng ý bằng văn bản của người giám hộ hợp pháp.
            </p>
            <p>
              Tài khoản phải được xác thực qua ứng dụng VNeID Mức 2 đối với: (a) Giao dịch có giá trị ≥ 10.000.000 VNĐ; (b) Mua hàng thuộc ngành nhạy cảm (dược mỹ phẩm, thực phẩm chức năng, thiết bị y tế, hàng hiệu cao cấp).
            </p>
            <p>
              Người mua cam kết cung cấp thông tin chính xác, chịu trách nhiệm bảo mật tài khoản/mật khẩu. Mọi giao dịch phát sinh từ tài khoản được xem là do Người mua thực hiện, trừ khi chứng minh được hệ thống ACF bị xâm nhập trái phép.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">IV. XÁC THỰC SẢN PHẨM & CAM KẾT CHỐNG HÀNG GIẢ</h2>
            <p>
              Mọi sản phẩm niêm yết trên Sàn ACF đều được gắn Mã QR ACF độc bản và ghi nhận hành trình trên chuỗi khối (Blockchain Traceability).
            </p>
            <p>
              Người mua có quyền và được khuyến khích quét mã QR trước khi thanh toán/nhận hàng để xác minh: nguồn gốc, ngày sản xuất, lịch sử luân chuyển, trạng thái xác thực.
            </p>
            <p>
              Nếu phát hiện dấu hiệu hàng giả, sai mô tả hoặc QR không khớp với Blockchain, Người mua có quyền: Từ chối nhận hàng; Tạo khiếu nại trong vòng 07 ngày kể từ ngày nhận hàng; Báo cáo qua Hotline 1900 066 689 hoặc nút "Báo cáo hàng giả" trên ứng dụng.
            </p>
            <p>
              Sàn ACF cam kết hỗ trợ xác minh độc lập thông qua Trung tâm Kỹ thuật Chống hàng giả ACF và phối hợp với cơ quan Quản lý thị trường nếu có căn cứ vi phạm.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">V. ĐẶT HÀNG, GIÁ CẢ & THANH TOÁN ESCROW</h2>
            <p>
              Giá hiển thị đã bao gồm VAT (trừ khi ghi chú riêng). Giá có thể thay đổi do biến động thị trường hoặc chính sách của Người bán.
            </p>
            <p>
              Cơ chế Escrow: Tiền thanh toán được giữ an toàn tại tài khoản ký quỹ ngân hàng đối tác được NHNN cấp phép. Tiền chỉ được giải ngân cho Người bán khi Người mua xác nhận "Đã nhận đúng hàng chính hãng". Nếu Người mua không phản hồi trong 07 ngày kể từ khi đơn vị vận chuyển cập nhật "Đã giao thành công", hệ thống tự động xác nhận hoàn tất và giải ngân.
            </p>
            <p>
              Phương thức thanh toán: Thẻ ngân hàng, Ví điện tử, Chuyển khoản, COD (tùy chính sách Người bán). Phí thanh toán (nếu có) được hiển thị rõ trước khi xác nhận.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">VI. GIAO HÀNG, KIỂM TRA & XÁC NHẬN</h2>
            <p>
              Thời gian giao hàng dự kiến được hiển thị tại trang chi tiết sản phẩm. Sàn ACF không chịu trách nhiệm với chậm trễ do bất khả kháng (thiên tai, giãn cách, lỗi hạ tầng vận chuyển).
            </p>
            <p>
              Người mua có quyền kiểm tra hàng hóa trước khi ký nhận. Khuyến nghị quay video mở kiện đối với đơn hàng > 500.000 VNĐ hoặc hàng dễ vỡ/điện tử.
            </p>
            <p>
              Trường hợp hàng bị hư hỏng, thiếu phụ kiện, hoặc không đúng mô tả: Người mua được quyền từ chối nhận toàn bộ hoặc một phần đơn hàng. Thông tin từ chối sẽ được ghi nhận tự động vào hệ thống Escrow.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">VII. CHÍNH SÁCH ĐỔI TRẢ, HOÀN TIỀN & BỒI THƯỜNG</h2>
            <p>
              Thời hạn đổi trả: 07 ngày (lỗi kỹ thuật, sai mô tả, giao nhầm); 15 ngày (không đúng màu/kích thước, còn nguyên seal); Không giới hạn khi xác định là hàng giả qua quy trình xác minh ACF.
            </p>
            <p>
              Điều kiện: Sản phẩm còn đầy đủ tem nhãn, phụ kiện, hóa đơn. Người mua chịu phí vận chuyển hoàn trả nếu đổi trả do lý do cá nhân.
            </p>
            <p>
              Hoàn tiền Escrow: Nếu khiếu nại được chấp thuận, tiền sẽ được hoàn trả 100% vào tài khoản gốc trong vòng 03 ngày làm việc. Trường hợp xác định hàng giả: Người mua được hưởng cơ chế bồi thường 200% giá trị đơn hàng theo Chính sách Bảo vệ Người tiêu dùng của ACF.
            </p>
            <p>
              Sàn ACF không áp dụng đổi trả với: hàng đặt riêng, thực phẩm tươi sống, voucher số đã kích hoạt, sản phẩm đã qua sử dụng làm mất tính chất thương mại.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">VIII. QUYỀN & NGHĨA VỤ CỦA NGƯỜI MUA</h2>
            <h3 className="text-md font-semibold text-neutral-800">✅ Quyền lợi:</h3>
            <ul>
              <li>Được cung cấp thông tin minh bạch về sản phẩm, giá, phí vận chuyển, chính sách đổi trả.</li>
              <li>Được bảo vệ bởi cơ chế Escrow, xác thực QR/Blockchain, và hỗ trợ pháp lý khi mua phải hàng giả.</li>
              <li>Thực hiện quyền chủ thể dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.</li>
            </ul>

            <h3 className="text-md font-semibold text-neutral-800 mt-3">📌 Nghĩa vụ:</h3>
            <ul>
              <li>Cung cấp thông tin giao hàng chính xác, thanh toán đúng hạn.</li>
              <li>Không sử dụng dịch vụ cho mục đích gian lận, rửa tiền, kinh doanh trái phép.</li>
              <li>Không tạo đơn ảo, lạm dụng chính sách hoàn tiền, hoặc tung tin thất thiệt gây thiệt hại.</li>
              <li>Tuân thủ pháp luật Việt Nam và các quy định an ninh mạng.</li>
            </ul>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">IX. VAI TRÒ CỦA SÀN ACF & GIỚI HẠN TRÁCH NHIỆM</h2>
            <p>
              Sàn ACF đóng vai trò trung gian kết nối, cung cấp hạ tầng công nghệ, cơ chế xác thực và bảo vệ giao dịch. ACF không trực tiếp sản xuất, nhập khẩu hoặc bán hàng hóa.
            </p>
            <p>
              Trách nhiệm về chất lượng, nguồn gốc, bảo hành sản phẩm thuộc về Người bán. ACF chỉ chịu trách nhiệm khi vi phạm nghĩa vụ kiểm duyệt, xác thực hoặc bảo mật dữ liệu do lỗi hệ thống.
            </p>
            <p>
              Giới hạn bồi thường: Trong mọi trường hợp, tổng mức bồi thường của ACF không vượt quá giá trị đơn hàng phát sinh tranh chấp, trừ khi có quy định pháp luật khác.
            </p>
            <p>
              ACF miễn trừ trách nhiệm với thiệt hại phát sinh từ lỗi thiết bị cá nhân, đường truyền internet, bất khả kháng, hoặc việc Người mua bỏ qua cảnh báo xác thực QR.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">X. BẢO VỆ DỮ LIỆU CÁ NHÂN & QUYỀN RIÊNG TƯ</h2>
            <p>
              Việc thu thập, xử lý dữ liệu cá nhân được thực hiện trên cơ sở đồng ý rõ ràng, nhằm mục đích: xác thực danh tính, vận hành Escrow, cấp QR xác thực, hỗ trợ khiếu nại.
            </p>
            <p>
              Người mua có quyền: truy cập, chỉnh sửa, xóa, chuyển dữ liệu, rút đồng ý, hoặc khiếu nại. Yêu cầu được xử lý trong vòng 07 ngày làm việc qua email dpo@acfmart.vn.
            </p>
            <p>
              Dữ liệu được mã hóa AES-256, lưu trữ tại máy chủ Việt Nam, và tuân thủ nguyên tắc tối thiểu hóa. Log giao dịch được lưu vết tối thiểu 02 năm theo Nghị định 98/2020/NĐ-CP.
            </p>
            <p>
              Trường hợp xảy ra sự cố rò rỉ dữ liệu, ACF sẽ thông báo cho Người mua và Cục An ninh mạng trong vòng 72 giờ theo Nghị định 13/2023/NĐ-CP.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">XI. GIẢI QUYẾT TRANH CHẤP & PHÁP LÝ ÁP DỤNG</h2>
            <p>
              Ưu tiên giải quyết thông qua thương lượng, hòa giải trên nền tảng ACF. Thời hạn hòa giải: ≤ 15 ngày.
            </p>
            <p>
              Nếu không đạt thỏa thuận, tranh chấp sẽ được đưa ra: (a) Trung tâm Trọng tài Quốc tế Việt Nam (VIAC); hoặc (b) Tòa án nhân dân có thẩm quyền tại tỉnh Đồng Nai, Việt Nam.
            </p>
            <p>
              Pháp luật áp dụng: Pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">XII. CHẤM DỨT TÀI KHOẢN & HIỆU LỰC</h2>
            <p>
              Người mua có quyền yêu cầu khóa/xóa tài khoản bất kỳ lúc nào. Dữ liệu giao dịch sẽ được ẩn danh hóa hoặc lưu trữ theo quy định pháp luật.
            </p>
            <p>
              ACF có quyền tạm khóa/vĩnh viễn khóa tài khoản nếu phát hiện hành vi gian lận, vi phạm nghiêm trọng Điều khoản này, hoặc theo yêu cầu cơ quan nhà nước.
            </p>
            <p>
              Điều khoản này có hiệu lực liên tục, kể cả sau khi chấm dứt tài khoản, đối với các nghĩa vụ bảo mật, bồi thường và giải quyết tranh chấp.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-6">THÔNG TIN LIÊN HỆ & HỖ TRỢ</h2>
            <ul>
              <li>Tổng đài Chống hàng giả & CSKH: 1900 066 689 (24/7)</li>
              <li>Email hỗ trợ: support@acfmart.vn</li>
              <li>Email DPO & Khiếu nại pháp lý: dpo@acfmart.vn</li>
              <li>Cổng tra cứu minh bạch: https://verify.acfmart.vn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}