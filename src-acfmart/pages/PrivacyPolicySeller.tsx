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
              <strong>Email:</strong> seller-support@acfmart.vn
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