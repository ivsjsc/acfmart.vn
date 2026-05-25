import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken,
  signInWithPhoneNumber,
  linkWithCredential,
  RecaptchaVerifier,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  type AuthProvider,
  type OAuthCredential,
  type ConfirmationResult,
  type UserCredential,
  type User as FirebaseUser,
} from "firebase/auth"
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { auth, googleProvider, facebookProvider, firestore } from "./firebase"
import { useAuthStore, type User, type UserRole } from "../stores/auth-store"

const PHONE_RECAPTCHA_CONTAINER_ID = "acfmart-phone-recaptcha"
const OAUTH_REDIRECT_STORAGE_KEY = "acfmart-oauth-redirect"
const OAUTH_REDIRECT_PROVIDER_KEY = "acfmart-oauth-provider"
const PENDING_LINK_STORAGE_KEY = "acfmart-pending-link"

let phoneRecaptchaVerifier: RecaptchaVerifier | null = null
let phoneConfirmation: ConfirmationResult | null = null

/**
 * Map a Firebase user to the app's internal User type, syncing the
 * Zustand auth store as a side-effect.
 */
const VALID_ROLES: UserRole[] = [
  "customer",
  "seller",
  "carrier",
  "moderator",
  "manager",
  "admin",
  "owner",
]

// Tolerate legacy data persisted with mixed-case roles ("Owner", "ADMIN")
// by normalizing to lowercase before validating.
function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null
  const lower = role.trim().toLowerCase()
  return (VALID_ROLES as string[]).includes(lower) ? (lower as UserRole) : null
}

async function fetchUserRole(fbUser: FirebaseUser): Promise<UserRole> {
  try {
    const token = await fbUser.getIdTokenResult(true)
    const claimRole = normalizeRole(token.claims.role)
    if (claimRole) {
      return claimRole
    }
  } catch {
    // Fall back to Firestore role below.
  }

  try {
    const userDoc = await getDoc(doc(firestore, "users", fbUser.uid))
    if (userDoc.exists()) {
      const docRole = normalizeRole(userDoc.data()?.role)
      if (docRole) {
        return docRole
      }
    }
  } catch {
    // Firestore unavailable — default to customer
  }
  return "customer"
}

function syncStoreFromFirebaseUser(fbUser: FirebaseUser, role: UserRole = "customer"): User {
  const user: User = {
    id: fbUser.uid,
    email: fbUser.email ?? "",
    name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Khách hàng",
    avatar: fbUser.photoURL ?? undefined,
    phone: fbUser.phoneNumber ?? undefined,
    role,
    isVerified: fbUser.emailVerified,
  }
  return user
}

// ─── Pending credential linking ──────────────────────────────────────
// When an OAuth sign-in hits "account-exists-with-different-credential",
// we store the pending credential. After the user signs in with their
// existing method, finishCredentialSignIn automatically links it.

interface PendingLinkData {
  email: string
  providerId: string
  idToken?: string
  accessToken?: string
}

function savePendingLink(email: string, credential: OAuthCredential): void {
  const data: PendingLinkData = {
    email,
    providerId: credential.providerId,
    idToken: credential.idToken ?? undefined,
    accessToken: credential.accessToken ?? undefined,
  }
  sessionStorage.setItem(PENDING_LINK_STORAGE_KEY, JSON.stringify(data))
}

function consumePendingLink(): PendingLinkData | null {
  const raw = sessionStorage.getItem(PENDING_LINK_STORAGE_KEY)
  sessionStorage.removeItem(PENDING_LINK_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PendingLinkData
  } catch {
    return null
  }
}

function restoreCredentialFromPending(data: PendingLinkData): OAuthCredential | null {
  if (data.providerId === "google.com" && (data.idToken || data.accessToken)) {
    return GoogleAuthProvider.credential(data.idToken ?? null, data.accessToken ?? null)
  }
  if (data.providerId === "facebook.com" && data.accessToken) {
    return FacebookAuthProvider.credential(data.accessToken)
  }
  return null
}

async function tryLinkPendingCredential(fbUser: FirebaseUser): Promise<void> {
  const pending = consumePendingLink()
  if (!pending) return

  const credential = restoreCredentialFromPending(pending)
  if (!credential) return

  try {
    await linkWithCredential(fbUser, credential)
    console.info(`[auth] linked pending ${pending.providerId} credential to account ${fbUser.uid}`)
  } catch (err: any) {
    // credential-already-in-use = another Firebase account already has
    // this provider credential. provider-already-linked = same provider
    // is already on this account. Both are safe to ignore silently.
    if (
      err?.code === "auth/credential-already-in-use" ||
      err?.code === "auth/provider-already-linked"
    ) {
      console.info(`[auth] pending link skipped: ${err.code}`)
      return
    }
    console.warn("[auth] failed to link pending credential:", err)
  }
}

