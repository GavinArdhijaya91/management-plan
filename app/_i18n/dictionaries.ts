export const localeCodes = ['id', 'ja', 'en', 'es', 'fr', 'de'] as const
export type Locale = (typeof localeCodes)[number]
export type Continent = 'Asia' | 'America' | 'Europe'

export interface LocaleOption {
  code: Locale
  continent: Continent
  country: string
  label: string
  shortLabel: string
}

export const localeOptions: LocaleOption[] = [
  { code: 'id', continent: 'Asia', country: 'Indonesia', label: 'Bahasa Indonesia', shortLabel: 'ID' },
  { code: 'ja', continent: 'Asia', country: 'Japan', label: '日本語', shortLabel: 'JA' },
  { code: 'en', continent: 'America', country: 'United States', label: 'English', shortLabel: 'EN' },
  { code: 'es', continent: 'America', country: 'Mexico', label: 'Español', shortLabel: 'ES' },
  { code: 'fr', continent: 'Europe', country: 'France', label: 'Français', shortLabel: 'FR' },
  { code: 'de', continent: 'Europe', country: 'Germany', label: 'Deutsch', shortLabel: 'DE' },
]

export type Dictionary = {
  language: { change: string; title: string; region: string }
  nav: {
    planning?: string
    dashboard: string
    management: string
    calendar: string
    collaboration: string
    market: string
    community: string
    contact: string
    profile: string
  }
  header: {
    mainNavigation: string
    mobileNavigation: string
    openNotifications: string
    openProfile: string
    openMenu: string
    closeMenu: string
    notifications: string
    stockAlert: string
    stockDetail: string
    viewAll: string
    businessOwner: string
    profileSettings: string
    logout: string
    logoutTitle: string
    logoutDescription: string
  }
}

export function isLocale(value: string | null): value is Locale {
  return localeCodes.includes(value as Locale)
}

// Dynamic import map — only the active locale chunk is loaded on the client
const dictionaryLoaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  id: () => import('./dictionaries/id'),
  ja: () => import('./dictionaries/ja'),
  en: () => import('./dictionaries/en'),
  es: () => import('./dictionaries/es'),
  fr: () => import('./dictionaries/fr'),
  de: () => import('./dictionaries/de'),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaryLoaders[locale] ?? dictionaryLoaders.id
  const mod = await loader()
  return mod.default
}

// Static dictionaries kept for tests and sync fallback.
// New code should use getDictionary() for code splitting.
import id from './dictionaries/id'
import ja from './dictionaries/ja'
import en from './dictionaries/en'
import es from './dictionaries/es'
import fr from './dictionaries/fr'
import de from './dictionaries/de'

export const dictionaries: Record<Locale, Dictionary> = { id, ja, en, es, fr, de }