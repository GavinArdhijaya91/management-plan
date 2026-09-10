'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { getDictionary, type Dictionary, type Locale } from './dictionaries'
import { LOCALE_COOKIE, LOCALE_STORAGE_KEY } from './locale'
import { isLocale } from './dictionaries'
import { matchLocale } from './locale'

const CHANGE_EVENT = 'siapin:locale-change'

interface LanguageContextValue {
  dictionary: Dictionary
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getCookieLocale(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1] ?? '') : null
}

function setCookieLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

function getStorageLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return isLocale(stored) ? stored : null
}

function getBrowserLocale(): Locale | null {
  if (typeof navigator === 'undefined') return null
  const languages = navigator.languages ? [...navigator.languages] : navigator.language ? [navigator.language] : []
  return matchLocale(languages)
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function LanguageProvider({
  children,
  initialLocale,
  initialDictionary,
}: {
  children: React.ReactNode
  initialLocale?: Locale
  initialDictionary?: Dictionary
}) {
  const getSnapshot = useCallback((): Locale => {
    const storage = getStorageLocale()
    if (storage) return storage
    const cookie = getCookieLocale()
    if (isLocale(cookie)) return cookie as Locale
    // Fallback to browser language when no explicit choice yet (cross-device first visit)
    const browser = getBrowserLocale()
    if (browser) return browser
    return initialLocale ?? 'id'
  }, [initialLocale])

  const getServerSnapshot = useCallback((): Locale => initialLocale ?? 'id', [initialLocale])

  const locale = useSyncExternalStore<Locale>(subscribe, getSnapshot, getServerSnapshot)

  const [dictionary, setDictionary] = useState<Dictionary>(() => {
    // Initial render uses server-provided dictionary to avoid flash
    if (initialDictionary) return initialDictionary
    throw new Error('LanguageProvider requires initialDictionary')
  })

  useEffect(() => {
    if (locale === initialLocale) return
    let cancelled = false
    getDictionary(locale).then((dict) => {
      if (!cancelled) setDictionary(dict)
    })
    return () => {
      cancelled = true
    }
  }, [locale, initialLocale])

  const setLocale = useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    setCookieLocale(nextLocale)
    window.dispatchEvent(new Event(CHANGE_EVENT))
    // Ensure server-side rendering on next navigation/refresh uses the new locale
    // and that browser translation/cache sees the change as user preference
    try {
      // Refresh cookie sync without full reload - next request will carry new cookie
      if (typeof document !== 'undefined') {
        document.documentElement.lang = nextLocale
      }
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const cookie = getCookieLocale()
    const storage = getStorageLocale()
    if (storage && cookie !== storage) {
      setCookieLocale(storage)
    } else if (!storage && isLocale(cookie)) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, cookie as Locale)
    } else if (!storage && !isLocale(cookie)) {
      // First visit: persist browser language as explicit choice for cross-device consistency
      const browser = getBrowserLocale()
      if (browser && browser !== initialLocale) {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, browser)
        setCookieLocale(browser)
        window.dispatchEvent(new Event(CHANGE_EVENT))
      }
    }
  }, [initialLocale])

  const value = useMemo(() => ({ dictionary, locale, setLocale }), [dictionary, locale, setLocale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.')
  return context
}
