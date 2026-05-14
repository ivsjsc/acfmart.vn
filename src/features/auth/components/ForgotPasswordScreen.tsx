import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { AuthLayout } from "./AuthLayout"
import { usePasswordReset } from "../../../hooks/use-auth"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const reset = usePasswordReset()
  const loading = reset.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    try {
      await reset.mutateAsync(email)
      setSent(true)
      toast.success("Email đặt lại mật khẩu đã được gửi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gửi email thất bại")
    }
  }

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email để nhận liên kết đặt lại mật khẩu"
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-semibold text-brand-red-600 hover:underline"
        >
          <ArrowLeft size={14} /> Quay lại đăng nhập
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Đã gửi email!</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Aivy đã gửi liên kết đặt lại mật khẩu tới{" "}
              <strong className="text-neutral-900">{email}</strong>. Vui lòng
              kiểm tra hộp thư (kể cả thư rác).
            </p>
          </div>
          <button
            onClick={() => setSent(false)}
            className="btn-secondary mx-auto"
          >
            Đổi email khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Email đã đăng ký
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
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="btn-primary w-full justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang gửi...
              </>
            ) : (
              "Gửi liên kết đặt lại"
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
