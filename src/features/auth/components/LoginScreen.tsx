import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Lock, Phone, Eye, EyeOff, Loader2, AtSign, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"
import { AuthLayout } from "./AuthLayout"
import {
  useEmailLogin,
  useGoogleLogin,
  useFacebookLogin,
  useZaloLogin,
  useOAuthRedirectLogin,
  useStartPhoneLogin,
  useVerifyPhoneLogin,
} from "../../../hooks/use-auth"
import { sanitizeUserError } from "../../../lib/error-utils"
import { consumeOAuthRedirectPath } from "../../../lib/auth-service"

export default function LoginScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/"

  const emailLogin = useEmailLogin()
  const startPhoneLogin = useStartPhoneLogin()
  const verifyPhoneLogin = useVerifyPhoneLogin()
  const googleLogin = useGoogleLogin()
  const facebookLogin = useFacebookLogin()
  const zaloLogin = useZaloLogin()
  const oauthRedirectLogin = useOAuthRedirectLogin()
  const loading =
    emailLogin.isPending ||
    startPhoneLogin.isPending ||
    verifyPhoneLogin.isPending ||
    googleLogin.isPending ||
    facebookLogin.isPending ||
    zaloLogin.isPending ||
    oauthRedirectLogin.isPending

  const [identifier, setIdentifier] = useState("") // Có thể là email hoặc số điện thoại
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email') // Thêm trạng thái để theo dõi chế độ đăng nhập

  useEffect(() => {
    let cancelled = false
    oauthRedirectLogin
      .mutateAsync()
      .then((user) => {
        if (cancelled || !user) return
        toast.success("Đăng nhập thành công!")
        navigate(consumeOAuthRedirectPath(redirectTo), { replace: true })
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(sanitizeUserError(err, "Đăng nhập thất bại. Vui lòng thử lại sau."))
        }
      })
    return () => {
      cancelled = true
    }
    // Run once on page load to finish Firebase redirect sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier) {
      toast.error("Vui lòng nhập " + (loginMode === 'email' ? "email" : "số điện thoại"))
      return
    }

    try {
      if (loginMode === 'email') {
        if (!password) {
          toast.error("Vui lòng nhập mật khẩu")
          return
        }
        await emailLogin.mutateAsync({ email: identifier, password })
        toast.success("Đăng nhập thành công!")
        navigate(redirectTo, { replace: true })
      } else {
        if (!otpSent) {
          await startPhoneLogin.mutateAsync(identifier)
          setOtpSent(true)
          toast.success("Đã gửi mã OTP")
          return
        }
        if (!otp.trim()) {
          toast.error("Vui lòng nhập mã OTP")
          return
        }
        await verifyPhoneLogin.mutateAsync(otp)
        toast.success("Đăng nhập thành công!")
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      toast.error(sanitizeUserError(err, "Đăng nhập thất bại. Vui lòng thử lại sau."))
    }
  }

  async function handleSocialLogin(provider: "google" | "facebook" | "zalo") {
    if (provider === "zalo") {
      try {
        await zaloLogin.mutateAsync(redirectTo)
      } catch (err) {
        toast.error(sanitizeUserError(err, "Đăng nhập Zalo thất bại. Vui lòng thử lại sau."))
      }
      return
    }
    try {
      const mutation = provider === "google" ? googleLogin : facebookLogin
      await mutation.mutateAsync(redirectTo)
      toast.success(`Đăng nhập ${provider === "google" ? "Google" : "Facebook"} thành công!`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(sanitizeUserError(err, `Đăng nhập ${provider} thất bại. Vui lòng thử lại sau.`))
    }
  }

  function switchLoginMode(mode: "email" | "phone") {
    setLoginMode(mode)
    setIdentifier("")
    setPassword("")
    setOtp("")
    setOtpSent(false)
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
          onClick={() => switchLoginMode("email")}
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
          onClick={() => switchLoginMode("phone")}
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
              onChange={(e) => {
                setIdentifier(e.target.value)
                if (loginMode === "phone") {
                  setOtp("")
                  setOtpSent(false)
                }
              }}
              placeholder={loginMode === 'email' ? "ban@email.com" : "0901234567"}
              className="input pl-10"
              autoComplete={loginMode === 'email' ? "email" : "tel"}
              disabled={loginMode === "phone" && otpSent}
              required
            />
          </div>
        </div>

        {loginMode === "phone" && otpSent && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <div className="flex items-start gap-2">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              <div>
                Mã OTP đã được gửi. Nhập mã để hoàn tất đăng nhập.
                <button
                  type="button"
                  className="ml-1 font-semibold underline"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp("")
                  }}
                >
                  Đổi số
                </button>
              </div>
            </div>
          </div>
        )}

        {loginMode === "phone" && otpSent && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Mã OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="input"
              autoComplete="one-time-code"
              required
            />
          </div>
        )}

        {loginMode === "email" && (
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
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Đang đăng nhập...
            </>
          ) : loginMode === "phone" && !otpSent ? (
            "Gửi mã OTP"
          ) : loginMode === "phone" ? (
            "Xác nhận đăng nhập"
          ) : (
            "Đăng nhập"
          )}
        </button>
        <div id="acfmart-phone-recaptcha" />
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
          disabled={loading}
        >
          <span className="text-base">G</span>
          <span className="hidden sm:inline">Google</span>
        </button>
        <button
          onClick={() => handleSocialLogin("facebook")}
          className="btn-secondary justify-center"
          type="button"
          disabled={loading}
        >
          <span className="text-base text-blue-600">f</span>
          <span className="hidden sm:inline">Facebook</span>
        </button>
        <button
          onClick={() => handleSocialLogin("zalo")}
          className="btn-secondary justify-center"
          type="button"
          disabled={loading}
        >
          <span className="text-base text-blue-500">Z</span>
          <span className="hidden sm:inline">Zalo</span>
        </button>
      </div>
    </AuthLayout>
  )
}
