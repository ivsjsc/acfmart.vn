import { type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { Loader2, ShieldOff } from "lucide-react"
import { useAuthStore } from "../../../stores/auth-store"

export function AdminGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: "/admin" }} replace />
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={32} />
      </div>
    )
  }

  if (user.role !== "admin" && user.role !== "moderator") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-rose-50 p-4">
          <ShieldOff className="text-rose-500" size={40} />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Không có quyền truy cập</h1>
        <p className="text-sm text-neutral-500 text-center max-w-sm">
          Bạn cần quyền Admin hoặc Kiểm duyệt viên để truy cập khu vực này.
          Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
