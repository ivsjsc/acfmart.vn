import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Mail, Lock, Phone, Eye, EyeOff, Loader2, AtSign } from "lucide-react"
import toast from "react-hot-toast"
import { AuthLayout } from "./AuthLayout"
import {
  useEmailLogin,
  useGoogleLogin,
  useFacebookLogin,
  useZaloLogin,
  usePhoneLogin,
} from "../../../hooks/use-auth"

export default function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/"

  const emailLogin = useEmailLogin()
  const phoneLogin = usePhoneLogin()
  const googleLogin = useGoogleLogin()
  const facebookLogin = useFacebookLogin()
  const zaloLogin = useZaloLogin()
  const loading = emailLogin.isPending || phoneLogin.isPending || googleLogin.isPending || facebookLogin.isPending || zaloLogin.isPending

  const [identifier, setIdentifier] = useState("") // Có thể là email hoặc số điện thoại
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email') // Thêm trạng thái để theo dõi chế độ đăng nhập

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier || !password) {
      toast.error("Vui lòng nhập " + (loginMode === 'email' ? "email" : "số điện thoại") + " và mật khẩu")
      return
    }

    try {
      if (loginMode === 'email') {
        await emailLogin.mutateAsync({ email: identifier, password })
      } else {
        await phoneLogin.mutateAsync({ phone: identifier, password })
      }
      toast.success("Đăng nhập thành công!")
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại")
    }
  }

  async function handleSocialLogin(provider: "google" | "facebook" | "zalo") {
    if (provider === "zalo") {
      try {
        await zaloLogin.mutateAsync()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Đăng nhập Zalo thất bại")
      }
      return
    }
    try {
      const mutation = provider === "google" ? googleLogin : facebookLogin
      await mutation.mutateAsync()
      toast.success(`Đăng nhập ${provider === "google" ? "Google" : "Facebook"} thành công!`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Đăng nhập ${provider} thất bại`)
    }
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại"
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
      <div className="mb-4 flex rounded-lg bg-neutral-100 p-1">
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            loginMode === 'email'
              ? 'bg-white text-brand-red-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => setLoginMode('email')}
        >
          Qua Email
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            loginMode === 'phone'
              ? 'bg-white text-brand-red-600 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
          onClick={() => setLoginMode('phone')}
        >
          Qua Số điện thoại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {loginMode === 'email' ? 'Email' : 'Số điện thoại'}
          </label>
          <div className="relative">
            {loginMode === 'email' ? (
              <AtSign
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            ) : (
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            )}
            <input
              type={loginMode === 'email' ? "email" : "tel"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={loginMode === 'email' ? "ban@email.com" : "0901234567"}
              className="input pl-10"
              autoComplete={loginMode === 'email' ? "email" : "tel"}
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