function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? "").replace(/[^\d+]/g, "")
}

function normalizeAuthProviderId(provider: string | null | undefined): string {
  switch ((provider ?? "").trim()) {
    case "google.com":
      return "google"
    case "facebook.com":
      return "facebook"
    case "phone":
      return "phone"
    case "zalo":
      return "zalo"
    case "password":
    default:
      return "password"
  }
}

function normalizePhoneForFirebase(phone: string): string {
  const raw = phone.trim()
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""

  const e164 = raw.startsWith("+")
    ? `+${digits}`
    : digits.startsWith("84")
      ? `+${digits}`
      : digits.startsWith("0")
        ? `+84${digits.slice(1)}`
        : `+${digits}`

  return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : ""
}

async function ensureUserProfile(
  fbUser: FirebaseUser,
  overrides: { name?: string; phone?: string; provider?: string; avatar?: string; role?: UserRole } = {}
): Promise<void> {
  const userRef = doc(firestore, "users", fbUser.uid)
  const publicProfileRef = doc(firestore, "publicProfiles", fbUser.uid)
  const directoryRef = doc(firestore, "userDirectory", fbUser.uid)
  const snap = await getDoc(userRef)
  const provider =
    overrides.provider ||
    fbUser.providerData[0]?.providerId ||
    (fbUser.phoneNumber ? "phone" : "password")
  const normalizedProvider = normalizeAuthProviderId(provider)
  const role = overrides.role ?? "customer"

  const phone = normalizePhone(overrides.phone ?? fbUser.phoneNumber)
  const avatar = overrides.avatar ?? fbUser.photoURL ?? undefined
  const baseProfile: Record<string, unknown> = {
    email: fbUser.email ?? "",
    name:
      overrides.name?.trim() ||
      fbUser.displayName ||
      fbUser.email?.split("@")[0] ||
      "Khách hàng",
    auth_provider: normalizedProvider,
    role,
    updated_at: serverTimestamp(),
  }
  if (phone) baseProfile.phone = phone
  if (avatar) baseProfile.avatar = avatar

  if (snap.exists()) {
    await setDoc(userRef, baseProfile, { merge: true })
    await setDoc(
      directoryRef,
      {
        name: baseProfile.name,
        avatar: baseProfile.avatar ?? null,
        role,
        isVerified: fbUser.emailVerified,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    )

    if (role === "customer") {
      await setDoc(
        publicProfileRef,
        {
          displayName: baseProfile.name,
          avatar: baseProfile.avatar ?? null,
          role,
          isVerified: fbUser.emailVerified,
          hasApprovedShop: false,
          shopId: null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }
    return
  }

  await setDoc(userRef, {
    ...baseProfile,
    avatar: baseProfile.avatar ?? null,
    phone: baseProfile.phone ?? "",
    role,
    created_at: serverTimestamp(),
  })

  await setDoc(directoryRef, {
    name: baseProfile.name,
    avatar: baseProfile.avatar ?? null,
    role,
    isVerified: fbUser.emailVerified,
    disabled: false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  if (role === "customer") {
    await setDoc(publicProfileRef, {
      displayName: baseProfile.name,
      avatar: baseProfile.avatar ?? null,
      role,
      isVerified: fbUser.emailVerified,
      hasApprovedShop: false,
      shopId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

type AuthErrorContext =
  | "password"
  | "phone"
  | "signup"
  | "reset"
  | "google"
  | "facebook"
  | "zalo"

function authProviderLabel(context: AuthErrorContext): string {
  const labels: Partial<Record<AuthErrorContext, string>> = {
    google: "Google",
    facebook: "Facebook",
    zalo: "Zalo",
  }
  return labels[context] ?? "tài khoản"
}

function friendlyError(
  code: string | undefined,
  fallback: string,
  context: AuthErrorContext = "password"
): string {
  const provider = authProviderLabel(context)
  switch (code) {
    case "auth/invalid-email":
      return "Email không hợp lệ"
    case "auth/user-disabled":
      return "Tài khoản đã bị vô hiệu hoá"
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      if (["google", "facebook", "zalo"].includes(context)) {
        return `Phiên đăng nhập ${provider} không hợp lệ hoặc cấu hình chưa đúng. Vui lòng thử lại sau.`
      }
      if (context === "phone") {
        return "Số điện thoại hoặc mật khẩu không đúng"
      }
      return "Email hoặc mật khẩu không đúng"
    case "auth/operation-not-allowed":
      if (["google", "facebook", "zalo"].includes(context)) {
        return `Phương thức đăng nhập ${provider} chưa được kích hoạt. Vui lòng liên hệ hỗ trợ.`
      }
      return "Phương thức đăng nhập này chưa được kích hoạt. Vui lòng liên hệ hỗ trợ."
    case "auth/unauthorized-domain":
    case "auth/unauthorized-continue-uri":
      return "Tên miền hiện tại chưa được cấu hình cho đăng nhập. Vui lòng liên hệ hỗ trợ."
    case "auth/account-exists-with-different-credential":
      return "Email này đã có tài khoản bằng phương thức đăng nhập khác. Vui lòng đăng nhập bằng phương thức đã dùng trước đó rồi liên kết tài khoản."
    case "auth/credential-already-in-use":
      return "Tài khoản mạng xã hội này đã được liên kết với một người dùng khác."
    case "auth/invalid-oauth-provider":
    case "auth/invalid-oauth-client-id":
    case "auth/invalid-oauth-client-secret":
    case "auth/invalid-idp-response":
      return `Cấu hình đăng nhập ${provider} chưa đúng. Vui lòng liên hệ hỗ trợ.`
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng"
    case "auth/weak-password":
      return "Mật khẩu phải tối thiểu 6 ký tự"
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Bạn đã đóng cửa sổ đăng nhập"
    case "auth/popup-blocked":
      return "Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép popup và thử lại."
    case "auth/web-storage-unsupported":
      return "Trình duyệt đang chặn lưu trữ phiên đăng nhập. Vui lòng bật cookie/storage hoặc dùng trình duyệt khác."
    case "auth/network-request-failed":
      return "Không có kết nối mạng. Vui lòng thử lại."
    case "auth/too-many-requests":
      return "Quá nhiều lần thử. Vui lòng đợi vài phút."
    case "auth/app-not-authorized":
      return "Tên miền hiện tại chưa được cấu hình cho đăng nhập. Vui lòng liên hệ hỗ trợ."
    case "auth/invalid-phone-number":
      return "Số điện thoại không hợp lệ"
    case "auth/missing-phone-number":
      return "Vui lòng nhập số điện thoại"
    case "auth/quota-exceeded":
      return "Đã vượt giới hạn gửi OTP. Vui lòng thử lại sau."
    case "auth/captcha-check-failed":
    case "auth/missing-app-credential":
      return "Xác thực chống spam chưa thành công. Vui lòng tải lại trang và thử lại."
    case "auth/invalid-verification-code":
      return "Mã OTP không đúng"
    case "auth/code-expired":
      return "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới."
    default:
      return fallback.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?$/i, "")
  }
}

function shouldFallbackToRedirect(code: string | undefined): boolean {
  return [
    "auth/popup-blocked",
    "auth/cancelled-popup-request",
    "auth/operation-not-supported-in-this-environment",
    "auth/web-storage-unsupported",
    "auth/unauthorized-domain",
    "auth/invalid-credential",
    "auth/internal-error",
  ].includes(code ?? "")
}

function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/"
  if (path.startsWith("/auth/")) return "/"
  return path
}

function saveOAuthRedirectState(path: string | undefined, provider: Extract<AuthErrorContext, "google" | "facebook">): void {
  localStorage.setItem(OAUTH_REDIRECT_STORAGE_KEY, sanitizeRedirectPath(path))
  localStorage.setItem(OAUTH_REDIRECT_PROVIDER_KEY, provider)
}

export function consumeOAuthRedirectPath(fallback = "/"): string {
  const saved = localStorage.getItem(OAUTH_REDIRECT_STORAGE_KEY)
  localStorage.removeItem(OAUTH_REDIRECT_STORAGE_KEY)
  return sanitizeRedirectPath(saved ?? fallback)
}

function shouldPreferRedirectSignIn(): boolean {
  return false
}

function consumeOAuthRedirectProvider(): Extract<AuthErrorContext, "google" | "facebook"> {
  const provider = localStorage.getItem(OAUTH_REDIRECT_PROVIDER_KEY)
  localStorage.removeItem(OAUTH_REDIRECT_PROVIDER_KEY)
  return provider === "facebook" ? "facebook" : "google"
}

async function finishCredentialSignIn(
  cred: UserCredential,
  provider?: string,
  overrides: { name?: string; phone?: string; avatar?: string } = {}
): Promise<User> {
  const idToken = await cred.user.getIdToken()
  const role = await fetchUserRole(cred.user)
  const user = syncStoreFromFirebaseUser(cred.user, role)
  if (overrides.name) user.name = overrides.name
  if (overrides.phone) user.phone = overrides.phone
  if (overrides.avatar) user.avatar = overrides.avatar
  await ensureUserProfile(cred.user, {
    provider,
    name: user.name,
    phone: overrides.phone,
    avatar: user.avatar,
    role,
  })
  useAuthStore.getState().setUser(user, idToken)

  // After successful sign-in, link any pending OAuth credential from a
  // previous "account-exists-with-different-credential" attempt.
  // Fire-and-forget — linking failure should not block the login.
  tryLinkPendingCredential(cred.user).catch((err) => {
    console.warn("[auth] pending credential link failed:", err)
  })

  return user
}

async function signInWithOAuthProvider(
  provider: AuthProvider,
  context: Extract<AuthErrorContext, "google" | "facebook">,
  redirectTo?: string
): Promise<User> {
  if (shouldPreferRedirectSignIn()) {
    saveOAuthRedirectState(redirectTo, context)
    await signInWithRedirect(auth, provider)
    return new Promise<User>(() => undefined)
  }

  try {
    const cred = await signInWithPopup(auth, provider)
    return finishCredentialSignIn(cred, provider.providerId)
  } catch (err: any) {
    const diagInfo = {
      code: err?.code,
      message: err?.message,
      customData: err?.customData,
      authDomain: auth.config.authDomain,
      currentOrigin: window.location.origin,
      providerId: provider.providerId,
    }
    console.error(`[auth] ${context} popup sign-in failed`, diagInfo)

    // ── Account linking: same email, different provider ──────────
    // Store the pending credential so it can be linked after the user
    // signs in with their existing method.
    if (err?.code === "auth/account-exists-with-different-credential") {
      const email = err.customData?.email as string | undefined
      const pendingCred =
        GoogleAuthProvider.credentialFromError(err) ??
        FacebookAuthProvider.credentialFromError(err) ??
        OAuthProvider.credentialFromError(err)

      if (email && pendingCred) {
        savePendingLink(email, pendingCred as OAuthCredential)
      }
      const providerLabel = authProviderLabel(context)
      throw new Error(
        `Email ${email ?? ""} đã có tài khoản bằng phương thức khác. ` +
        `Vui lòng đăng nhập bằng phương thức cũ — hệ thống sẽ tự động liên kết tài khoản ${providerLabel}.`
      )
    }

    // Firestore profile-sync errors should NOT trigger redirect fallback —
    // the user already authenticated; only the post-login write failed.
    const isAuthError = typeof err?.code === "string" && err.code.startsWith("auth/")

    if (isAuthError && shouldFallbackToRedirect(err.code)) {
      console.info(`[auth] falling back to redirect sign-in for ${context}`, diagInfo)
      saveOAuthRedirectState(redirectTo, context)
      await signInWithRedirect(auth, provider)
      return new Promise<User>(() => undefined)
    }
    throw new Error(friendlyError(err?.code, err?.message ?? `Đăng nhập ${context} thất bại`, context))
  }
}

function resetPhoneRecaptcha(): void {
  try {
    phoneRecaptchaVerifier?.clear()
  } catch {
    // Ignore verifier cleanup errors.
  }
  phoneRecaptchaVerifier = null
}

function getPhoneRecaptchaVerifier(): RecaptchaVerifier {
  const container = document.getElementById(PHONE_RECAPTCHA_CONTAINER_ID)
  if (!container) {
    throw new Error("Không tìm thấy vùng xác thực OTP. Vui lòng tải lại trang.")
  }
  if (!phoneRecaptchaVerifier) {
    phoneRecaptchaVerifier = new RecaptchaVerifier(auth, PHONE_RECAPTCHA_CONTAINER_ID, {
      size: "invisible",
    })
  }
  return phoneRecaptchaVerifier
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  phone?: string
}

export const authService = {
  async getIdToken(forceRefresh = false): Promise<string | null> {
    return auth.currentUser ? auth.currentUser.getIdToken(forceRefresh) : null
  },

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
      return finishCredentialSignIn(cred, "password")
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập thất bại", "password"))
    }
  },

  async startPhoneSignIn(phone: string): Promise<void> {
    const normalizedPhone = normalizePhoneForFirebase(phone)
    if (!normalizedPhone) {
      throw new Error("Số điện thoại không hợp lệ. Ví dụ: 0901234567 hoặc +84901234567.")
    }

    try {
      phoneConfirmation = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        getPhoneRecaptchaVerifier()
      )
    } catch (err: any) {
      resetPhoneRecaptcha()
      throw new Error(
        friendlyError(err?.code, err?.message ?? "Gửi mã OTP thất bại", "phone")
      )
    }
  },

  async confirmPhoneSignIn(otp: string): Promise<User> {
    if (!phoneConfirmation) {
      throw new Error("Phiên OTP đã hết hạn. Vui lòng gửi lại mã.")
    }

    try {
      const cred = await phoneConfirmation.confirm(otp.trim())
      phoneConfirmation = null
      resetPhoneRecaptcha()
      return finishCredentialSignIn(cred, "phone", {
        phone: normalizePhone(cred.user.phoneNumber),
      })
    } catch (err: any) {
      throw new Error(
        friendlyError(err?.code, err?.message ?? "Xác nhận OTP thất bại", "phone")
      )
    }
  },

  async signUpWithEmail(input: SignUpInput): Promise<User> {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        input.email.trim(),
        input.password
      )
      if (input.name) {
        await updateProfile(cred.user, { displayName: input.name })
      }
      const idToken = await cred.user.getIdToken()
      const role = await fetchUserRole(cred.user)
      const user = syncStoreFromFirebaseUser(cred.user, role)
      user.name = input.name || user.name
      user.phone = normalizePhone(input.phone)
      await ensureUserProfile(cred.user, {
        name: input.name,
        phone: input.phone,
        provider: "password",
        role: "customer",
      })
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng ký thất bại", "signup"))
    }
  },

  async signInWithGoogle(redirectTo?: string): Promise<User> {
    return signInWithOAuthProvider(googleProvider, "google", redirectTo)
  },

  async signInWithFacebook(redirectTo?: string): Promise<User> {
    return signInWithOAuthProvider(facebookProvider, "facebook", redirectTo)
  },

  async completeOAuthRedirect(): Promise<User | null> {
    try {
      const cred = await getRedirectResult(auth)
      if (!cred) return null
      consumeOAuthRedirectProvider()
      const provider =
        cred.providerId ||
        cred.user.providerData[0]?.providerId ||
        (cred.user.phoneNumber ? "phone" : "password")
      return finishCredentialSignIn(cred, provider)
    } catch (err: any) {
      console.error("[auth] OAuth redirect sign-in failed", {
        code: err?.code,
        message: err?.message,
        customData: err?.customData,
      })
      const context = consumeOAuthRedirectProvider()
      throw new Error(
        friendlyError(err?.code, err?.message ?? "Hoàn tất đăng nhập thất bại", context)
      )
    }
  },

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      })
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Gửi email thất bại", "reset"))
    }
  },

  async signOut(): Promise<void> {
    await fbSignOut(auth)
    useAuthStore.getState().logout()
  },

  async signInWithZaloCustomToken(
    customToken: string,
    profile?: { name?: string; picture?: string }
  ): Promise<User> {
    try {
      const cred = await signInWithCustomToken(auth, customToken)
      return finishCredentialSignIn(cred, "zalo", {
        name: profile?.name,
        avatar: profile?.picture,
      })
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập Zalo thất bại", "zalo"))
    }
  },

  /**
   * Subscribe to Firebase auth state changes. Returns an unsubscribe fn.
   * App.tsx should call this once at startup so the Zustand store stays
   * in sync after page reloads.
   */
  subscribe(onChange?: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken()
          const role = await fetchUserRole(fbUser)
          const user = syncStoreFromFirebaseUser(fbUser, role)

          // Mark auth as resolved before optional profile sync. Firestore
          // writes can be blocked by rules; they must not leave portal guards
          // spinning forever after Firebase has already restored the session.
          useAuthStore.getState().setUser(user, idToken)
          onChange?.(user)

          ensureUserProfile(fbUser, { role }).catch((err) => {
            console.warn("[auth] profile sync skipped after session restore", err)
          })
        } catch (err) {
          console.error("[auth] failed to restore session", err)
          useAuthStore.getState().logout()
          onChange?.(null)
        }
      } else {
        useAuthStore.getState().logout()
        onChange?.(null)
      }
    })
  },
}
