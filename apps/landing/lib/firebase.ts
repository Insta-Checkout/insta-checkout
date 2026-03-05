import { initializeApp } from "firebase/app"
import { getAnalytics, type Analytics } from "firebase/analytics"
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

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

/** Firebase Analytics — only available in the browser (returns null during SSR). */
export const analytics: Analytics | null =
  typeof window !== "undefined" ? getAnalytics(app) : null

/** Firebase Auth — for seller registration (Google + email/password). */
export const auth = getAuth(app)
export const googleAuthProvider = new GoogleAuthProvider()

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleAuthProvider)
  return result.user
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function signOutUser(): Promise<void> {
  await signOut(auth)
}

const storage = getStorage(app)

/** Max product image size: 5 MB */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024

/** Generate a short random ID for collision avoidance */
function shortId(): string {
  return Math.random().toString(36).slice(2, 10)
}

/**
 * Upload a product image to Firebase Storage.
 * Path: products/{firebaseUid}/{productId}_{timestamp}_{shortId}.ext
 * or products/{firebaseUid}/new_{timestamp}_{shortId}.ext when creating.
 * Product link is stored in MongoDB (Product.imageUrl).
 */
export async function uploadProductImage(
  file: File,
  firebaseUid: string,
  productId?: string | null
): Promise<string> {
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error(`Image must be under ${MAX_PRODUCT_IMAGE_BYTES / 1024 / 1024} MB`)
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const prefix = productId ? productId : "new"
  const path = `products/${firebaseUid}/${prefix}_${Date.now()}_${shortId()}.${ext}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}
