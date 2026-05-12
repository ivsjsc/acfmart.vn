import { initializeApp, type FirebaseOptions } from "firebase/app"
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics"
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

/**
 * Firebase config — Web API keys are NOT secrets per Firebase docs:
 * https://firebase.google.com/docs/projects/api-keys
 *
 * Security is enforced via Firestore rules, App Check, and Auth domain
 * whitelist. We still load via env vars to keep the value swappable
 * between dev/staging/prod.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBwC9zPd5ucjua62yjiD5yylonreuXE_TA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "ecommerce-acf.firebaseapp.com",
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

// OAuth providers
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export const facebookProvider = new FacebookAuthProvider()

// Analytics — only enable when supported (no SSR, no test env)
export const analyticsPromise = analyticsSupported().then((supported) =>
  supported ? getAnalytics(firebaseApp) : null
)
