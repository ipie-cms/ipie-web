// Mirrors authStorage.ts's pattern: one localStorage key, defined in exactly one place, read
// directly by both the Redux slice (initial state) and the axios interceptor (no store import
// needed there, same reasoning authStorage.ts already documents for the auth token).

export const STORAGE_KEY = 'ipie.locale'

// Kept in lockstep with the backend's ipie.i18n.supported-locales default (English + Hindi) -
// see ipie-i18n-defaults.yml / IpieI18nProperties. Adding a language here without a matching
// backend bundle just falls back to English server-side per MessageResolver's own fallback, so
// this list is safe to extend ahead of full backend translation coverage.
export const SUPPORTED_LOCALES = ['en', 'hi'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

function isSupportedLocale(value: string | null): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

function browserDefaultLocale(): Locale {
  const browserLanguage = navigator.language?.split('-')[0] ?? null
  return isSupportedLocale(browserLanguage) ? browserLanguage : 'en'
}

export function loadStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isSupportedLocale(stored) ? stored : browserDefaultLocale()
}

export function saveStoredLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale)
}
