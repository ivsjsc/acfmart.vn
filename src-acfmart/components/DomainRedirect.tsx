import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getAppDomain } from "../lib/domain"

export function DomainRedirect({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const domain = getAppDomain()

  useEffect(() => {
    const path = location.pathname

    if (domain === "seller") {
      if (path === "/") {
        navigate("/seller", { replace: true })
        return
      }
      const allowedPrefixes = ["/seller", "/login", "/signup", "/forgot-password", "/auth/", "/legal/", "/seller-register"]
      const isAllowed = allowedPrefixes.some((p) => path.startsWith(p))
      if (!isAllowed) {
        navigate("/seller", { replace: true })
      }
    }

    if (domain === "admin") {
      if (path === "/") {
        navigate("/admin", { replace: true })
        return
      }
      const allowedPrefixes = ["/admin", "/login", "/signup", "/forgot-password", "/auth/", "/legal/"]
      const isAllowed = allowedPrefixes.some((p) => path.startsWith(p))
      if (!isAllowed) {
        navigate("/admin", { replace: true })
      }
    }
  }, [domain, location.pathname, navigate])

  return <>{children}</>
}
