export type AppDomain = "buyer" | "seller" | "admin" | "social"

const DOMAIN_MAP: Record<string, AppDomain> = {
  "acfmart.vn": "buyer",
  "www.acfmart.vn": "buyer",
  "acfmart.web.app": "buyer",
  "acfmart.store": "seller",
  "www.acfmart.store": "seller",
  "acfmartstore.web.app": "seller",
  "acfmartstore.firebaseapp.com": "seller",
  "acfmart.cloud": "admin",
  "www.acfmart.cloud": "admin",
  "acfmartcloud.web.app": "admin",
  "acfmartcloud.firebaseapp.com": "admin",
  "acfmart.online": "social",
  "www.acfmart.online": "social",
}

// Origin chuẩn cho mỗi portal khi cần cross-domain redirect ở production.
// Dùng cho việc bật người dùng từ acfmart.vn → acfmart.store khi truy cập đường
// dẫn dành riêng cho seller, v.v.
const CANONICAL_ORIGIN: Record<AppDomain, string> = {
  buyer: "https://acfmart.vn",
  seller: "https://acfmart.store",
  admin: "https://acfmart.cloud",
  social: "https://acfmart.online",
}

export function getAppDomain(): AppDomain {
  const hostname = window.location.hostname
  return DOMAIN_MAP[hostname] ?? "buyer"
}

export function isKnownProductionDomain(): boolean {
  return window.location.hostname in DOMAIN_MAP
}

export function isLocalhost(): boolean {
  const h = window.location.hostname
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")
}

export function getCanonicalOrigin(target: AppDomain): string {
  return CANONICAL_ORIGIN[target]
}

export function getCrossDomainUrl(
  target: AppDomain,
  pathWithSearch: string,
): string {
  const path = pathWithSearch.startsWith("/") ? pathWithSearch : `/${pathWithSearch}`
  return `${CANONICAL_ORIGIN[target]}${path}`
}

// Trả về href tới trang chủ buyer (acfmart.vn).
// - Trên localhost / preview channel: dùng đường dẫn nội bộ "/" để dev vẫn quay về home cùng host.
// - Trên buyer domain: "/" (cùng SPA).
// - Trên seller/admin/social production domain: full URL https://acfmart.vn để bật cross-domain.
export function getBuyerHomeHref(): string {
  if (isLocalhost() || !isKnownProductionDomain()) return "/"
  if (getAppDomain() === "buyer") return "/"
  return getCrossDomainUrl("buyer", "/")
}

export function isBuyerDomain(): boolean {
  return getAppDomain() === "buyer"
}

export function isSellerDomain(): boolean {
  return getAppDomain() === "seller"
}

export function isAdminDomain(): boolean {
  return getAppDomain() === "admin"
}

export function isSocialDomain(): boolean {
  return getAppDomain() === "social"
}

export function getDomainLabel(): string {
  const labels: Record<AppDomain, string> = {
    buyer: "ACFMart",
    seller: "ACFMart Seller Center",
    admin: "ACFMart Admin",
    social: "ACFMart Social",
  }
  return labels[getAppDomain()]
}
