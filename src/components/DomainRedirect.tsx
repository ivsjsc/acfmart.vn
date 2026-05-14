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

    if (domain === "social") {
      if (path === "/") {
        navigate("/social", { replace: true })
        return
      }
      // Allow social routes plus authentication and legal pages
      const allowedPrefixes = ["/social", "/login", "/signup", "/forgot-password", "/auth/", "/legal/", "/affiliate", "/aivy"]
      const isAllowed = allowedPrefixes.some((p) => path.startsWith(p))
      if (!isAllowed && path !== "/social") {
        navigate("/social", { replace: true })
      }
    }
  }, [domain, location.pathname, navigate])

  return <>{children}</>
}