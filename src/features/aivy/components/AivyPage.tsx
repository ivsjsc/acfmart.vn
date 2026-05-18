import { AivyChatPanel } from "./AivyChatPanel"
import { AivyAvatar } from "./AivyAvatar"
import { Sparkles, MessageSquare, ShieldCheck, UserCheck, Store, AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../../stores/auth-store"

export function AivyPage() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return (
      <div className="container-acf py-10">
        <div className="mx-auto max-w-md rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <AivyAvatar size={48} />
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Aivy</h1>
              <p className="text-sm text-neutral-500">Thuộc sở hữu IVS JSC</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-neutral-700">
            Bạn cần đăng nhập để sử dụng Aivy.
          </p>
          <Link to="/login" className="btn-primary mt-4 w-full">
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

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
                  Trợ lý AI thuộc sở hữu{" "}
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
              Aivy trả lời ngắn gọn theo dữ liệu sẵn có. Chỉ khi cần tra cứu đơn hàng
              hoặc trạng thái seller, Aivy mới đọc dữ liệu của chính tài khoản đang đăng nhập.
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
                  title: "Tra cứu đơn hàng",
                  desc: "Chỉ với đơn của tài khoản đang đăng nhập",
                },
                {
                  icon: UserCheck,
                  title: "Kiểm tra tài khoản",
                  desc: "Dẫn tới ví, điểm thưởng và voucher",
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
                  icon: MessageSquare,
                  title: "Giải đáp chính sách",
                  desc: "Dựa trên legal và FAQ nội bộ",
                },
                {
                  icon: Store,
                  title: "Hỗ trợ bán hàng",
                  desc: "Đăng ký seller và kiểm tra hồ sơ",
                },
                {
                  icon: AlertTriangle,
                  title: "Báo cáo hàng giả",
                  desc: "Hướng dẫn hoặc tạo link báo cáo nháp",
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
            <strong>1900 066 689</strong> hoặc{" "}
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
