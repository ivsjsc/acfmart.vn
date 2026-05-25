import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Copy,
  ExternalLink,
  Loader2,
  Share2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import {
  buildAffiliateSlug,
  defaultAffiliateShowcaseConfig,
  updatePublicAffiliateProfile,
} from "../../../lib/public-affiliate-service"
import { usePublicAffiliateProfile } from "../../../hooks/use-public-affiliate-profile"

const SHOWCASE_BLOCKS = [
  {
    key: "banner" as const,
    label: "Ảnh bìa",
    desc: "Hiển thị banner lớn ở đầu trang công khai.",
  },
  {
    key: "avatar" as const,
    label: "Ảnh đại diện",
    desc: "Hiển thị avatar từ hồ sơ cá nhân.",
  },
  {
    key: "bio" as const,
    label: "Giới thiệu",
    desc: "Hiển thị phần mô tả ngắn trên trang công khai.",
  },
  {
    key: "links" as const,
    label: "Sản phẩm trưng bày",
    desc: "Danh sách link AFF và thứ tự hiển thị từ Affiliate Dashboard.",
  },
  {
    key: "stats" as const,
    label: "Thống kê",
    desc: "Hiển thị lượt click, số sản phẩm và hiệu quả cơ bản.",
  },
  {
    key: "contact" as const,
    label: "Kêu gọi hành động",
    desc: "Nút chia sẻ, sao chép link và điều hướng sang shop nếu có.",
  },
] as const

type ShowcaseBlockKey = (typeof SHOWCASE_BLOCKS)[number]["key"]

function ToggleRow({
  checked,
  label,
  desc,
  onChange,
}: {
  checked: boolean
  label: string
  desc: string
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        checked
          ? "border-brand-red-200 bg-brand-red-50"
          : "border-neutral-200 bg-white hover:bg-neutral-50"
      )}
    >
      {checked ? (
        <ToggleRight size={22} className="mt-0.5 text-brand-red-600" />
      ) : (
        <ToggleLeft size={22} className="mt-0.5 text-neutral-400" />
      )}
      <div>
        <div className="text-sm font-semibold text-neutral-900">{label}</div>
        <div className="mt-0.5 text-xs text-neutral-500">{desc}</div>
      </div>
    </button>
  )
}

export default function AffiliateShowcaseSettingsSection() {
  const user = useAuthStore((s) => s.user)
  const { profile, loading, error } = usePublicAffiliateProfile(user?.id)
  const [slug, setSlug] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [bio, setBio] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [showcase, setShowcase] = useState(defaultAffiliateShowcaseConfig())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    setSlug(profile?.affiliateSlug ?? buildAffiliateSlug(user.name, user.id))
    setBannerUrl(profile?.affiliateBannerUrl ?? "")
    setBio(profile?.bio ?? "")
    setEnabled(profile?.affiliatePageEnabled ?? true)
    setShowcase(profile?.affiliateShowcase ?? defaultAffiliateShowcaseConfig())
  }, [profile, user?.id, user?.name])

  const publicUrl = useMemo(() => {
    const currentSlug = slug.trim() || profile?.affiliateSlug || buildAffiliateSlug(user?.name ?? "affiliate", user?.id ?? "")
    return `${window.location.origin}/affiliate/${currentSlug}`
  }, [profile?.affiliateSlug, slug, user?.id, user?.name])

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    toast.success("Đã sao chép link trang công khai")
  }

  async function save() {
    if (!user?.id) return
    setSaving(true)
    try {
      await updatePublicAffiliateProfile(user.id, {
        affiliateSlug: slug.trim(),
        affiliatePageEnabled: enabled,
        affiliateBannerUrl: bannerUrl.trim() || null,
        bio: bio.trim() || null,
        affiliateShowcase: showcase,
      })
      toast.success("Đã lưu trang trưng bày công khai")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể lưu trang công khai"))
    } finally {
      setSaving(false)
    }
  }

  function updateBlock(key: ShowcaseBlockKey, next: boolean) {
    setShowcase((current) => ({ ...current, [key]: next }))
  }

  if (!user) {
    return (
      <div className="card p-5">
        <h2 className="text-base font-bold text-neutral-900">Trang công khai affiliate</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Đăng nhập để cấu hình trang trưng bày cá nhân.
        </p>
        <Link to="/login" className="btn-primary mt-4">
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-gold-500" />
              <h2 className="text-base font-bold text-neutral-900">Trang trưng bày công khai</h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-neutral-600">
              Trang affiliate cho mỗi user. Seller vẫn dùng shop riêng, còn trang này
              dùng để trưng bày link AFF, ảnh bìa, avatar, giới thiệu và theo dõi click.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={copyLink} className="btn-secondary">
              <Copy size={14} />
              Sao chép link
            </button>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <ExternalLink size={14} />
              Xem trước
            </a>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error.message}
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                URL công khai
              </div>
              <div className="mt-1 break-all text-sm font-semibold text-neutral-900">
                {publicUrl}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Quy ước: `/affiliate/:slug`. Slug có thể chỉnh trong khung bên dưới.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Slug trang công khai
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input"
                  placeholder="ten-trang-cua-ban"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Banner URL
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="input"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Giới thiệu ngắn
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="input"
                placeholder="Giới thiệu ngắn về bạn, nội dung AFF, chủ đề..."
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  Bật trang công khai
                </div>
                <div className="text-xs text-neutral-500">
                  Tắt trang sẽ ẩn khỏi công chúng nhưng vẫn giữ dữ liệu.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnabled((value) => !value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                  enabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-neutral-100 text-neutral-600"
                )}
              >
                {enabled ? "Đang bật" : "Đang tắt"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm font-semibold text-neutral-900">Hiển thị từng block</div>
              <div className="mt-3 space-y-3">
                {SHOWCASE_BLOCKS.map((block) => (
                  <ToggleRow
                    key={block.key}
                    checked={showcase[block.key]}
                    label={block.label}
                    desc={block.desc}
                    onChange={(next) => updateBlock(block.key, next)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-900">Ghi chú</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed">
                <li>• Sản phẩm AFF và thứ tự trưng bày chỉnh trong màn Affiliate Dashboard.</li>
                <li>• Public page không cần kiểm duyệt, nhưng chỉ hiển thị link sản phẩm đã có sẵn.</li>
                <li>• Seller vẫn dùng shop riêng, không gộp sang trang affiliate.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={save} disabled={saving || loading} className="btn-primary">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
            Lưu trang công khai
          </button>
        </div>
      </div>
    </div>
  )
}
