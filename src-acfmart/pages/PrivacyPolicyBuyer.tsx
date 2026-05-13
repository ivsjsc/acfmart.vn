import { Shield, Clock, User, CreditCard, Lock, Globe, RotateCcw } from "lucide-react";

export default function PrivacyPolicyBuyer() {
  return (
    <div className="container-acf py-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-red-600 to-brand-red-700 py-6 px-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Chính sách bảo mật cho người mua</h1>
          <p className="text-brand-red-100 mt-2">
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Shield className="text-brand-red-600" size={24} />
              Mục đích của chính sách
            </h2>
            <p>
              Chính sách bảo mật này nhằm minh bạch hóa việc ACFMart.vn thu thập, sử dụng và bảo vệ 
              thông tin cá nhân của người mua hàng trên nền tảng thương mại điện tử của chúng tôi.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <User className="text-brand-red-600" size={24} />
              Thông tin cá nhân thu thập
            </h2>
            <p>Chúng tôi thu thập các thông tin sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Họ và tên, địa chỉ email, số điện thoại, địa chỉ nhận hàng</li>
              <li>Thông tin thanh toán (chỉ được lưu trữ trên hệ thống của đối tác thanh toán)</li>
              <li>Thông tin về hành vi mua sắm và lịch sử đơn hàng</li>
              <li>Thông tin thiết bị và dữ liệu sử dụng khi truy cập ứng dụng</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <CreditCard className="text-brand-red-600" size={24} />
              Sử dụng thông tin
            </h2>
            <p>Thông tin cá nhân của bạn được sử dụng cho các mục đích sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Xử lý và giao nhận đơn hàng</li>
              <li>Cung cấp dịch vụ chăm sóc khách hàng</li>
              <li>个性 hóa trải nghiệm mua sắm</li>
              <li>Gửi thông báo về đơn hàng và chương trình khuyến mãi (nếu bạn đồng ý)</li>
              <li>Nâng cao chất lượng dịch vụ và bảo mật hệ thống</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Lock className="text-brand-red-600" size={24} />
              Bảo mật thông tin
            </h2>
            <p>Chúng tôi áp dụng các biện pháp bảo mật sau:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sử dụng công nghệ mã hóa SSL để bảo vệ dữ liệu truyền qua mạng</li>
              <li>Hạn chế quyền truy cập thông tin cá nhân cho nhân viên và đối tác</li>
              <li>Kiểm tra bảo mật định kỳ và cập nhật hệ thống</li>
              <li>Không chia sẻ thông tin cá nhân với bên thứ ba trừ khi có yêu cầu pháp lý</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Globe className="text-brand-red-600" size={24} />
              Quyền của người dùng
            </h2>
            <p>Bạn có quyền:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Truy cập thông tin cá nhân mà bạn đã cung cấp cho chúng tôi</li>
              <li>Yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân không chính xác</li>
              <li>Ngừng nhận thông báo tiếp thị bất cứ lúc nào</li>
              <li>Yêu cầu ngừng xử lý dữ liệu cá nhân trong một số trường hợp</li>
              <li>Phản đối việc xử lý dữ liệu cá nhân nếu bạn cảm thấy không phù hợp</li>
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
              dữ liệu sẽ được xóa an toàn hoặc ẩn danh để sử dụng cho mục đích phân tích.
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

          <div className="pt-4 border-t border-neutral-200">
            <h3 className="font-bold text-neutral-900">Liên hệ</h3>
            <p className="mt-2">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại:
              <br />
              <strong>Email:</strong> support@acfmart.vn
              <br />
              <strong>Địa chỉ:</strong> Văn phòng ACFMart, Việt Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}