import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import { AuthLayout } from "./AuthLayout"
import { useEmailSignup } from "../../../hooks/use-auth"

export default function SignupScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const signup = useEmailSignup()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const loading = signup.isPending
  const from = (location.state as { from?: string } | null)?.from

  function postSignupPath() {
    if (from && from.startsWith("/") && !from.startsWith("/login") && from !== "/signup") {
      return from
    }
    return "/"
  }

  const passwordStrength = (() => {
    if (password.length < 6) return { label: "Yếu", color: "bg-red-500", w: "33%" }
    if (password.length < 10) return { label: "Trung bình", color: "bg-yellow-500", w: "66%" }
    return { label: "Mạnh", color: "bg-emerald-500", w: "100%" }
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!agreed) {
      toast.error("Vui lòng đồng ý Điều khoản & Chính sách")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }
    if (password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự")
      return
    }

    try {
      await signup.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      })
      toast.success("Tạo tài khoản thành công!")
      navigate(postSignupPath(), { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng ký thất bại")
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Tham gia cộng đồng mua sắm chính hãng"
      footer={
        <span className="text-neutral-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-brand-red-600 hover:underline">
            Đăng nhập
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Họ và tên
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="input pl-10"
                pattern="[0-9]{10,11}"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="input pl-10 pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && (
            <div className="mt-1.5">
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={`h-full transition-all ${passwordStrength.color}`}
                  style={{ width: passwordStrength.w }}
                />
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Độ mạnh: {passwordStrength.label}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="input pl-10"
              required
            />
            {confirmPassword && password === confirmPassword && (
              <CheckCircle2
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
              />
            )}
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded text-brand-red-500 focus:ring-brand-red-500"
          />
          <span>
            Tôi đồng ý với{" "}
            <Link to="/legal/terms" className="text-brand-red-600 underline">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link to="/legal/privacy" className="text-brand-red-600 underline">
              Chính sách bảo mật
            </Link>{" "}
            của nền tảng
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !agreed}
          className="btn-primary w-full justify-center"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Đang tạo tài khoản...
            </>
          ) : (
            "Tạo tài khoản"
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
