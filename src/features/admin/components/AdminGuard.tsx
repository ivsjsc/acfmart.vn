import { type ReactNode } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Loader2, LogOut, ShieldOff } from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { authService } from "../../../lib/auth-service"
import { auth } from "../../../lib/firebase"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"

export function AdminGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authResolved = useAuthStore((s) => s.authResolved)
  const authReady = useFirebaseAuthReady()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await authService.signOut()
      toast.success("Đã đăng xuất")
      navigate("/login", { replace: true })
    } catch (err) {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.")
    }
  }

  if (!authReady || !authResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={32} />
      </div>
    )
  }

  if (!auth.currentUser || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: "/admin" }} replace />
  }

  if (!user || user.id !== auth.currentUser.uid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={32} />
      </div>
    )
  }

  if (user.role !== "owner" && user.role !== "admin" && user.role !== "moderator") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-rose-50 p-4">
          <ShieldOff className="text-rose-500" size={40} />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Không có quyền truy cập</h1>
        <p className="text-sm text-neutral-500 text-center max-w-sm">
          Bạn cần quyền Owner, Admin hoặc Kiểm duyệt viên để truy cập khu vực này.
          Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>
        <p className="text-xs text-neutral-400">
          Đang đăng nhập với{" "}
          <span className="font-mono">{user.email || user.id}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-700"
          >
            <LogOut size={14} />
            Đăng xuất để dùng tài khoản khác
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
