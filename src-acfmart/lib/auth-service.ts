import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth, googleProvider, facebookProvider } from "./firebase"
import { useAuthStore, type User, type UserRole } from "../stores/auth-store"

/**
 * Map a Firebase user to the app's internal User type, syncing the
 * Zustand auth store as a side-effect.
 */
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
  // Token kept on Firebase side; pass empty here so SDK refresh handles it.
  return user
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
      const user = syncStoreFromFirebaseUser(cred.user)
      useAuthStore.getState().setUser(user, idToken)
      return user
    } catch (err: any) {
      throw new Error(friendlyError(err?.code, err?.message ?? "Đăng nhập thất bại"))
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
      const user = syncStoreFromFirebaseUser(cred.user)
      user.name = input.name || user.name
      user.phone = input.phone
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
      const user = syncStoreFromFirebaseUser(cred.user)
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
      const user = syncStoreFromFirebaseUser(cred.user)
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

  /**
   * Subscribe to Firebase auth state changes. Returns an unsubscribe fn.
   * App.tsx should call this once at startup so the Zustand store stays
   * in sync after page reloads.
   */
  subscribe(onChange?: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken()
        const user = syncStoreFromFirebaseUser(fbUser)
        useAuthStore.getState().setUser(user, idToken)
        onChange?.(user)
      } else {
        useAuthStore.getState().logout()
        onChange?.(null)
      }
    })
  },
}
