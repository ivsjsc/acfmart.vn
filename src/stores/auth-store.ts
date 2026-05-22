import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole =
  | "customer"
  | "seller"
  | "carrier"
  | "moderator"
  | "manager"
  | "admin"
  | "owner"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  isVerified: boolean
  phone?: string
  /**
   * Premium tier flag for sellers/shops who have upgraded their account.
   * Premium accounts get higher New Feed post quotas (and future perks).
   * Populated from `vendors/{uid}.kyc_level === "premium"` after login,
   * or set by admin tooling. Falsy for regular accounts.
   */
  isPremium?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  authResolved: boolean
  setUser: (user: User, token: string) => void
  logout: () => void
  updateUser: (partial: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      authResolved: false,
      setUser: (user, token) =>
        set({ user, token, isAuthenticated: true, authResolved: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, authResolved: true }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: "acfmart-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
