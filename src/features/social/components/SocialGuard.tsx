import { type ReactNode } from "react"
import { Link, Navigate } from "react-router-dom"
import { Loader2, LogIn, Users } from "lucide-react"
import { useAuthStore } from "../../../stores/auth-store"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import { auth } from "../../../lib/firebase"

export function SocialGuard({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authResolved = useAuthStore((s) => s.authResolved)
  const authReady = useFirebaseAuthReady()

  if (!authReady || !authResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    )
  }

  if (!auth.currentUser || !isAuthenticated) {
    return <Navigate to="/login/online" state={{ from: "/social" }} replace />
  }

  if (!user || user.id !== auth.currentUser.uid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    )
  }

  return <>{children}</>
}
