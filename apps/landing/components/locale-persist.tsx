"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getBackendUrl, fetchWithAuth } from "@/lib/api";
import { useLocale } from "@/lib/locale-provider";
import { registerLocalePersist } from "@/lib/locale-persist";

/**
 * Syncs locale with seller profile when user is logged in.
 * - On login: fetches preferredLocale from backend and applies it
 * - Registers persist callback so setLocale also updates backend
 * - On logout: unregisters persist callback
 */
export function LocalePersist() {
  const { setLocale } = useLocale();
  const lastUserChangeAt = useRef(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        registerLocalePersist(null);
        return;
      }

      const getToken = () => user.getIdToken();

      registerLocalePersist(async (locale) => {
        lastUserChangeAt.current = Date.now();
        try {
          await fetchWithAuth(
            `${getBackendUrl()}/sellers/me`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ preferredLocale: locale }),
            },
            getToken
          );
        } catch (e) {
          console.warn("[LocalePersist] Failed to save preferredLocale:", e);
        }
      });

      try {
        const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
        const cookieLocale = match?.[1];
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me`,
          {},
          getToken
        );
        if (res.ok) {
          const data = await res.json();
          const preferred = data.preferredLocale;
          // Prefer user's choice from landing page (cookie) over backend when they have a valid locale set.
          // This ensures the language they picked before signing in carries through to the dashboard.
          if (cookieLocale === "ar" || cookieLocale === "en") {
            // Explicitly apply cookie locale so the dashboard re-renders in the correct language
            setLocale(cookieLocale, { persist: false });
            // Sync cookie to backend so it persists for future sessions
            await fetchWithAuth(
              `${getBackendUrl()}/sellers/me`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ preferredLocale: cookieLocale }),
              },
              getToken
            );
          } else if (preferred === "ar" || preferred === "en") {
            // No cookie set; use backend preference
            if (Date.now() - lastUserChangeAt.current > 2000) {
              setLocale(preferred, { persist: false });
            }
          }
        }
      } catch (e) {
        console.warn("[LocalePersist] Failed to fetch preferredLocale:", e);
      }
    });

    return () => {
      unsub();
      registerLocalePersist(null);
    };
  }, [setLocale]);

  return null;
}
