import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, Loader2, Play, LinkIcon, Users, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { useEmailLogin, useGoogleLogin, useFacebookLogin } from "../../../hooks/use-auth"
import logoImg from "../../../assets/logo.png"

/**
 * Login page for acfmart.online
 * Affiliate Marketing & Social Commerce portal.
 * Features: product links, short videos (<30s), streaming portal.
 */
export default function LoginOnlineScreen() {
  const navigate = useNavigate()
  const emailLogin = useEmailLogin()
  const googleLogin = useGoogleLogin()
  const facebookLogin = useFacebookLogin()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const loading = emailLogin.isPending || googleLogin.isPending || facebookLogin.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu")
      return
    }
    try {
      await emailLogin.mutateAsync({ email, password })
      toast.success("Đăng nhập thành công!")
      navigate("/affiliate", { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại")
    }
  }

  async function handleSocialLogin(provider: "google" | "facebook") {
    try {
      const mutation = provider === "google" ? googleLogin : facebookLogin
      await mutation.mutateAsync()
      toast.success("Đăng nhập thành công!")
      navigate("/affiliate", { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950">
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-pink-600/20 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo & branding */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <img src={logoImg} alt="ACFMart" className="h-6 brightness-0 invert" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                Online
              </span>
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-white">
              Affiliate Marketing
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                & Social Commerce
              </span>
            </h1>
            <p className="mt-3 text-sm text-neutral-400">
              Chia sẻ sản phẩm, tạo video ngắn, livestream và kiếm hoa hồng
            </p>
          </div>

          {/* Features row */}
          <div className="mb-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
              <LinkIcon size={20} className="mx-auto text-purple-400" />
              <p className="mt-1.5 text-[11px] font-medium text-neutral-300">Gắn Link</p>
              <p className="text-[10px] text-neutral-500">Sản phẩm</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
              <Play size={20} className="mx-auto text-pink-400" />
              <p className="mt-1.5 text-[11px] font-medium text-neutral-300">Video ngắn</p>
              <p className="text-[10px] text-neutral-500">Dưới 30s</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
              <Users size={20} className="mx-auto text-cyan-400" />
              <p className="mt-1.5 text-[11px] font-medium text-neutral-300">Streaming</p>
              <p className="text-[10px] text-neutral-500">Live bán hàng</p>
            </div>
          </div>

          {/* Login card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-neutral-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Đăng nhập
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] text-neutral-500">đăng nhập nhanh</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".7" />
                  <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity=".5" />
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity=".8" />
                </svg>
                Google
              </button>
              <button
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#fff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Chưa có tài khoản?{" "}
              <Link
                to="/signup"
                className="font-semibold text-purple-400 hover:text-purple-300"
              >
                Đăng ký miễn phí
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-[11px] text-neutral-600">
            acfmart.online — Affiliate & Social Commerce Platform
          </p>
        </div>
      </div>
    </div>
  )
}
