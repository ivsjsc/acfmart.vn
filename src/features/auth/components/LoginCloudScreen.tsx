import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, Monitor, Activity } from "lucide-react"
import toast from "react-hot-toast"
import { useEmailLogin } from "../../../hooks/use-auth"
import logoImg from "../../../assets/logo1.png"

/**
 * Login page for acfmart.cloud
 * Internal management portal for the ACF e-commerce platform board.
 */
export default function LoginCloudScreen() {
  const navigate = useNavigate()
  const emailLogin = useEmailLogin()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu")
      return
    }
    try {
      await emailLogin.mutateAsync({ email, password })
      toast.success("Đăng nhập thành công!")
      navigate("/admin", { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại")
    }
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-10 text-white">
        <div>
          <img src={logoImg} alt="ACFMart" className="h-10 brightness-0 invert" />
          <p className="mt-2 text-xs font-medium tracking-widest uppercase text-slate-400">
            Cloud Management
          </p>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-bold leading-tight">
            Hệ thống Quản lý
            <br />
            <span className="text-sky-400">Sàn Thương mại Điện tử</span>
            <br />
            Chống Hàng Giả ACF
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Trang nội bộ dành cho Ban quản lý sàn. Quản lý kiểm duyệt viên,
            phê duyệt nhà bán hàng, theo dõi báo cáo hàng giả và giám sát hoạt động hệ thống.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20">
                <Monitor size={18} className="text-sky-400" />
              </div>
              <span className="text-sm text-slate-300">Giám sát hoạt động real-time</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                <Shield size={18} className="text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">Kiểm duyệt & phê duyệt Nhà bán</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                <Activity size={18} className="text-amber-400" />
              </div>
              <span className="text-sm text-slate-300">Nhật ký hệ thống & Báo cáo</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          © 2024 IVS JSC — Quỹ Chống Hàng Giả Việt Nam. Nội bộ.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img src={logoImg} alt="ACFMart" className="h-10" />
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cloud Management
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900">Đăng nhập Quản trị</h1>
              <p className="mt-1 text-sm text-slate-500">
                Dành cho Admin & Kiểm duyệt viên
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Email công việc
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@acfmart.cloud"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={emailLogin.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
              >
                {emailLogin.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang xác thực...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            <div className="mt-5 rounded-lg bg-sky-50 p-3">
              <p className="text-center text-[11px] text-sky-700">
                <Shield size={12} className="mr-1 inline" />
                Hệ thống nội bộ — Chỉ dành cho nhân sự được ủy quyền.
                <br />
                Mọi hoạt động được ghi nhật ký.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            acfmart.cloud — Hệ thống quản trị nội bộ v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
