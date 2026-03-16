"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type Locale,
  LOCALE_DIR,
  LOCALE_LANG,
  MESSAGES,
  getNested,
  interpolate,
  DEFAULT_LOCALE,
  LOCALES,
} from "@insta-checkout/i18n";

const COOKIE_NAME = "locale";

function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match?.[1];
  if (value === "en" || value === "ar") return value;
  return DEFAULT_LOCALE;
}

function setLocaleCookie(locale: Locale): void {
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=31536000`;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
  t: (key: string, vars?: Record<string, string>) => string;
  get: <T = unknown>(key: string) => T | undefined;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getLocaleFromCookie());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    html.lang = LOCALE_LANG[locale];
    html.dir = LOCALE_DIR[locale];
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      const messages = MESSAGES[locale] as Record<string, unknown>;
      const value = getNested<string>(messages, key);
      if (value == null) return key;
      return vars ? interpolate(value, vars) : value;
    },
    [locale]
  );

  const get = useCallback(
    <T,>(key: string): T | undefined => {
      const messages = MESSAGES[locale] as Record<string, unknown>;
      return getNested<T>(messages, key);
    },
    [locale]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, dir: LOCALE_DIR[locale], t, get }),
    [locale, setLocale, t, get]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useTranslations() {
  const { t, get, locale, setLocale } = useLocale();
  return { t, get, locale, setLocale, locales: LOCALES };
}
