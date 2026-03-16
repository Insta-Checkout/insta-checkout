"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

export function AuthRedirect(): null {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Refresh session cookie so middleware handles future visits
        try {
          const idToken = await user.getIdToken();
          await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch {
          // Cookie refresh failed — still redirect, middleware will miss next time
        }
        router.replace("/dashboard/home");
      }
    });
    return () => unsub();
  }, [router]);

  return null;
}
