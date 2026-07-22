import { describe, expect, it } from 'vitest'
import { dictionaries, isLocale, localeCodes, localeOptions } from './dictionaries'

describe('language dictionaries', () => {
  it('provides one dictionary and selector option for every locale', () => {
    expect(Object.keys(dictionaries).sort()).toEqual([...localeCodes].sort())
    expect(localeOptions.map((option) => option.code).sort()).toEqual([...localeCodes].sort())
  })

  it('provides complete navigation labels for every locale', () => {
    const requiredKeys = ['dashboard', 'management', 'calendar', 'market', 'contact', 'profile']
    for (const dictionary of Object.values(dictionaries)) {
      expect(Object.keys(dictionary.nav).sort()).toEqual(requiredKeys.sort())
      expect(Object.values(dictionary.nav).every((label) => label.trim().length > 0)).toBe(true)
    }
  })

  it('groups the initial languages across the three supported continents', () => {
    expect(new Set(localeOptions.map((option) => option.continent))).toEqual(new Set(['Asia', 'America', 'Europe']))
  })

  it('rejects unknown stored locales', () => {
    expect(isLocale('ja')).toBe(true)
    expect(isLocale('unknown')).toBe(false)
    expect(isLocale(null)).toBe(false)
  })
})
