import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Loader2,
  ShoppingCart,
  Star,
  ExternalLink,
  UserCircle,
} from "lucide-react"
import {
  resolveAffiliateSlug,
  listPublicShowcaseLinks,
  type AffiliateLink,
} from "../../../lib/affiliate-service"
import { unwrapServiceResult } from "../../../lib/service-result"
import { formatCurrency } from "../../../lib/format"
import { cn } from "../../../lib/cn"

interface ShowcaseSettings {
  show_cover?: boolean
  show_avatar?: boolean
  show_bio?: boolean
  show_products?: boolean
}

interface PublicProfile {
  userId: string
  displayName: string
  avatar?: string
  cover_image?: string
  bio?: string
  tier?: string
  shop_banner?: string
  showcase_settings?: ShowcaseSettings
}

function extractDisplayTitle(link: AffiliateLink): string {
  if (link.title && link.title !== link.target_url) return link.title
  try {
    const url = new URL(link.target_url)
    const segments = url.pathname.split("/").filter(Boolean)
    if (segments.length > 0) {
      return decodeURIComponent(segments[segments.length - 1])
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    }
    return url.hostname
  } catch {
    return link.target_url.slice(0, 60)
  }
}

export default function AffiliatePublicPage() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const slugResult = await resolveAffiliateSlug(slug)
        const { userId, profile: profileData } = unwrapServiceResult(slugResult)
        if (cancelled) return

        const settings = (profileData.showcase_settings ?? {}) as ShowcaseSettings
        setProfile({
          userId,
          displayName: (profileData.displayName as string) ?? "Affiliate",
          avatar: (profileData.avatar as string) ?? undefined,
          cover_image: (profileData.cover_image as string) ?? (profileData.shop_banner as string) ?? undefined,
          bio: (profileData.bio as string) ?? undefined,
          tier: (profileData.tier as string) ?? undefined,
          shop_banner: (profileData.shop_banner as string) ?? undefined,
          showcase_settings: settings,
        })

        const linksResult = await listPublicShowcaseLinks(userId, 100)
        if (cancelled) return
        const linkData = unwrapServiceResult(linksResult)
        setLinks(linkData.links)
        setLoading(false)
      } catch (err: any) {
        if (cancelled) return
        setError(err.message ?? "Không tìm thấy trang affiliate")
        setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-brand-red-500" size={28} />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <UserCircle size={48} className="text-neutral-300" />
        <p className="text-neutral-600">{error ?? "Không tìm thấy trang này"}</p>
        <Link to="/" className="btn-primary mt-2">Về trang chủ</Link>
      </div>
    )
  }

  const settings = profile.showcase_settings ?? {}
  const showCover = settings.show_cover !== false
  const showAvatar = settings.show_avatar !== false
  const showBio = settings.show_bio !== false
  const showProducts = settings.show_products !== false

  return (
    <div className="mx-auto max-w-4xl pb-10">
      {showCover && profile.cover_image && (
        <div className="relative h-40 w-full overflow-hidden rounded-b-xl sm:h-56">
          <img
            src={profile.cover_image}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={cn("px-4", showCover && profile.cover_image ? "-mt-12" : "mt-6")}>
        <div className="flex items-end gap-4">
          {showAvatar && (
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-2xl font-bold text-white shadow-md">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
              ) : (
                profile.displayName[0]?.toUpperCase() ?? "A"
              )}
            </div>
          )}
          <div className="pb-1">
            <h1 className="text-xl font-bold text-neutral-900">{profile.displayName}</h1>
            {profile.tier && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
              </span>
            )}
          </div>
        </div>

        {showBio && profile.bio && (
          <p className="mt-3 text-sm text-neutral-600">{profile.bio}</p>
        )}
      </div>

      {showProducts && links.length > 0 && (
        <div className="mt-6 px-4">
          <h2 className="mb-3 text-base font-semibold text-neutral-800">
            San pham gioi thieu ({links.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={`/aff/${link.short_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex flex-col overflow-hidden transition-transform hover:scale-[1.02]"
              >
                {link.product_image && (
                  <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                    <img
                      src={link.product_image}
                      alt={extractDisplayTitle(link)}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-sm font-medium text-neutral-800">
                    {extractDisplayTitle(link)}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    {link.product_price != null && link.product_price > 0 ? (
                      <span className="text-sm font-bold text-brand-red-600">
                        {formatCurrency(link.product_price)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <ShoppingCart size={12} />
                      Xem
                      <ExternalLink size={10} />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {showProducts && links.length === 0 && (
        <div className="mt-10 text-center text-neutral-500">
          <ShoppingCart size={36} className="mx-auto mb-2 text-neutral-300" />
          <p>Chưa có sản phẩm nào được giới thiệu</p>
        </div>
      )}
    </div>
  )
}
