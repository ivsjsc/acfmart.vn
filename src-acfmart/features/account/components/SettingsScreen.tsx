import { useState } from "react"
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  Trash2,
  Loader2,
  Check,
  Camera,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { cn } from "../../../lib/cn"

const SECTIONS = [
  { id: "profile", label: "Thông tin cá nhân", icon: User },
  { id: "security", label: "Bảo mật", icon: Lock },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "privacy", label: "Quyền riêng tư", icon: Shield },
  { id: "language", label: "Ngôn ngữ & vùng", icon: Globe },
  { id: "danger", label: "Vùng nguy hiểm", icon: Trash2 },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

export default function SettingsScreen() {
  const [section, setSection] = useState<SectionId>("profile")
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900">Cài đặt</h1>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <nav className="card overflow-hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-neutral-100 px-4 py-3 text-sm transition-colors last:border-0",
                section === s.id
                  ? "bg-brand-red-50 font-semibold text-brand-red-700"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div>
          {section === "profile" && <ProfileSection />}
          {section === "security" && <SecuritySection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "privacy" && <PrivacySection />}
          {section === "language" && <LanguageSection />}
          {section === "danger" && <DangerSection />}
        </div>
      </div>
    </div>
  )
}

function ProfileSection() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    updateUser({ name, phone })
    setLoading(false)
    toast.success("Đã lưu thay đổi")
  }

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-base font-bold text-neutral-900">Thông tin cá nhân</h2>

      <div className="mb-5 flex items-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-2xl font-bold text-white">
            {(name || "K")[0].toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <div className="font-semibold">{user?.name ?? "Khách"}</div>
          <div className="text-xs text-neutral-500">{user?.email}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Họ và tên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="email"
            value={user?.email ?? ""}
            className="input"
            disabled
          />
          <p className="mt-1 text-xs text-neutral-500">
            Liên hệ CSKH để đổi email
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Ngày sinh
          </label>
          <input type="date" className="input" />
        </div>
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="btn-primary mt-5"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        Lưu thay đổi
      </button>
    </div>
  )
}

function SecuritySection() {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="mb-3 text-base font-bold">Đổi mật khẩu</h2>
        <div className="space-y-3">
          <input type="password" placeholder="Mật khẩu hiện tại" className="input" />
          <input type="password" placeholder="Mật khẩu mới" className="input" />
          <input type="password" placeholder="Xác nhận mật khẩu mới" className="input" />
          <button className="btn-primary">Cập nhật mật khẩu</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-base font-bold">Xác thực 2 bước</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Xác thực qua SMS</div>
            <div className="text-xs text-neutral-500">
              Tăng cường bảo mật khi đăng nhập
            </div>
          </div>
          <Toggle />
        </div>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const items = [
    { label: "Đơn hàng & vận chuyển", desc: "Cập nhật trạng thái đơn", default: true },
    { label: "Khuyến mãi & voucher", desc: "Săn deal độc quyền", default: true },
    { label: "Tin từ Aivy", desc: "Gợi ý sản phẩm phù hợp", default: true },
    { label: "Tin từ shop yêu thích", desc: "Khi shop có sản phẩm/livestream mới", default: false },
    { label: "Báo cáo hàng giả", desc: "Khi báo cáo của bạn có cập nhật", default: true },
  ]
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-base font-bold">Cài đặt thông báo</h2>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{it.label}</div>
              <div className="text-xs text-neutral-500">{it.desc}</div>
            </div>
            <Toggle defaultChecked={it.default} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PrivacySection() {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="text-base font-bold">Quyền riêng tư</h2>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Hiển thị đánh giá công khai</div>
          <div className="text-xs text-neutral-500">Người khác thấy review của bạn</div>
        </div>
        <Toggle defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Chia sẻ dữ liệu để cải thiện Aivy</div>
          <div className="text-xs text-neutral-500">Giúp Aivy gợi ý sản phẩm chính xác hơn</div>
        </div>
        <Toggle defaultChecked />
      </div>
      <button className="btn-secondary">Yêu cầu xuất dữ liệu</button>
    </div>
  )
}

function LanguageSection() {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="text-base font-bold">Ngôn ngữ & vùng</h2>
      <div>
        <label className="mb-1 block text-sm font-medium">Ngôn ngữ</label>
        <select className="input">
          <option>Tiếng Việt</option>
          <option>English</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tiền tệ</label>
        <select className="input">
          <option>VND (đ)</option>
          <option>USD ($)</option>
        </select>
      </div>
    </div>
  )
}

function DangerSection() {
  return (
    <div className="card border-rose-200 bg-rose-50 p-5">
      <h2 className="mb-3 text-base font-bold text-rose-700">Vùng nguy hiểm</h2>
      <div className="rounded-lg bg-white p-4">
        <h3 className="font-semibold">Xoá tài khoản</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Hành động này không thể hoàn tác. Tất cả đơn hàng, voucher, ví sẽ bị xoá.
        </p>
        <button
          onClick={() => {
            if (confirm("Bạn chắc chắn muốn xoá tài khoản?")) {
              toast.error("Tính năng này đang phát triển")
            }
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
        >
          <Trash2 size={14} /> Xoá vĩnh viễn tài khoản
        </button>
      </div>
    </div>
  )
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        on ? "bg-brand-red-500" : "bg-neutral-300"
      )}
      aria-pressed={on}
    >
      <div
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
