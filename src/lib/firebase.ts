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

const FIREBASE_HOSTED_AUTH_DOMAINS = new Set([
  "acfmart.vn",
  "www.acfmart.vn",
  "acfmart.store",
  "www.acfmart.store",
  "acfmart.online",
  "www.acfmart.online",
  "acfmart.cloud",
  "www.acfmart.cloud",
  "acfmart.web.app",
  "acfmart.firebaseapp.com",
  "acfmartstore.web.app",
  "acfmartstore.firebaseapp.com",
  "acfmartonline.web.app",
  "acfmartonline.firebaseapp.com",
  "acfmartcloud.web.app",
  "acfmartcloud.firebaseapp.com",
])

function resolveAuthDomain(): string {
  const configured = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  if (configured) {
    return configured
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase()
    if (FIREBASE_HOSTED_AUTH_DOMAINS.has(hostname)) {
      return hostname
    }
  }
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
facebookProvider.setCustomParameters({ display: "popup" })

// Analytics — only enable when supported (no SSR, no test env)
export const analyticsPromise = analyticsSupported().then((supported) =>
  supported ? getAnalytics(firebaseApp) : null
)
