import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { AuthLayout } from "./AuthLayout"
import { useAuthStore } from "../../../stores/auth-store"

export default function LoginScreen() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu")
      return
    }

    setLoading(true)
    try {
      // TODO Phase 3: gọi Medusa /store/auth + Firebase Auth
      await new Promise((r) => setTimeout(r, 800))
      setUser(
        {
          id: "user_mock_1",
          email,
          name: email.split("@")[0] || "Khách hàng",
          role: "customer",
          isVerified: true,
        },
        "mock_token"
      )
      toast.success("Đăng nhập thành công!")
      navigate("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại")
    } finally {
      setLoading(false)
    }
  }

  function handleSocialLogin(provider: "google" | "facebook" | "zalo") {
    toast(`Đăng nhập ${provider} – sẽ tích hợp ở Phase 3`, { icon: "🚧" })
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại ACFMart"
      footer={
        <span className="text-neutral-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/signup"
            className="font-semibold text-brand-red-600 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@email.com"
              className="input pl-10"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700">
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-red-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10 pr-10"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-500">hoặc đăng nhập với</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Social */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleSocialLogin("google")}
          className="btn-secondary justify-center"
          type="button"
        >
          <span className="text-base">G</span>
          <span className="hidden sm:inline">Google</span>
        </button>
        <button
          onClick={() => handleSocialLogin("facebook")}
          className="btn-secondary justify-center"
          type="button"
        >
          <span className="text-base text-blue-600">f</span>
          <span className="hidden sm:inline">Facebook</span>
        </button>
        <button
          onClick={() => handleSocialLogin("zalo")}
          className="btn-secondary justify-center"
          type="button"
        >
          <span className="text-base text-blue-500">Z</span>
          <span className="hidden sm:inline">Zalo</span>
        </button>
      </div>
    </AuthLayout>
  )
}
