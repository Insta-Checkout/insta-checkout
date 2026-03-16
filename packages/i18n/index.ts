/**
 * Shared i18n for InstaCheckout apps.
 * All user-facing copy lives in packages/i18n/messages/{en,ar}.json
 * Edit those files to change copy across landing and checkout apps.
 */

import enMessages from "./messages/en.json";
import arMessages from "./messages/ar.json";

export type Locale = "en" | "ar";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const LOCALE_LANG: Record<Locale, string> = {
  en: "en",
  ar: "ar",
};

export type Messages = Record<string, unknown>;

export const MESSAGES: Record<Locale, Messages> = {
  en: enMessages as Messages,
  ar: arMessages as Messages,
};

export function getNested<T = unknown>(obj: Record<string, unknown>, path: string): T | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current as T;
}

export function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
