import { AivyChatPanel } from "./AivyChatPanel"
import { AivyAvatar } from "./AivyAvatar"
import { Sparkles, MessageSquare, ShieldCheck, UserCheck } from "lucide-react"

export function AivyPage() {
  return (
    <div className="container-acf py-6 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar info */}
        <aside className="space-y-4 lg:col-span-1">
          <div className="card overflow-hidden p-6">
            <div className="flex items-center gap-3">
              <AivyAvatar size={56} animate />
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-2xl font-extrabold text-neutral-900">
                    Aivy
                  </h1>
                  <Sparkles size={16} className="text-brand-gold-500" />
                </div>
                <p className="text-sm text-neutral-600">
                  Trợ lý AI (nữ) · Phát triển bởi{" "}
                  <a
                    href="https://ivsacademy.edu.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-red-600 hover:underline"
                  >
                    IVS JSC
                  </a>
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-neutral-700">
              Aivy là trợ lý AI thông minh, lịch sự và thân thiện. Em chỉ truy
              cập dữ liệu tài khoản hoặc hệ thống khi bạn yêu cầu rõ ràng —
              không tự ý tìm kiếm hay hành động ngoài phạm vi.
            </p>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-bold text-neutral-900">
              Aivy có thể giúp gì?
            </h2>
            <ul className="space-y-3 text-sm text-neutral-700">
              {[
                {
                  icon: UserCheck,
                  title: "Tra cứu tài khoản & đơn hàng",
                  desc: "Khi bạn yêu cầu — kiểm tra đơn, ví, điểm",
                },
                {
                  icon: ShieldCheck,
                  title: "Hướng dẫn xác thực QR",
                  desc: "Từng bước quét và đọc kết quả",
                },
                {
                  icon: MessageSquare,
                  title: "Giải đáp chính sách",
                  desc: "Đổi trả, vận chuyển, thanh toán",
                },
                {
                  icon: Sparkles,
                  title: "Tư vấn Seller & Affiliate",
                  desc: "Khi bạn muốn tham gia kinh doanh",
                },
              ].map((f) => (
                <li key={f.title} className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-brand-red-50 p-1.5 text-brand-red-600">
                    <f.icon size={14} />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">{f.title}</div>
                    <div className="text-xs text-neutral-500">{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-brand-gold-200 bg-brand-gold-50 p-4 text-xs text-brand-gold-800">
            <strong>Lưu ý:</strong> Aivy chỉ truy cập dữ liệu khi bạn yêu cầu.
            Aivy không tự động tìm kiếm hay thay đổi thông tin tài khoản.
            Với vấn đề khẩn cấp, vui lòng gọi{" "}
            <strong>1900 633 073</strong> hoặc{" "}
            <a href="/contact" className="underline">
              gửi phản hồi
            </a>
            .
          </div>
        </aside>

        {/* Chat */}
        <div className="lg:col-span-2">
          <div className="h-[calc(100vh-200px)] min-h-[500px]">
            <AivyChatPanel embedded />
          </div>
        </div>
      </div>
    </div>
  )
}
