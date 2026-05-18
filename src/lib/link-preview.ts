/**
 * Client-side URL detector + link preview for the social feed composer.
 *
 * For YouTube and TikTok we recognise the URL shape and build an embed
 * URL directly (no network call, no backend, no CORS). For every other
 * link we surface a minimal card with favicon + hostname + the original
 * URL so the user always has a "Mở liên kết" affordance.
 *
 * This stays deliberately small and dependency-free: the Open Graph
 * thumbnail / title path requires a server (CORS) and was out of scope
 * for V1 of the community upgrade.
 */

export type LinkPreviewKind = "youtube" | "tiktok" | "generic"

export interface LinkPreview {
  url: string
  kind: LinkPreviewKind
  /** iframe `src` for video previews. Undefined for generic links. */
  embedUrl?: string
  /** ID of the video (for analytics / future enrichment). */
  videoId?: string
  /** Hostname (eg. "youtube.com") for the generic card. */
  hostname: string
  /** Best-effort thumbnail URL. YouTube exposes it for free via i.ytimg.com. */
  thumbnail?: string
}

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi

const YT_HOSTS = new Set([
  "youtu.be",
  "www.youtu.be",
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
])

const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "vm.tiktok.com",
  "m.tiktok.com",
])

function safeParse(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

function parseYouTube(parsed: URL): { videoId: string; embedUrl: string; thumbnail: string } | null {
  if (parsed.hostname === "youtu.be" || parsed.hostname === "www.youtu.be") {
    const id = parsed.pathname.replace(/^\//, "")
    if (!id) return null
    return {
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    }
  }
  // /watch?v=ID
  const watchId = parsed.searchParams.get("v")
  if (watchId) {
    return {
      videoId: watchId,
      embedUrl: `https://www.youtube.com/embed/${watchId}`,
      thumbnail: `https://i.ytimg.com/vi/${watchId}/hqdefault.jpg`,
    }
  }
  // /shorts/ID, /embed/ID, /live/ID
  const match = parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/)
  if (match) {
    const id = match[1]
    return {
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    }
  }
  return null
}

function parseTikTok(parsed: URL): { videoId: string; embedUrl: string } | null {
  // Canonical: tiktok.com/@user/video/<id>
  const match = parsed.pathname.match(/\/video\/(\d+)/)
  if (match) {
    const id = match[1]
    return {
      videoId: id,
      embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
    }
  }
  // Shortlinks vm.tiktok.com/XXXXX/ — we can't resolve them client-side
  // (CORS). Treat them as generic so the user still gets an "Open" button.
  return null
}

/**
 * Build a preview for a single URL. Returns null if the URL is malformed.
 */
export function buildLinkPreview(rawUrl: string): LinkPreview | null {
  const parsed = safeParse(rawUrl)
  if (!parsed) return null

  if (YT_HOSTS.has(parsed.hostname)) {
    const yt = parseYouTube(parsed)
    if (yt) {
      return {
        url: rawUrl,
        kind: "youtube",
        embedUrl: yt.embedUrl,
        videoId: yt.videoId,
        hostname: "youtube.com",
        thumbnail: yt.thumbnail,
      }
    }
  }

  if (TIKTOK_HOSTS.has(parsed.hostname)) {
    const tk = parseTikTok(parsed)
    if (tk) {
      return {
        url: rawUrl,
        kind: "tiktok",
        embedUrl: tk.embedUrl,
        videoId: tk.videoId,
        hostname: "tiktok.com",
      }
    }
  }

  return {
    url: rawUrl,
    kind: "generic",
    hostname: parsed.hostname.replace(/^www\./, ""),
  }
}

/**
 * Pick the first URL found in arbitrary text. Used as the trigger for
 * showing a preview in the composer — only the first link is rendered
 * to keep the card compact.
 */
export function extractFirstUrl(content: string): string | null {
  if (!content) return null
  const matches = content.match(URL_REGEX)
  if (!matches || matches.length === 0) return null
  // Trim common trailing punctuation that's almost never part of a URL.
  return matches[0].replace(/[.,;:)\]}>'"!?]+$/, "")
}

export function extractAllUrls(content: string): string[] {
  if (!content) return []
  const matches = content.match(URL_REGEX)
  if (!matches) return []
  return matches.map((m) => m.replace(/[.,;:)\]}>'"!?]+$/, ""))
}

export function isVideoPreview(preview: LinkPreview): boolean {
  return preview.kind === "youtube" || preview.kind === "tiktok"
}
