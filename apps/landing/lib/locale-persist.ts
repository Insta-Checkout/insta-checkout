/**
 * Registers a callback to persist locale changes to the backend (seller profile).
 * Used when the user is logged in — changing language updates preferredLocale.
 */
import type { Locale } from "@insta-checkout/i18n";

let persistCallback: ((locale: Locale) => void) | null = null;

export function registerLocalePersist(cb: ((locale: Locale) => void) | null) {
  persistCallback = cb;
}

export function getLocalePersist(): ((locale: Locale) => void) | null {
  return persistCallback;
}
