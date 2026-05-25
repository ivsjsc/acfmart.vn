import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Loader2,
  Share2,
  ShieldCheck,
  Store,
  Sparkles,
  MousePointerClick,
  ShoppingBag,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useAuthStore } from "../../../stores/auth-store"
import { AffiliateShowcaseSection } from "../../profile"
import {
  getPublicAffiliateProfileBySlug,
  type PublicAffiliateProfileDoc,
} from "../../../lib/public-affiliate-service"
import { listPublicShowcaseLinks, type AffiliateLink } from "../../../lib/affiliate-service"
import { unwrapServiceResult } from "../../../lib/service-result"

export default function AffiliatePublicPage() {
  const { slug } = useParams<{ slug: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<PublicAffiliateProfileDoc | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setProfile(null)
    setUid(null)
    setLinks([])

    ;(async () => {
      try {
        const result = await getPublicAffiliateProfileBySlug(slug)
        if (cancelled) return
        const resolved = unwrapServiceResult(result)
        if (!resolved) {
          setError("Trang công khai không tồn tại hoặc đã bị ẩn.")
          setLoading(false)
          return
        }

        setProfile(resolved.profile)
        setUid(resolved.uid)

        const linksResult = await listPublicShowcaseLinks(resolved.uid, 100)
        if (cancelled) return
        try {
          const nextLinks = unwrapServiceResult(linksResult)
          setLinks(nextLinks.links)
        } catch {
          setLinks([])
        }
      } catch (err) {
        if (cancelled) return
        setError(sanitizeUserError(err, "Không tải được trang affiliate."))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug])

  const metrics = useMemo(() => {
    const totalClicks = links.reduce((sum, item) => sum + item.clicks, 0)
    const totalConversions = links.reduce((sum, item) => sum + item.conversions, 0)
    const totalCommission = links.reduce((sum, item) => sum + item.total_commission, 0)
    return {
      totalClicks,
      totalConversions,
      totalCommission,
      totalProducts: links.length,
    }
  }, [links])

  const showcase = profile?.affiliateShowcase ?? {
    banner: true,
    avatar: true,
    bio: true,
    links: true,
    stats: true,
    contact: true,
  }

  async function copyPublicLink() {
    if (!profile?.affiliateSlug) return
    await navigator.clipboard.writeText(window.location.href)
    toast.success("Đã sao chép link trang công khai")
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-brand-red-500" size={32} />
          <p className="mt-3 text-sm text-neutral-500">Đang tải trang công khai...</p>
        </div>
      </div>
    )
  }

  if (error || !profile || !uid) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <Sparkles className="text-neutral-300" size={56} />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">
          Trang affiliate không tìm thấy
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {error ?? "Trang công khai này không tồn tại hoặc đã bị tắt."}
        </p>
        <Link to="/" className="btn-primary mt-5 inline-flex">
          <ArrowLeft size={14} />
          Về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <div className="container-acf py-4 lg:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-red-600">
            <ArrowLeft size={12} />
            Về trang chủ
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={copyPublicLink} className="btn-secondary text-xs">
              <Copy size={14} />
              Sao chép link
            </button>
            {profile.hasApprovedShop && profile.shopId && (
              <Link to={`/shops/${profile.shopId}`} className="btn-primary text-xs">
                <Store size={14} />
                Xem shop
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative">
            <div className="h-40 sm:h-52 lg:h-64">
              {showcase.banner && profile.affiliateBannerUrl ? (
                <img
                  src={profile.affiliateBannerUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-400" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute right-4 top-4 flex items-center gap-2">
              <button
                onClick={copyPublicLink}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
                aria-label="Sao chép"
              >
                <Share2 size={16} />
              </button>
            </div>

            <div className="container-acf relative -mt-18 pb-4 sm:-mt-24 sm:pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                {showcase.avatar ? (
                  profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.displayName}
                      className="h-24 w-24 rounded-3xl border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-white text-3xl font-extrabold text-brand-red-600 shadow-lg sm:h-28 sm:w-28">
                      {profile.displayName[0]?.toUpperCase() ?? "A"}
                    </div>
                  )
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-white text-3xl font-extrabold text-brand-red-600 shadow-lg sm:h-28 sm:w-28">
                    {profile.displayName[0]?.toUpperCase() ?? "A"}
                  </div>
                )}

                <div className="min-w-0 flex-1 pb-1 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-extrabold sm:text-3xl">
                      {profile.displayName}
                    </h1>
                    {profile.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white">
                        <ShieldCheck size={12} />
                        Xác minh
                      </span>
                    )}
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white/90">
                      /affiliate/{profile.affiliateSlug}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-white/80">
                    Trang trưng bày cá nhân dành cho affiliate
                    {profile.role === "seller" && " • Seller vẫn có shop riêng"}
                  </div>

                  {showcase.bio && profile.bio && (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/90">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {showcase.stats && (
                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <MetricCard label="Sản phẩm" value={metrics.totalProducts.toLocaleString("vi-VN")} />
                  <MetricCard label="Lượt click" value={metrics.totalClicks.toLocaleString("vi-VN")} />
                  <MetricCard label="Đơn" value={metrics.totalConversions.toLocaleString("vi-VN")} />
                  <MetricCard label="Hoa hồng" value={formatCurrency(metrics.totalCommission)} />
                </div>
              )}

              {showcase.contact && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={copyPublicLink} className="btn-secondary bg-white/95 text-xs">
                    <Copy size={14} />
                    Sao chép link
                  </button>
                  {profile.hasApprovedShop && profile.shopId && (
                    <Link to={`/shops/${profile.shopId}`} className="btn-primary text-xs">
                      <Store size={14} />
                      Xem shop riêng
                    </Link>
                  )}
                  {currentUser?.id === uid && (
                    <Link to="/account/settings?tab=affiliate" className="btn-secondary bg-white/95 text-xs">
                      Quản lý trang
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-100 bg-neutral-50 p-4 sm:p-6">
            {showcase.links ? (
              <AffiliateShowcaseSection userId={uid} userName={profile.displayName} />
            ) : (
              <div className="card flex flex-col items-center justify-center p-10 text-center">
                <ShoppingBag size={40} className="text-neutral-300" />
                <h3 className="mt-3 text-base font-semibold text-neutral-900">
                  Phần sản phẩm đang ẩn
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Chủ trang đang tạm ẩn khu vực trưng bày sản phẩm affiliate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/10 backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-wider text-white/70">{label}</div>
      <div className="mt-1 text-xl font-extrabold">{value}</div>
    </div>
  )
}
