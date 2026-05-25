import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore"
import { auth, firestore } from "./firebase"
import {
  serviceErr,
  serviceOk,
  toServiceError,
  type ServiceResult,
} from "./service-result"

export interface AffiliateShowcaseConfig {
  banner: boolean
  avatar: boolean
  bio: boolean
  links: boolean
  stats: boolean
  contact: boolean
}

export interface PublicAffiliateProfileDoc {
  id: string
  displayName: string
  avatar?: string
  bio?: string | null
  role: string
  isVerified: boolean
  hasApprovedShop: boolean
  shopId?: string | null
  affiliateSlug?: string | null
  affiliatePageEnabled: boolean
  affiliateBannerUrl?: string | null
  affiliateShowcase: AffiliateShowcaseConfig
  origin?: string | null
  publicAddress?: string | null
  joinedAt?: Timestamp | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface ResolvedPublicAffiliateProfile {
  uid: string
  profile: PublicAffiliateProfileDoc
}

export interface UpdatePublicAffiliateProfileInput {
  affiliateSlug?: string
  affiliatePageEnabled?: boolean
  affiliateBannerUrl?: string | null
  bio?: string | null
  affiliateShowcase?: Partial<AffiliateShowcaseConfig>
}

const PUBLIC_PROFILES = "publicProfiles"
const AFFILIATE_SHOWCASE_LINKS = "affiliateShowcaseLinks"
const AFFILIATE_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function asTimestamp(value: unknown): Timestamp | null {
  if (value instanceof Timestamp) return value
  return null
}

export function defaultAffiliateShowcaseConfig(): AffiliateShowcaseConfig {
  return {
    banner: true,
    avatar: true,
    bio: true,
    links: true,
    stats: true,
    contact: true,
  }
}

function normalizeShowcaseConfig(value: unknown): AffiliateShowcaseConfig {
  if (!value || typeof value !== "object") return defaultShowcaseConfig()
  const data = value as Record<string, unknown>
  const defaults = defaultAffiliateShowcaseConfig()
  return {
    banner: asBoolean(data.banner, defaults.banner),
    avatar: asBoolean(data.avatar, defaults.avatar),
    bio: asBoolean(data.bio, defaults.bio),
    links: asBoolean(data.links, defaults.links),
    stats: asBoolean(data.stats, defaults.stats),
    contact: asBoolean(data.contact, defaults.contact),
  }
}

function normalizePublicProfile(id: string, data: DocumentData): PublicAffiliateProfileDoc {
  return {
    id,
    displayName:
      asString(data.displayName) ??
      asString(data.name) ??
      asString(data.shop_name) ??
      "ACFMart",
    avatar: asNullableString(data.avatar) ?? asNullableString(data.shop_logo) ?? undefined,
    bio: asNullableString(data.bio),
    role: asString(data.role) ?? "customer",
    isVerified: asBoolean(data.isVerified ?? data.is_verified, false),
    hasApprovedShop: asBoolean(data.hasApprovedShop ?? data.has_approved_shop, false),
    shopId: asNullableString(data.shopId ?? data.shop_id) ?? undefined,
    affiliateSlug: asNullableString(data.affiliate_slug ?? data.affiliateSlug) ?? undefined,
    affiliatePageEnabled: asBoolean(
      data.affiliate_page_enabled ?? data.affiliatePageEnabled,
      true
    ),
    affiliateBannerUrl:
      asNullableString(data.affiliate_banner_url ?? data.affiliateBannerUrl) ?? undefined,
    affiliateShowcase: normalizeShowcaseConfig(data.affiliate_showcase ?? data.affiliateShowcase),
    origin: asNullableString(data.origin) ?? undefined,
    publicAddress: asNullableString(data.publicAddress ?? data.public_address) ?? undefined,
    joinedAt: asTimestamp(data.joinedAt ?? data.joined_at),
    createdAt: asTimestamp(data.createdAt ?? data.created_at),
    updatedAt: asTimestamp(data.updatedAt ?? data.updated_at),
  }
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildAffiliateSlug(displayName: string, uid: string): string {
  const base = normalizeSlug(displayName)
  const shortId = uid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toLowerCase() || "acf"
  const candidate = base ? `${base}-${shortId}` : shortId
  return candidate.length <= 60 ? candidate : candidate.slice(0, 60).replace(/-+$/g, "")
}

async function currentUidOrThrow(expectedUid?: string): Promise<string> {
  await auth.authStateReady()
  const currentUid = auth.currentUser?.uid
  if (!currentUid) throw new Error("Bạn cần đăng nhập để tiếp tục")
  if (expectedUid && expectedUid !== currentUid) {
    throw new Error("Bạn không có quyền chỉnh sửa hồ sơ công khai này")
  }
  return currentUid
}

function publicProfileRef(uid: string) {
  return doc(firestore, PUBLIC_PROFILES, uid)
}

function publicShowcaseLinksCol(uid: string) {
  return collection(firestore, PUBLIC_PROFILES, uid, AFFILIATE_SHOWCASE_LINKS)
}

function buildBasePublicProfile(uid: string, data: Record<string, unknown>) {
  const displayName =
    asString(data.displayName) ??
    asString(data.name) ??
    asString(data.shop_name) ??
    "ACFMart"
  const avatar = asNullableString(data.avatar) ?? asNullableString(data.shop_logo) ?? null
  const role = asString(data.role) ?? "customer"
  return {
    displayName,
    avatar,
    bio: asNullableString(data.bio),
    role,
    isVerified: asBoolean(data.isVerified ?? data.is_verified, false),
    hasApprovedShop: asBoolean(data.hasApprovedShop ?? data.has_approved_shop, false),
    shopId: asNullableString(data.shopId ?? data.shop_id) ?? null,
    affiliate_slug: buildAffiliateSlug(displayName, uid),
    affiliate_page_enabled: true,
    affiliate_banner_url: null,
    affiliate_showcase: defaultAffiliateShowcaseConfig(),
    origin: asNullableString(data.origin) ?? null,
    publicAddress: asNullableString(data.publicAddress ?? data.public_address) ?? null,
    joinedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

async function isAffiliateSlugTaken(slug: string, currentUid: string): Promise<boolean> {
  const snap = await getDocs(
    query(
      collection(firestore, PUBLIC_PROFILES),
      where("affiliate_slug", "==", slug),
      limit(2)
    )
  )
  return snap.docs.some((docSnap) => docSnap.id !== currentUid)
}

export async function getPublicAffiliateProfileBySlug(
  slug: string
): Promise<ServiceResult<ResolvedPublicAffiliateProfile | null>> {
  try {
    const normalizedSlug = normalizeSlug(slug)
    if (!normalizedSlug) return serviceErr("invalid-slug", "Slug không hợp lệ")

    const slugSnap = await getDocs(
      query(
        collection(firestore, PUBLIC_PROFILES),
        where("affiliate_slug", "==", normalizedSlug),
        where("affiliate_page_enabled", "==", true),
        limit(2)
      )
    )
    const slugMatch = slugSnap.docs[0]
    if (slugMatch) {
      return serviceOk({
        profile: {
          uid: slugMatch.id,
          profile: normalizePublicProfile(slugMatch.id, slugMatch.data()),
        },
      })
    }

    const directSnap = await getDoc(doc(firestore, PUBLIC_PROFILES, normalizedSlug))
    if (directSnap.exists()) {
      const profile = normalizePublicProfile(directSnap.id, directSnap.data())
      if (profile.affiliatePageEnabled) {
        return serviceOk({
          profile: {
            uid: directSnap.id,
            profile,
          },
        })
      }
    }

    return serviceOk({ profile: null })
  } catch (err) {
    return toServiceError(err, "Không thể tải trang affiliate công khai")
  }
}

export function subscribePublicAffiliateProfile(
  uid: string,
  onData: (profile: PublicAffiliateProfileDoc | null) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    publicProfileRef(uid),
    (snap) => {
      onData(snap.exists() ? normalizePublicProfile(snap.id, snap.data()) : null)
    },
    (err) => onError(err instanceof Error ? err : new Error("Không tải được hồ sơ công khai"))
  )
}

export async function updatePublicAffiliateProfile(
  uid?: string,
  input: UpdatePublicAffiliateProfileInput = {}
): Promise<ServiceResult<{ profile: PublicAffiliateProfileDoc }>> {
  try {
    const currentUid = await currentUidOrThrow(uid)
    const ref = publicProfileRef(currentUid)
    const snap = await getDoc(ref)
    const existing = snap.exists() ? (snap.data() as Record<string, unknown>) : null
    const userSnap = existing ? null : await getDoc(doc(firestore, "users", currentUid))
    const source = existing ?? (userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {})

    const nextSlugInput = input.affiliateSlug?.trim()
    const nextSlug =
      nextSlugInput && nextSlugInput.length > 0
        ? normalizeSlug(nextSlugInput)
        : asString(source.affiliate_slug) ??
          buildAffiliateSlug(asString(source.displayName) ?? currentUid, currentUid)

    if (!nextSlug || !AFFILIATE_SLUG_RE.test(nextSlug)) {
      return serviceErr("invalid-slug", "Slug trang công khai không hợp lệ")
    }

    if ((existing?.affiliate_slug ?? source.affiliate_slug) !== nextSlug) {
      if (await isAffiliateSlugTaken(nextSlug, currentUid)) {
        return serviceErr("slug-taken", "Slug này đã được người khác sử dụng")
      }
    }

    const nextProfile: Record<string, unknown> = {
      displayName:
        asString(source.displayName) ??
        asString(source.name) ??
        asString(source.shop_name) ??
        "ACFMart",
      avatar: asNullableString(source.avatar) ?? asNullableString(source.shop_logo) ?? null,
      bio: input.bio !== undefined ? input.bio?.trim() || null : asNullableString(source.bio),
      role: asString(source.role) ?? "customer",
      isVerified: asBoolean(source.isVerified ?? source.is_verified, false),
      hasApprovedShop: asBoolean(source.hasApprovedShop ?? source.has_approved_shop, false),
      shopId: asNullableString(source.shopId ?? source.shop_id) ?? null,
      affiliate_slug: nextSlug,
      affiliate_page_enabled:
        input.affiliatePageEnabled !== undefined
          ? input.affiliatePageEnabled
          : asBoolean(source.affiliate_page_enabled ?? source.affiliatePageEnabled, true),
      affiliate_banner_url:
        input.affiliateBannerUrl !== undefined
          ? input.affiliateBannerUrl?.trim() || null
          : asNullableString(source.affiliate_banner_url ?? source.affiliateBannerUrl) ?? null,
      affiliate_showcase: {
        ...defaultAffiliateShowcaseConfig(),
        ...normalizeShowcaseConfig(source.affiliate_showcase ?? source.affiliateShowcase),
        ...(input.affiliateShowcase ?? {}),
      },
      origin: asNullableString(source.origin) ?? null,
      publicAddress: asNullableString(source.publicAddress ?? source.public_address) ?? null,
      updatedAt: serverTimestamp(),
      createdAt: existing?.createdAt ?? existing?.created_at ?? source.createdAt ?? serverTimestamp(),
      joinedAt: existing?.joinedAt ?? existing?.joined_at ?? source.joinedAt ?? serverTimestamp(),
    }

    await setDoc(ref, nextProfile, { merge: true })
    return serviceOk({ profile: normalizePublicProfile(currentUid, nextProfile) })
  } catch (err) {
    return toServiceError(err, "Không thể cập nhật trang trưng bày công khai")
  }
}
