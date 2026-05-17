import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCustomToken,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import {
  doc,
  getDoc,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { auth, googleProvider, facebookProvider, firestore } from "./firebase"
import { useAuthStore, type User, type UserRole } from "../stores/auth-store"

/**
 * Map a Firebase user to the app's internal User type, syncing the
 * Zustand auth store as a side-effect.
 */
function isValidRole(role: unknown): role is UserRole {
  return (
    typeof role === "string" &&
    ["customer", "seller", "carrier", "moderator", "admin", "owner"].includes(role)
  )
}

async function fetchUserRole(fbUser: FirebaseUser): Promise<UserRole> {
  try {
    const token = await fbUser.getIdTokenResult(true)
    const claimRole = token.claims.role
    if (isValidRole(claimRole)) {
      return claimRole
    }
  } catch {
    // Fall back to Firestore role below.
  }

  try {
    const userDoc = await getDoc(doc(firestore, "users", fbUser.uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      if (isValidRole(data?.role)) {
        return data.role as UserRole
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

function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? "").replace(/[^\d+]/g, "")
}

async function ensureUserProfile(
  fbUser: FirebaseUser,
  overrides: { name?: string; phone?: string; provider?: string; avatar?: string } = {}
): Promise<void> {
  const userRef = doc(firestore, "users", fbUser.uid)
  const snap = await getDoc(userRef)
  const provider =
    overrides.provider ||
    fbUser.providerData[0]?.providerId ||
    (fbUser.phoneNumber ? "phone" : "password")

  const phone = normalizePhone(overrides.phone ?? fbUser.phoneNumber)
  const avatar = overrides.avatar ?? fbUser.photoURL ?? undefined
  const baseProfile: Record<string, unknown> = {
    email: fbUser.email ?? "",
    name:
      overrides.name?.trim() ||
      fbUser.displayName ||
      fbUser.email?.split("@")[0] ||
      "Khách hàng",
    auth_provider: provider,
    updated_at: serverTimestamp(),
  }
  if (phone) baseProfile.phone = phone
  if (avatar) baseProfile.avatar = avatar

  if (snap.exists()) {
    await setDoc(userRef, baseProfile, { merge: true })
    return
  }

  await setDoc(userRef, {
    ...baseProfile,
    avatar: baseProfile.avatar ?? null,
    phone: baseProfile.phone ?? "",
    role: "customer",
    created_at: serverTimestamp(),
  })
}

function friendlyError(code: string | undefined, fallback: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Email không hợp lệ"
    case "auth/user-disabled":
      return "Tài khoản đã bị vô hiệu hoá"
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không đúng"
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng"
    case "auth/weak-password":
      return "Mật khẩu phải tối thiểu 6 ký tự"
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Bạn đã đóng cửa sổ đăng nhập"
    case "auth/network-request-failed":
      return "Không có kết nối mạng. Vui lòng thử lại."
    case "auth/too-many-requests":
      return "Quá nhiều lần thử. Vui lòng đợi vài phút."
    case "auth/invalid-phone-number":
      return "Số điện thoại không hợp lệ"
    case "auth/phone-number-not-found":
      return "Không tìm thấy tài khoản với số điện thoại này"
    default:
      return fallback
  }
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
      const idToken = await cred.user.getIdToken()
      const role = await fetchUserRole(cred.user)
      const user = syncStoreFromFirebaseUser(cred.user, role)
      await ensureUserProfile(cred.user, { provider: "password" })
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập thất bại"))
    }
  },

  async signInWithPhone(phone: string, password: string): Promise<User> {
    try {
      // In a real implementation, you would likely use Firebase's phone authentication
      // which involves SMS verification. For this example, we'll simulate finding
      // a user by phone number in our database and authenticating them.
      
      // First, find user by phone number in Firestore
      const normalizedPhone = normalizePhone(phone)
      const q = query(collection(firestore, "users"), where("phone", "==", normalizedPhone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Không tìm thấy tài khoản với số điện thoại này");
      }
      
      // Since phone numbers should be unique, we expect only one result
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Then use the standard email/password sign in
      // In a real app, you'd implement proper phone authentication with OTP
      const email = userData.email || `${phone}@phone.auth`;
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await cred.user.getIdToken()
      const role = await fetchUserRole(cred.user)
      const user = syncStoreFromFirebaseUser(cred.user, role)
      await ensureUserProfile(cred.user, { phone: normalizedPhone, provider: "password" })
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập bằng số điện thoại thất bại"))
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
      })
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng ký thất bại"))
    }
  },

  async signInWithGoogle(): Promise<User> {
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const idToken = await cred.user.getIdToken()
      const role = await fetchUserRole(cred.user)
      const user = syncStoreFromFirebaseUser(cred.user, role)
      await ensureUserProfile(cred.user, { provider: "google.com" })
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập Google thất bại"))
    }
  },

  async signInWithFacebook(): Promise<User> {
    try {
      const cred = await signInWithPopup(auth, facebookProvider)
      const idToken = await cred.user.getIdToken()
      const role = await fetchUserRole(cred.user)
      const user = syncStoreFromFirebaseUser(cred.user, role)
      await ensureUserProfile(cred.user, { provider: "facebook.com" })
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập Facebook thất bại"))
    }
  },

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      })
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Gửi email thất bại"))
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
      const idToken = await cred.user.getIdToken()
      const role = await fetchUserRole(cred.user)
      const user = syncStoreFromFirebaseUser(cred.user, role)
      user.name = profile?.name ?? user.name
      user.avatar = profile?.picture ?? user.avatar
      await ensureUserProfile(cred.user, {
        name: user.name,
        provider: "zalo",
        avatar: user.avatar,
      })
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập Zalo thất bại"))
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
        const idToken = await fbUser.getIdToken()
        const role = await fetchUserRole(fbUser)
        const user = syncStoreFromFirebaseUser(fbUser, role)
        await ensureUserProfile(fbUser)
        useAuthStore.getState().setUser(user, idToken)
        onChange?.(user)
      } else {
        useAuthStore.getState().logout()
        onChange?.(null)
      }
    })
  },
}
