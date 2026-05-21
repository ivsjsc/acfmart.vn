import { Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle } from "lucide-react";
import {
  IVS_SUPPORT_ADDRESS,
  IVS_SUPPORT_EMAILS,
  IVS_SUPPORT_NAME,
  IVS_SUPPORT_PHONES,
  IVS_SUPPORT_TAX_CODE,
} from "../../lib/legal-profile";

export function ContactScreen() {
  return (
    <div className="container-acf py-6 lg:py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Liên hệ</h1>
        <p className="text-neutral-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">Thông tin liên hệ</h2>

            <div className="mb-4 rounded-xl border border-brand-red-100 bg-brand-red-50/40 p-4 text-sm text-neutral-700">
              <div className="font-semibold text-neutral-900">{IVS_SUPPORT_NAME}</div>
              <div className="mt-1">MST: {IVS_SUPPORT_TAX_CODE}</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Email</h3>
                  <p className="text-sm text-neutral-600">
                    {IVS_SUPPORT_EMAILS.map((email, index) => (
                      <span key={email}>
                        {email}
                        {index < IVS_SUPPORT_EMAILS.length - 1 ? " / " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Điện thoại</h3>
                  <p className="text-sm text-neutral-600">
                    {IVS_SUPPORT_PHONES.join(" / ")} (Từ 8:00 - 22:00 hàng ngày)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Trụ sở chính</h3>
                  <p className="text-sm text-neutral-600">{IVS_SUPPORT_ADDRESS}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Thời gian làm việc</h3>
                  <p className="text-sm text-neutral-600">
                    Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                    Thứ 7: 8:00 - 12:00
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-neutral-200 p-6">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">Các kênh hỗ trợ khác</h2>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button className="flex w-full items-center justify-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50">
                <HelpCircle className="text-brand-red-600" size={20} />
                <div>
                  <div className="font-semibold text-neutral-900">Trung tâm trợ giúp</div>
                  <div className="text-xs text-neutral-600">Tự tìm câu trả lời cho các câu hỏi thường gặp</div>
                </div>
              </button>
              
              <button className="flex w-full items-center justify-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50">
                <MessageCircle className="text-brand-red-600" size={20} />
                <div>
                  <div className="font-semibold text-neutral-900">Chat với CSKH</div>
                  <div className="text-xs text-neutral-600">Trò chuyện trực tiếp với nhân viên hỗ trợ</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-neutral-200 p-6">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">Gửi yêu cầu hỗ trợ</h2>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                className="input w-full"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input w-full"
                placeholder="Nhập địa chỉ email"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-neutral-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                className="input w-full"
                placeholder="Nhập số điện thoại"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="mb-1 block text-sm font-medium text-neutral-700">
                Tiêu đề
              </label>
              <input
                type="text"
                id="subject"
                className="input w-full"
                placeholder="Tiêu đề yêu cầu"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-neutral-700">
                Nội dung
              </label>
              <textarea
                id="message"
                rows={4}
                className="input w-full"
                placeholder="Mô tả chi tiết yêu cầu của bạn"
              ></textarea>
            </div>
            
            <button type="submit" className="btn-primary w-full">
              Gửi yêu cầu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
