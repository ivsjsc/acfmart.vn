// Compatibility shim — single source of truth lives in src/lib/firebase.ts.
// Re-exports here keep older import paths working without re-initializing Firebase.
export { auth, db, storage, googleProvider, default } from '../lib/firebase';
