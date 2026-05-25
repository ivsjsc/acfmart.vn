import { initializeApp, type FirebaseOptions } from "firebase/app"
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics"
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"

const DEFAULT_AUTH_DOMAIN = "ecommerce-acf.firebaseapp.com"

/**
 * Resolve Firebase authDomain.
 *
 * Using the default `.firebaseapp.com` domain ensures the OAuth redirect URI
 * (`https://<authDomain>/__/auth/handler`) is auto-registered in Google Cloud
 * Console. Custom-domain authDomain requires MANUAL registration of every
 * `https://<custom>/__/auth/handler` URI — without it Google/Facebook popup
 * fails with `auth/invalid-credential`.
 *
 * Firebase SDK v10+ uses postMessage for cross-origin popup communication,
 * so COOP/third-party-cookie issues do not apply even when authDomain differs
 * from the hosting domain.
 *
 * To switch to custom-domain auth later:
 *   1. Add every `https://<domain>/__/auth/handler` to Google Cloud Console →
 *      APIs & Services → Credentials → OAuth 2.0 Client → Authorized redirect URIs.
 *   2. Set VITE_FIREBASE_AUTH_DOMAIN to the desired domain, or restore the
 *      hostname-matching logic below.
 */
function resolveAuthDomain(): string {
  return import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_AUTH_DOMAIN
}

/**
 * Firebase config — Web API keys are NOT secrets per Firebase docs:
 * https://firebase.google.com/docs/projects/api-keys
 *
 * OAuth redirect must use the same Firebase Hosting domain that serves the
 * app; otherwise modern browsers can block the redirect helper storage.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBwC9zPd5ucjua62yjiD5yylonreuXE_TA",
  authDomain: resolveAuthDomain(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "ecommerce-acf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "ecommerce-acf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "748453055972",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:748453055972:web:23848e85ceaab378e84bf1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-769E7G0QSE",
}

export const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
auth.languageCode = "vi"

export const firestore = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)
export const functions = getFunctions(firebaseApp, "asia-southeast1")

// OAuth providers
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export const facebookProvider = new FacebookAuthProvider()
facebookProvider.addScope("public_profile")
facebookProvider.addScope("email")
facebookProvider.setCustomParameters({ display: "popup" })

// Analytics — only enable when supported (no SSR, no test env)
export const analyticsPromise = analyticsSupported().then((supported) =>
  supported ? getAnalytics(firebaseApp) : null
)
