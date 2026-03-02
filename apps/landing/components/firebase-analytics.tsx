"use client"

import { analytics } from "@/lib/firebase"

/**
 * Client component that initializes Firebase Analytics.
 * Importing this ensures analytics runs in the browser (not during SSR).
 */
export function FirebaseAnalytics() {
  void analytics // Ensures the module is loaded on the client
  return null
}
