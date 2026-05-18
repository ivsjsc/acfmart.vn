/**
 * Error message sanitizer for user-facing surfaces.
 *
 * Raw error messages from Firebase / Firestore / Cloudflare / payment SDKs
 * leak implementation details that end users should never see (collection
 * names, OAuth flow internals, composite-index hints, permission-denied
 * paths, etc.). This helper:
 *
 *   1. Detects known technical signatures and replaces them with a generic
 *      Vietnamese-language message that says "system trouble, try again".
 *   2. Preserves a small whitelist of clearly user-actionable errors
 *      (e.g. "wrong password", "email taken") with friendly wording.
 *   3. Logs the original error to the console so developers can still debug
 *      from devtools — only the user-visible string is sanitized.
 *
 * Always prefer this over passing `err.message` straight into `toast.error()`
 * or `setError()`. Even errors that look benign today can be polluted by
 * future SDK upgrades or framework wrapping.
 */

const GENERIC_FALLBACK =
  "Hệ thống đang gặp trục trặc. Vui lòng thử lại sau ít phút."

const NETWORK_FALLBACK =
  "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại."

const PERMISSION_FALLBACK =
  "Tài khoản của bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ hỗ trợ."

/**
 * Substrings that mean we must NEVER show the original message — they all
 * leak backend implementation details.
 */
const TECH_LEAK_PATTERNS = [
  // Firebase / Firestore / Google Cloud
  /firebase/i,
  /firestore/i,
  /\bfirestore\b/i,
  /composite[\s-]?index/i,
  /custom claim/i,
  /id ?token/i,
  /access ?token/i,
  /refresh ?token/i,
  /service[\s-]?account/i,
  /api[\s-]?key/i,
  /auth\/(?:[a-z-]+)/i, // Firebase Auth error codes like auth/popup-closed-by-user
  /storage\/[a-z-]+/i,  // Storage error codes
  /functions\/[a-z-]+/i,// Functions error codes
  // Cloudflare / Stream
  /cloudflare/i,
  /\brtmps?\b/i,
  /stream key/i,
  /\bhls\b/i,
  /\bm3u8\b/i,
  // OAuth / IdP
  /oauth/i,
  /redirect[_\s-]?uri/i,
  /provider/i,
  /\bidp\b/i,
  // Backends / infra
  /medusa/i,
  /postgres/i,
  /redis/i,
  /kubernetes/i,
  /\bk8s\b/i,
  /\bnginx\b/i,
  /cors/i,
  // SDK identifiers
  /onSnapshot/i,
  /getDocs/i,
  /collection\(/i,
  /doc\(/i,
  /httpsCallable/i,
  /onCall/i,
  // Stack-traces / paths
  /at\s+[A-Z][a-zA-Z]+\s+\(/, // "at Foo (..."
  /node_modules/i,
  /\.tsx?:\d+:\d+/, // "file.ts:12:34"
]

/**
 * Patterns mapped to friendlier user-facing messages. The mapping is
 * deliberately conservative — only obvious, frequent user mistakes are
 * surfaced with specific guidance. Everything else falls through to the
 * generic fallback.
 */
const FRIENDLY_OVERRIDES: Array<{ test: RegExp; message: string }> = [
  {
    test: /(wrong[\s-]?password|invalid[\s-]?password|auth\/wrong-password)/i,
    message: "Mật khẩu không đúng. Vui lòng thử lại.",
  },
  {
    test: /(user[\s-]?not[\s-]?found|auth\/user-not-found)/i,
    message: "Tài khoản không tồn tại. Vui lòng kiểm tra email hoặc đăng ký mới.",
  },
  {
    test: /(email[\s-]?already[\s-]?in[\s-]?use|auth\/email-already-in-use)/i,
    message: "Email đã được dùng cho một tài khoản khác.",
  },
  {
    test: /(weak[\s-]?password|auth\/weak-password)/i,
    message: "Mật khẩu quá yếu. Vui lòng dùng ít nhất 8 ký tự, có chữ và số.",
  },
  {
    test: /(too[\s-]?many[\s-]?requests|auth\/too-many-requests)/i,
    message: "Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.",
  },
  {
    test: /(popup[\s-]?closed|auth\/popup-closed-by-user)/i,
    message: "Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất. Hãy thử lại.",
  },
  {
    test: /(popup[\s-]?blocked|auth\/popup-blocked)/i,
    message: "Trình duyệt đã chặn cửa sổ đăng nhập. Hãy bật pop-up rồi thử lại.",
  },
  {
    test: /(network|fetch failed|failed to fetch|err_internet_disconnected)/i,
    message: NETWORK_FALLBACK,
  },
  {
    test: /(permission|unauthorized|forbidden|403)/i,
    message: PERMISSION_FALLBACK,
  },
  {
    test: /(invalid[\s-]?email|auth\/invalid-email)/i,
    message: "Email không hợp lệ.",
  },
  {
    test: /(invalid[\s-]?phone|invalid[\s-]?phone[\s-]?number)/i,
    message: "Số điện thoại không hợp lệ.",
  },
]

function extractRawMessage(error: unknown): string {
  if (typeof error === "string") return error
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; code?: unknown }
    if (typeof maybe.message === "string") return maybe.message
    if (typeof maybe.code === "string") return maybe.code
  }
  return ""
}

/**
 * Convert any error (Error, FirebaseError, plain string, unknown) into a
 * user-safe Vietnamese message. The original is logged at `info` level so
 * the original signal is still available in browser devtools.
 *
 * @example
 *   try { await doThing() } catch (err) { toast.error(sanitizeUserError(err)) }
 */
export function sanitizeUserError(
  error: unknown,
  fallback: string = GENERIC_FALLBACK
): string {
  const raw = extractRawMessage(error)
  if (raw) {
    // eslint-disable-next-line no-console
    console.info("[sanitizeUserError] original:", raw)
  }

  if (!raw) return fallback

  for (const override of FRIENDLY_OVERRIDES) {
    if (override.test.test(raw)) return override.message
  }

  for (const pattern of TECH_LEAK_PATTERNS) {
    if (pattern.test(raw)) return fallback
  }

  if (raw.length > 200) return fallback

  return raw
}

/**
 * Hardened variant: always returns the fallback, never the raw text. Use
 * this when the surface is high-visibility (auth screens, payment flows)
 * and we don't want any chance of leaking even an SDK-translated string.
 */
export function genericUserError(fallback: string = GENERIC_FALLBACK): string {
  return fallback
}

export const FALLBACK_GENERIC = GENERIC_FALLBACK
export const FALLBACK_NETWORK = NETWORK_FALLBACK
export const FALLBACK_PERMISSION = PERMISSION_FALLBACK
