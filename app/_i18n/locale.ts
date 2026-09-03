import { isLocale, type Locale } from './dictionaries'

export const LOCALE_COOKIE = 'siapin_locale'
export const LOCALE_STORAGE_KEY = 'siapin:locale'
export const DEFAULT_LOCALE: Locale = 'id'

interface ParsedLanguage {
  tag: string
  q: number
  index: number
}

/**
 * Parse Accept-Language header into ordered list of language tags.
 * Pure function — no side effects, no Next.js dependency.
 * Example: "en-US,en;q=0.9,id;q=0.8" -> ["en-US", "en", "id"]
 */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header || typeof header !== 'string') return []
  const raw = header.trim()
  if (raw.length === 0) return []

  const parts = raw.split(',')
  const parsed: ParsedLanguage[] = []

  for (let i = 0; i < parts.length; i += 1) {
    const segment = parts[i].trim()
    if (segment.length === 0) continue

    const [rawTag, ...params] = segment.split(';')
    const tag = rawTag.trim()
    if (tag.length === 0 || tag === '*') continue

    let q = 1
    for (const param of params) {
      const trimmed = param.trim()
      if (trimmed.startsWith('q=')) {
        const qValue = Number.parseFloat(trimmed.slice(2))
        if (!Number.isNaN(qValue) && qValue >= 0 && qValue <= 1) {
          q = qValue
        }
        break
      }
    }

    if (q === 0) continue

    parsed.push({ tag, q, index: i })
  }

  parsed.sort((a, b) => {
    if (b.q !== a.q) return b.q - a.q
    return a.index - b.index
  })

  return parsed.map((entry) => entry.tag)
}

/**
 * Match ordered language tags to supported locales.
 * Handles region stripping: "en-US" -> "en"
 */
export function matchLocale(tags: string[]): Locale | null {
  for (const tag of tags) {
    const normalized = tag.toLowerCase()
    // direct match
    const direct = normalized as Locale
    if (isLocale(direct)) return direct

    // region stripping: en-US -> en, id-ID -> id
    const base = normalized.split('-')[0] ?? ''
    if (isLocale(base)) return base as Locale
  }
  return null
}

/**
 * Resolve locale with priority:
 * 1. Explicit cookie (user choice)
 * 2. Accept-Language header
 * 3. Default "id"
 * Pure function — caller provides already-extracted string values.
 */
export function resolveLocale({
  cookieLocale,
  acceptLanguageHeader,
}: {
  cookieLocale: string | null | undefined
  acceptLanguageHeader: string | null | undefined
}): Locale {
  if (isLocale(cookieLocale ?? null)) {
    return cookieLocale as Locale
  }

  const tags = parseAcceptLanguage(acceptLanguageHeader)
  const matched = matchLocale(tags)
  if (matched) return matched

  return DEFAULT_LOCALE
}
