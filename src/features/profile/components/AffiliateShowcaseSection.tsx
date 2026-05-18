import { useEffect, useMemo, useState } from "react"
import {
  Copy,
  ExternalLink,
  Grid3X3,
  LayoutList,
  Link2,
  Loader2,
  SlidersHorizontal,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import {
  listPublicShowcaseLinks,
  type AffiliateLink,
} from "../../../lib/affiliate-service"
import { unwrapServiceResult } from "../../../lib/service-result"

type SortKey = "newest" | "most_clicks" | "name_asc"
type ViewMode = "grid" | "list"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Mới nhất" },
  { value: "most_clicks", label: "Phổ biến nhất" },
  { value: "name_asc", label: "Tên A–Z" },
]

function sortLinks(links: AffiliateLink[], key: SortKey): AffiliateLink[] {
  const sorted = [...links]
  switch (key) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case "most_clicks":
      return sorted.sort((a, b) => b.clicks - a.clicks)
    case "name_asc":
      return sorted.sort((a, b) =>
        (a.title ?? a.target_url).localeCompare(b.title ?? b.target_url, "vi")
      )
    default:
      return sorted
  }
}

function extractProductImage(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.pathname.includes("/products/")) return null
  } catch {
    /* ignore */
  }
  return null
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

function affiliateUrl(link: AffiliateLink): string {
  return `${window.location.origin}/aff/${link.short_code}`
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  toast.success("Đã sao chép link")
}

interface Props {
  userId: string
  userName: string
}

export default function AffiliateShowcaseSection({ userId, userName }: Props) {
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortKey>("newest")
  const [view, setView] = useState<ViewMode>("grid")
  const [showSort, setShowSort] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const result = await listPublicShowcaseLinks(userId, 50)
        if (cancelled) return
        const data = unwrapServiceResult(result)
        setLinks(data.links)
      } catch {
        if (!cancelled) setLinks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const sorted = useMemo(() => sortLinks(links, sort), [links, sort])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
        <Loader2 size={16} className="animate-spin" />
        Đang tải sản phẩm trưng bày...
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <Link2 size={36} className="text-neutral-300" />
        <h3 className="mt-3 text-base font-semibold text-neutral-900">
          Chưa có sản phẩm trưng bày
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          Khi {userName.split(" ").slice(-1)} chia sẻ sản phẩm, chúng sẽ hiện ở
          đây.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          <strong className="text-neutral-900">{links.length}</strong> sản phẩm
        </p>
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <SlidersHorizontal size={14} />
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </button>
            {showSort && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSort(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value)
                        setShowSort(false)
                      }}
                      className={cn(
                        "block w-full px-3 py-1.5 text-left text-xs",
                        sort === opt.value
                          ? "bg-brand-red-50 font-semibold text-brand-red-600"
                          : "text-neutral-700 hover:bg-neutral-50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-lg border border-neutral-200">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-1.5",
                view === "grid"
                  ? "bg-brand-red-500 text-white"
                  : "bg-white text-neutral-500 hover:bg-neutral-50"
              )}
              aria-label="Chế độ lưới"
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5",
                view === "list"
                  ? "bg-brand-red-500 text-white"
                  : "bg-white text-neutral-500 hover:bg-neutral-50"
              )}
              aria-label="Chế độ danh sách"
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((link) => (
            <ShowcaseCardGrid key={link.id} link={link} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((link) => (
            <ShowcaseCardList key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  )
}

function ShowcaseCardGrid({ link }: { link: AffiliateLink }) {
  const title = extractDisplayTitle(link)
  const imgUrl = extractProductImage(link.target_url)
  const url = affiliateUrl(link)

  return (
    <div className="card group overflow-hidden transition-shadow hover:shadow-md">
      {/* Product image area */}
      <div className="relative aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Link2 size={32} className="text-neutral-300" />
          </div>
        )}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex w-full gap-1 p-2">
            <a
              href={link.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-red-500 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-brand-red-600"
            >
              <ExternalLink size={10} /> Xem chi tiết
            </a>
            <button
              onClick={() => copyToClipboard(url)}
              className="flex items-center justify-center rounded-md bg-white/90 px-2 py-1.5 text-neutral-700 hover:bg-white"
              aria-label="Sao chép link"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-xs font-semibold text-neutral-900">
          {title}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500">
            {link.clicks.toLocaleString("vi-VN")} lượt xem
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block w-full rounded-md bg-brand-red-500 py-1.5 text-center text-xs font-bold text-white hover:bg-brand-red-600"
        >
          Mua ngay
        </a>
      </div>
    </div>
  )
}

function ShowcaseCardList({ link }: { link: AffiliateLink }) {
  const title = extractDisplayTitle(link)
  const url = affiliateUrl(link)

  return (
    <div className="card flex items-center gap-3 p-3 transition-shadow hover:shadow-md">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
        <Link2 size={24} className="text-neutral-400" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">
          {title}
        </h3>
        <p className="mt-0.5 text-[10px] text-neutral-500">
          {link.clicks.toLocaleString("vi-VN")} lượt xem
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <a
          href={link.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ExternalLink size={10} /> Chi tiết
        </a>
        <button
          onClick={() => copyToClipboard(url)}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50"
          aria-label="Sao chép link"
        >
          <Copy size={10} /> Copy
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-brand-red-500 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-brand-red-600"
        >
          Mua ngay
        </a>
      </div>
    </div>
  )
}
