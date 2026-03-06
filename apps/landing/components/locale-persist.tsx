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
        const res = await fetchWithAuth(
          `${getBackendUrl()}/sellers/me`,
          {},
          getToken
        );
        if (res.ok) {
          const data = await res.json();
          const preferred = data.preferredLocale;
          if (preferred === "ar" || preferred === "en") {
            // Don't overwrite if user just changed locale (within last 2s)
            if (Date.now() - lastUserChangeAt.current > 2000) {
              setLocale(preferred, { persist: false });
            }
          } else {
            // New seller: persist current cookie to backend so it sticks on next login
            const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
            const cookieLocale = match?.[1];
            if (cookieLocale === "ar" || cookieLocale === "en") {
              await fetchWithAuth(
                `${getBackendUrl()}/sellers/me`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ preferredLocale: cookieLocale }),
                },
                getToken
              );
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
