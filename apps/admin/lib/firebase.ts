import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyA9TMIAeSxsNDz04NsPu-IF81iGHyEDXh4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "instacheckout-a4141.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "instacheckout-a4141",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "instacheckout-a4141.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "599990409713",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:599990409713:web:fabbcff4595974b1fb4c50",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-CT2XQSKQ0K",
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}
