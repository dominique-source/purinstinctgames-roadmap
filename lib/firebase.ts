import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

export const app = firebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

let authReady: Promise<User> | null = null;

// Anonymous auth gives every visitor a stable uid (persisted by the SDK),
// which is what the "sessions/{uid}" doc keys off to remember an unlock
// across reloads on the same device — no visible login screen.
export function ensureAnonymousAuth(): Promise<User> {
  if (!auth) return Promise.reject(new Error("Firebase not configured"));
  if (!authReady) {
    authReady = new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsub();
            resolve(user);
          }
        },
        (err) => {
          unsub();
          reject(err);
        }
      );
      signInAnonymously(auth).catch((err) => {
        unsub();
        reject(err);
      });
    });
  }
  return authReady;
}
