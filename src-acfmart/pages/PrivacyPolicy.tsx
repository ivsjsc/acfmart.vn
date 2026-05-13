import { Shield, Clock, User, CreditCard, Lock, Globe, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="container-acf py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-red-600 to-brand-red-700 py-6 px-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Chính sách bảo mật</h1>
          <p className="text-brand-red-100 mt-2">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Shield className="text-brand-red-600" size={24} />
              Giới thiệu
            </h2>
            <p>
              Chính sách bảo mật này mô tả cách ACFMart ("chúng tôi", "của chúng tôi", hoặc "nền tảng") 
              thu thập, sử dụng, duy trì và tiết lộ thông tin từ người dùng của nền tảng thương mại 
              điện tử ACFMart.vn.
            </p>
            <p>
              Việc bạn sử dụng dịch vụ của chúng tôi đồng nghĩa với việc bạn chấp nhận việc thu thập 
              và sử dụng thông tin theo chính sách này.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <User className="text-brand-red-600" size={24} />
              Thông tin cá nhân thu thập
            </h2>
            <p>Chúng tôi thu thập các loại thông tin sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Thông tin cá nhân:</strong> Họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng</li>
              <li><strong>Thông tin thanh toán:</strong> Được xử lý an toàn qua các đối tác thanh toán được ủy quyền</li>
              <li><strong>Thông tin giao dịch:</strong> Lịch sử mua hàng, đơn đặt hàng, đánh giá sản phẩm</li>
              <li><strong>Thông tin thiết bị:</strong> Loại thiết bị, hệ điều hành, địa chỉ IP, thông tin trình duyệt</li>
              <li><strong>Thông tin hành vi:</strong> Sản phẩm bạn xem, tìm kiếm, và hành vi tương tác khác</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="text-brand-red-600" size={24} />
              Mục đích sử dụng thông tin
            </h2>
            <p>Thông tin cá nhân của bạn được sử dụng cho các mục đích sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cung cấp và cá nhân hóa trải nghiệm dịch vụ</li>
              <li>Xử lý giao dịch và giao nhận đơn hàng</li>
              <li>Gửi thông báo về đơn hàng, cập nhật dịch vụ và khuyến mãi (nếu bạn đồng ý)</li>
              <li>Hỗ trợ khách hàng và giải quyết vấn đề</li>
              <li>Nâng cao chất lượng dịch vụ, phát triển tính năng mới</li>
              <li>Ngăn chặn hành vi gian lận và đảm bảo an ninh hệ thống</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Lock className="text-brand-red-600" size={24} />
              Bảo mật thông tin
            </h2>
            <p>Chúng tôi thực hiện các biện pháp bảo mật sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sử dụng công nghệ mã hóa SSL để bảo vệ dữ liệu khi truyền qua mạng</li>
              <li>Giới hạn quyền truy cập thông tin cá nhân cho nhân viên và đối tác có liên quan</li>
              <li>Định kỳ kiểm tra, đánh giá bảo mật hệ thống</li>
              <li>Không chia sẻ thông tin cá nhân với bên thứ ba trừ khi cần thiết cho hoạt động kinh doanh hợp pháp hoặc theo yêu cầu pháp lý</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Globe className="text-brand-red-600" size={24} />
              Quyền của người dùng
            </h2>
            <p>Bạn có các quyền sau liên quan đến thông tin cá nhân của mình:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Quyền truy cập:</strong> Yêu cầu bản sao thông tin cá nhân bạn đã cung cấp cho chúng tôi</li>
              <li><strong>Quyền chỉnh sửa:</strong> Yêu cầu chỉnh sửa thông tin cá nhân không chính xác hoặc bổ sung thiếu sót</li>
              <li><strong>Quyền xóa:</strong> Yêu cầu xóa thông tin cá nhân trong một số trường hợp cụ thể</li>
              <li><strong>Quyền rút lại đồng ý:</strong> Rút lại sự đồng ý đã cấp cho chúng tôi xử lý dữ liệu</li>
              <li><strong>Quyền khiếu nại:</strong> Khiếu nại với cơ quan giám sát nếu bạn cho rằng việc xử lý dữ liệu vi phạm luật bảo vệ dữ liệu</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="text-brand-red-600" size={24} />
              Lưu trữ dữ liệu
            </h2>
            <p>
              Chúng tôi chỉ lưu trữ thông tin cá nhân trong thời gian cần thiết để đạt được mục đích 
              đã nêu trong chính sách này hoặc theo yêu cầu của pháp luật. Khi không còn cần thiết, 
              dữ liệu sẽ được xóa an toàn hoặc ẩn danh để sử dụng cho mục đích nghiên cứu và phân tích.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <RotateCcw className="text-brand-red-600" size={24} />
              Cập nhật chính sách
            </h2>
            <p>
              Chính sách này có thể được cập nhật định kỳ để phản ánh các thay đổi trong quy trình 
              xử lý dữ liệu hoặc yêu cầu pháp lý. Bạn sẽ được thông báo về những thay đổi đáng kể 
              và phiên bản cập nhật sẽ được đăng tải tại trang này.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900">Chính sách cụ thể theo vai trò</h2>
            <p>
              Chúng tôi cũng có các chính sách bảo mật cụ thể hơn cho từng loại người dùng:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Link to="/legal/privacy-buyer" className="text-brand-red-600 hover:underline">
                  Chính sách bảo mật cho người mua
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy-seller" className="text-brand-red-600 hover:underline">
                  Chính sách bảo mật cho người bán
                </Link>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <h3 className="font-bold text-neutral-900">Liên hệ</h3>
            <p className="mt-2">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại:
              <br />
              <strong>Email:</strong> privacy@acfmart.vn
              <br />
              <strong>Địa chỉ:</strong> Văn phòng ACFMart, Việt Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}