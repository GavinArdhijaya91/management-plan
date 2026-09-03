import { describe, expect, it } from 'vitest'
import { matchLocale, parseAcceptLanguage, resolveLocale } from './locale'

describe('parseAcceptLanguage', () => {
  it('parses simple header', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9,id;q=0.8')).toEqual(['en-US', 'en', 'id'])
  })

  it('sorts by q value descending and preserves order for equal q', () => {
    expect(parseAcceptLanguage('fr;q=0.5,de;q=0.9,en;q=0.9')).toEqual(['de', 'en', 'fr'])
  })

  it('handles wildcard and q=0', () => {
    expect(parseAcceptLanguage('en;q=0, fr, *;q=0.5')).toEqual(['fr'])
  })

  it('handles spaces and missing q', () => {
    expect(parseAcceptLanguage(' ja , en-US ; q=0.8 , id-ID ')).toEqual(['ja', 'id-ID', 'en-US'])
  })

  it('returns empty for null, undefined, empty, or invalid', () => {
    expect(parseAcceptLanguage(null)).toEqual([])
    expect(parseAcceptLanguage(undefined)).toEqual([])
    expect(parseAcceptLanguage('')).toEqual([])
    expect(parseAcceptLanguage('   ')).toEqual([])
  })

  it('ignores malformed q values', () => {
    expect(parseAcceptLanguage('en;q=invalid,fr')).toEqual(['en', 'fr'])
  })

  it('is case-preserving but match is case-insensitive via matchLocale', () => {
    expect(parseAcceptLanguage('EN-US, ID')).toEqual(['EN-US', 'ID'])
  })
})

describe('matchLocale', () => {
  it('matches direct locale codes', () => {
    expect(matchLocale(['en', 'id'])).toBe('en')
    expect(matchLocale(['fr'])).toBe('fr')
  })

  it('strips region and matches base', () => {
    expect(matchLocale(['en-US', 'ja-JP'])).toBe('en')
    expect(matchLocale(['id-ID'])).toBe('id')
    expect(matchLocale(['de-AT'])).toBe('de')
  })

  it('is case-insensitive', () => {
    expect(matchLocale(['EN-us'])).toBe('en')
    expect(matchLocale(['JA'])).toBe('ja')
  })

  it('returns null when no supported locale matches', () => {
    expect(matchLocale(['pt-BR', 'zh-CN'])).toBeNull()
    expect(matchLocale([])).toBeNull()
  })

  it('respects priority order of tags', () => {
    expect(matchLocale(['pt', 'es', 'fr'])).toBe('es')
    expect(matchLocale(['fr', 'es'])).toBe('fr')
  })
})

describe('resolveLocale priority', () => {
  it('priority 1: explicit cookie wins over Accept-Language', () => {
    expect(resolveLocale({ cookieLocale: 'ja', acceptLanguageHeader: 'en-US,en;q=0.9' })).toBe('ja')
    expect(resolveLocale({ cookieLocale: 'de', acceptLanguageHeader: 'fr;q=1' })).toBe('de')
  })

  it('priority 2: Accept-Language fallback when no valid cookie', () => {
    expect(resolveLocale({ cookieLocale: null, acceptLanguageHeader: 'en-US,en;q=0.9,id;q=0.8' })).toBe('en')
    expect(resolveLocale({ cookieLocale: undefined, acceptLanguageHeader: 'fr-FR,fr;q=0.9' })).toBe('fr')
    expect(resolveLocale({ cookieLocale: '', acceptLanguageHeader: 'es-MX,es;q=0.9' })).toBe('es')
  })

  it('invalid cookie falls back to Accept-Language', () => {
    expect(resolveLocale({ cookieLocale: 'xx', acceptLanguageHeader: 'de' })).toBe('de')
    expect(resolveLocale({ cookieLocale: 'invalid', acceptLanguageHeader: 'ja' })).toBe('ja')
  })

  it('priority 3: default to id when nothing matches', () => {
    expect(resolveLocale({ cookieLocale: null, acceptLanguageHeader: null })).toBe('id')
    expect(resolveLocale({ cookieLocale: null, acceptLanguageHeader: '' })).toBe('id')
    expect(resolveLocale({ cookieLocale: null, acceptLanguageHeader: 'pt-BR,zh;q=0.9' })).toBe('id')
    expect(resolveLocale({ cookieLocale: 'xx', acceptLanguageHeader: 'pt' })).toBe('id')
  })

  it('handles region variants in Accept-Language', () => {
    expect(resolveLocale({ cookieLocale: null, acceptLanguageHeader: 'en-GB,en;q=0.8' })).toBe('en')
    expect(resolveLocale({ cookieLocale: null, acceptLanguageHeader: 'id-ID,id;q=0.9,en;q=0.8' })).toBe('id')
  })

  it('pure function: same inputs always same output', () => {
    const input = { cookieLocale: 'fr', acceptLanguageHeader: 'en' }
    expect(resolveLocale(input)).toBe(resolveLocale(input))
  })
})
