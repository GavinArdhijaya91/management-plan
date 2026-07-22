'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'
import { dictionaries, isLocale, type Dictionary, type Locale } from './dictionaries'

const STORAGE_KEY = 'siapin:locale'
const CHANGE_EVENT = 'siapin:locale-change'

interface LanguageContextValue {
  dictionary: Dictionary
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getSnapshot(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return isLocale(stored) ? stored : 'id'
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore<Locale>(subscribe, getSnapshot, () => 'id')
  const setLocale = useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, nextLocale)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => ({ dictionary: dictionaries[locale], locale, setLocale }), [locale, setLocale])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.')
  return context
}
