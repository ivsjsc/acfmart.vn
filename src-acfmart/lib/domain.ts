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

export function getAppDomain(): AppDomain {
  const hostname = window.location.hostname
  return DOMAIN_MAP[hostname] ?? "buyer"
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
