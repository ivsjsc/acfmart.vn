import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { signInWithCustomToken } from "firebase/auth"
import { auth } from "../../../lib/firebase"
import { useAuthStore } from "../../../stores/auth-store"
import {
  parseZaloCallback,
  getStoredCodeVerifier,
  clearZaloAuthState,
} from "../../../lib/zalo-auth"

const FUNCTION_URL =
  import.meta.env.VITE_ZALO_AUTH_FUNCTION_URL ??
  "https://asia-southeast1-ecommerce-acf.cloudfunctions.net/zaloAuth"

export default function ZaloCallbackScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = parseZaloCallback(location.search)
        if (!params) {
          setError("Thông tin xác thực không hợp lệ hoặc đã hết hạn")
          return
        }

        const codeVerifier = getStoredCodeVerifier()
        if (!codeVerifier) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng thử lại.")
          return
        }

        const res = await fetch(FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: params.code,
            codeVerifier,
            redirectUri: `${window.location.origin}/auth/zalo/callback`,
          }),
        })

        const data = await res.json()

        if (!res.ok || !data.customToken) {
          setError(data.error ?? "Đăng nhập Zalo thất bại")
          return
        }

        const cred = await signInWithCustomToken(auth, data.customToken)
        const idToken = await cred.user.getIdToken()

        useAuthStore.getState().setUser(
          {
            id: cred.user.uid,
            email: cred.user.email ?? "",
            name: data.profile?.name ?? cred.user.displayName ?? "Zalo User",
            avatar: data.profile?.picture ?? cred.user.photoURL ?? undefined,
            role: "customer",
            isVerified: true,
            phone: cred.user.phoneNumber ?? undefined,
          },
          idToken
        )

        clearZaloAuthState()
        toast.success("Đăng nhập Zalo thành công!")
        navigate("/", { replace: true })
      } catch (err) {
        console.error("Zalo callback error:", err)
        setError("Đã xảy ra lỗi khi đăng nhập Zalo. Vui lòng thử lại.")
      }
    }

    handleCallback()
  }, [location.search, navigate])

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 text-4xl">😕</div>
          <h2 className="mb-2 text-xl font-bold text-neutral-900">
            Đăng nhập thất bại
          </h2>
          <p className="mb-6 text-neutral-600">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="btn-primary"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 size={40} className="mx-auto mb-4 animate-spin text-blue-500" />
        <p className="text-neutral-600">Đang xác thực với Zalo...</p>
      </div>
    </div>
  )
}
