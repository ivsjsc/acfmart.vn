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
  "Thao tác bị từ chối quyền truy cập. Vui lòng đăng xuất và đăng nhập lại rồi thử lại — nếu vẫn lỗi, tài khoản có thể chưa được cấp đúng quyền."

/**
 * Substrings that mean we must NEVER show the original message — they all
 * leak backend implementation details.
 */
const TECH_LEAK_PATTERNS = [
  // Firebase / Firestore / Google Cloud — match SDK prefixes & technical identifiers,
  // NOT user-facing Vietnamese messages that happen to mention a product name.
  /Firebase:\s/i,                   // SDK error prefix "Firebase: Error (...)"
  /firebase\.google\.com/i,
  /firebaseapp\.com/i,
  /\.firestore\b/i,
  /\bfirestore\b.*\bcollection\b/i,
  /composite[\s-]?index/i,
  /custom claim/i,
  /\bid[_\s]?token\b/i,
  /\baccess[_\s]?token\b/i,
  /\brefresh[_\s]?token\b/i,
  /service[\s-]?account/i,
  /api[\s-]?key/i,
  /\bauth\/[a-z]+-[a-z]/i,          // Firebase Auth error codes like auth/popup-closed-by-user (require hyphen to avoid matching Vietnamese text)
  /storage\/[a-z-]+/i,              // Storage error codes
  /functions\/[a-z-]+/i,            // Functions error codes
  // Cloudflare / Stream
  /cloudflare/i,
  /\brtmps?\b/i,
  /stream key/i,
  /\bhls\b/i,
  /\bm3u8\b/i,
  // OAuth / IdP — match technical OAuth terms, not casual mentions
  /\boauth[_\s]?(?:2|client|token|flow|redirect|error|scope)/i,
  /redirect[_\s-]?uri/i,
  /\bprovider(?:Id|Data|Error|\.\w)\b/i,  // SDK fields, not the English word
  /\bidp\b/i,
  // Backends / infra
  /medusa/i,
  /postgres/i,
  /\bredis\b/i,
  /kubernetes/i,
  /\bk8s\b/i,
  /\bnginx\b/i,
  /\bcors\b/i,
  // SDK identifiers
  /onSnapshot/i,
  /getDocs/i,
  /collection\(/i,
  /doc\(/i,
  /httpsCallable/i,
  /onCall/i,
  // Stack-traces / paths
  /at\s+[A-Z][a-zA-Z]+\s+\(/,      // "at Foo (..."
  /node_modules/i,
  /\.tsx?:\d+:\d+/,                  // "file.ts:12:34"
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
  // NOTE: permission/access-control denials are intentionally NOT matched here.
  // They are detected up front via `isPermissionError` (structured error code),
  // which is far more reliable than a substring match — the old
  // /(permission|...)/ pattern misfired on any message merely containing the
  // word "permission" and clobbered the caller's action-specific fallback.
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

function extractErrorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const code = (error as { code?: unknown }).code
    if (typeof code === "string") return code
  }
  return ""
}

/**
 * True when an error is an access-control denial from Firestore / Functions /
 * Storage / Auth. We key off the structured `code` first (the reliable signal)
 * and only fall back to the canonical Firestore message phrasing. This avoids
 * the previous bug where any message merely *containing* the substring
 * "permission" was reported as a permission problem — which clobbered the
 * action-specific fallback the caller passed in.
 */
export function isPermissionError(error: unknown): boolean {
  const code = extractErrorCode(error).toLowerCase()
  if (
    code === "permission-denied" ||
    code === "unauthenticated" ||
    code === "functions/permission-denied" ||
    code === "functions/unauthenticated" ||
    code === "storage/unauthorized"
  ) {
    return true
  }
  return /missing or insufficient permissions|permission_denied/i.test(
    extractRawMessage(error)
  )
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
  fallback: string = GENERIC_FALLBACK,
  options?: { action?: string }
): string {
  const raw = extractRawMessage(error)
  if (raw) {
    // eslint-disable-next-line no-console
    console.info("[sanitizeUserError] original:", raw)
  }

  // Access-control denials get a dedicated, actionable message. Detected via
  // the structured error code (see isPermissionError) so we never misclassify
  // unrelated text, and so an admin sees "log back in" guidance rather than a
  // dead-end "contact support". When the caller names the action, fold it in
  // so the message reflects exactly what failed.
  if (isPermissionError(error)) {
    return options?.action
      ? `Không thể ${options.action}: thao tác bị từ chối quyền truy cập. Vui lòng đăng xuất, đăng nhập lại rồi thử lại.`
      : PERMISSION_FALLBACK
  }

  if (!raw) return options?.action ? `Không thể ${options.action}. ${fallback}` : fallback

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
