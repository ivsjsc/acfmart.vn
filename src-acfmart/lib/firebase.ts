import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

// Single source of truth — re-exported from src/config/firebase.config.js for back-compat.
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyBcg3prMPFHQHwNCi613VuLKUXnXpr7sxs",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "ecommerce-acf.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "ecommerce-acf",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "ecommerce-acf.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "748453055972",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:748453055972:web:7cad804bbeae4c24e84bf1",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-N9CEE9XWQE",
};

// Guard against duplicate initialization (HMR or multiple config files).
const app: FirebaseApp = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Analytics is optional and only enabled in production with a valid API key.
// In dev, Firebase Installations API would spam the console with expired-key errors.
export let analytics: Analytics | null = null;
if (import.meta.env?.PROD && import.meta.env?.VITE_ENABLE_ANALYTICS !== 'false') {
  isSupported()
    .then((ok) => {
      if (!ok) return;
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        console.warn('[firebase] Analytics disabled:', (err as Error).message);
      }
    })
    .catch(() => { /* noop */ });
}

export default app;
