import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { Loader2, AlertTriangle } from "lucide-react"

type RedirectState = "loading" | "redirecting" | "not-found" | "inactive" | "error"

export default function AffiliateRedirectScreen() {
  const { code } = useParams<{ code: string }>()
  const [state, setState] = useState<RedirectState>("loading")

  useEffect(() => {
    if (!code) {
      setState("not-found")
      return
    }

    let cancelled = false

    async function resolve() {
      try {
        const linkRef = doc(firestore, "affiliateLinks", code!)
        const snap = await getDoc(linkRef)

        if (cancelled) return

        if (!snap.exists()) {
          setState("not-found")
          return
        }

        const data = snap.data()
        const status = data.status ?? "active"
        const targetUrl: string = data.target_url ?? data.targetUrl ?? data.originalUrl ?? ""

        if (status !== "active") {
          setState("inactive")
          return
        }

        if (!targetUrl) {
          setState("not-found")
          return
        }

        updateDoc(linkRef, {
          clicks: increment(1),
          last_click_at: new Date(),
        }).catch(() => {})

        setState("redirecting")

        try {
          const url = new URL(targetUrl)
          const currentHost = window.location.hostname
          if (url.hostname === currentHost || url.hostname.endsWith(".acfmart.vn") || url.hostname === "acfmart.vn") {
            window.location.replace(url.pathname + url.search + url.hash)
          } else {
            window.location.replace(targetUrl)
          }
        } catch {
          if (targetUrl.startsWith("/")) {
            window.location.replace(targetUrl)
          } else {
            window.location.replace("/" + targetUrl)
          }
        }
      } catch {
        if (!cancelled) setState("error")
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [code])

  if (state === "loading" || state === "redirecting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-red-500 animate-spin" />
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-500" />
      {state === "not-found" && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">Link không tồn tại</h2>
          <p className="text-gray-500">Link affiliate này không tồn tại hoặc đã bị xoá.</p>
        </>
      )}
      {state === "inactive" && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">Link đã ngừng hoạt động</h2>
          <p className="text-gray-500">Link affiliate này hiện không còn hoạt động.</p>
        </>
      )}
      {state === "error" && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">Đã xảy ra lỗi</h2>
          <p className="text-gray-500">Không thể tải thông tin link. Vui lòng thử lại sau.</p>
        </>
      )}
      <Link to="/" className="btn-primary mt-4">
        Về trang chủ
      </Link>
    </div>
  )
}
