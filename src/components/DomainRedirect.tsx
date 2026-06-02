import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  getAppDomain,
  isLocalhost,
  isKnownProductionDomain,
  getCrossDomainUrl,
} from "../lib/domain"

// Đường dẫn thuộc về từng portal — dùng để quyết định cross-domain redirect.
// Mỗi domain có một "canonical origin": seller paths luôn phải nằm trên
// acfmart.store, admin paths trên acfmart.cloud, v.v.
const SELLER_PATH_RE = /^\/(seller|seller-register|seller-channel)(?:\/|$|\?)/
const ADMIN_PATH_RE = /^\/admin(?:\/|$|\?)/
const SOCIAL_PATH_RE = /^\/social(?:\/|$|\?)/
const DOMAIN_LOGIN_PATH = {
  buyer: "/login",
  seller: "/login/store",
  admin: "/login/cloud",
  social: "/login/online",
} as const
const PORTAL_LOGIN_DOMAIN = {
  "/login/store": "seller",
  "/login/cloud": "admin",
  "/login/online": "social",
} as const

function pathMatches(path: string, re: RegExp): boolean {
  return re.test(path)
}

export function DomainRedirect({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const domain = getAppDomain()

  useEffect(() => {
    const path = location.pathname
    const search = location.search

    // Dev/preview: không cross-domain. Cho phép truy cập mọi route trên localhost
    // hoặc trên preview channel không nằm trong DOMAIN_MAP.
    const skipCrossDomain = isLocalhost() || !isKnownProductionDomain()

    if (!skipCrossDomain) {
      const explicitLoginDomain =
        PORTAL_LOGIN_DOMAIN[path as keyof typeof PORTAL_LOGIN_DOMAIN]
      if (explicitLoginDomain && explicitLoginDomain !== domain) {
        window.location.replace(getCrossDomainUrl(explicitLoginDomain, path + search))
        return
      }

      // Từ acfmart.vn → bật sang đúng portal nếu user truy cập đường dẫn dành riêng
      if (domain === "buyer") {
        if (pathMatches(path, SELLER_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("seller", path + search))
          return
        }
        if (pathMatches(path, ADMIN_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("admin", path + search))
          return
        }
        if (pathMatches(path, SOCIAL_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("social", path + search))
          return
        }
        return
      }

      // Trên acfmart.store, đường dẫn admin/social phải bật về portal của chúng
      if (domain === "seller") {
        if (pathMatches(path, ADMIN_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("admin", path + search))
          return
        }
        if (pathMatches(path, SOCIAL_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("social", path + search))
          return
        }
      }

      if (domain === "admin") {
        if (pathMatches(path, SELLER_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("seller", path + search))
          return
        }
        if (pathMatches(path, SOCIAL_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("social", path + search))
          return
        }
      }

      if (domain === "social") {
        if (pathMatches(path, SELLER_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("seller", path + search))
          return
        }
        if (pathMatches(path, ADMIN_PATH_RE)) {
          window.location.replace(getCrossDomainUrl("admin", path + search))
          return
        }
      }
    }

    const portalLoginPath = DOMAIN_LOGIN_PATH[domain]
    if (path === "/login" && portalLoginPath !== "/login") {
      navigate(portalLoginPath, { replace: true })
      return
    }

    // Trong cùng SPA: lock portal về trang gốc của domain
    if (domain === "seller") {
      if (path === "/") {
        navigate("/seller-channel", { replace: true })
        return
      }
      const allowedPrefixes = [
        "/seller",
        "/seller-register",
        "/seller-channel",
        "/login",
        "/signup",
        "/forgot-password",
        "/auth/",
        "/legal/",
        "/help",
      ]
      const isAllowed = allowedPrefixes.some((p) => path.startsWith(p))
      if (!isAllowed) {
        navigate("/seller", { replace: true })
      }
      return
    }

    if (domain === "admin") {
      if (path === "/") {
        navigate("/admin", { replace: true })
        return
      }
      const allowedPrefixes = [
        "/admin",
        "/login",
        "/signup",
        "/forgot-password",
        "/auth/",
        "/legal/",
      ]
      const isAllowed = allowedPrefixes.some((p) => path.startsWith(p))
      if (!isAllowed) {
        navigate("/admin", { replace: true })
      }
      return
    }

    if (domain === "social") {
      if (path === "/") {
        navigate("/social", { replace: true })
        return
      }
      const allowedPrefixes = [
        "/social",
        "/login",
        "/signup",
        "/forgot-password",
        "/auth/",
        "/legal/",
        "/affiliate",
        "/aivy",
      ]
      const isAllowed = allowedPrefixes.some((p) => path.startsWith(p))
      if (!isAllowed) {
        navigate("/social", { replace: true })
      }
    }
  }, [domain, location.pathname, location.search, navigate])

  return <>{children}</>
}
