const MAX_URLS = 5

const blockedContentPatterns: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /\b(?:pornografi|konten\s+porno|seks\s+eksplisit)\b/iu,
    message: 'Konten seksual eksplisit tidak diperbolehkan di komunitas.',
  },
  {
    pattern: /\b(?:judi\s+online|slot\s+gacor|casino\s+online)\b/iu,
    message: 'Promosi perjudian tidak diperbolehkan di komunitas.',
  },
]

const urlPattern = /(?:https?:\/\/|www\.)\S+/giu
const repeatedCharacterPattern = /(.)\1{11,}/u

export function normalizeCommunityText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}


export function inspectCommunityContent(values: string[]) {
  const content = values.filter(Boolean).join('\n')
  const blocked = blockedContentPatterns.find(({ pattern }) => pattern.test(content))
  if (blocked) return blocked.message

  const urlCount = content.match(urlPattern)?.length ?? 0
  if (urlCount > MAX_URLS) return `Maksimal ${MAX_URLS} tautan diperbolehkan dalam satu post.`

  for (const rawUrl of content.match(urlPattern) ?? []) {
    try {
      const url = new URL(rawUrl.startsWith('www.') ? `https://${rawUrl}` : rawUrl)
      const hostname = url.hostname.toLowerCase()
      if (url.username || url.password) return 'Tautan yang memuat kredensial tidak diperbolehkan.'
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.local') ||
        /^(?:127\.|10\.|192\.168\.|169\.254\.)/.test(hostname) ||
        /^172\.(?:1[6-9]|2\d|3[01])\./.test(hostname)
      )
        return 'Tautan menuju jaringan lokal tidak diperbolehkan.'
      if (hostname.includes('xn--')) return 'Tautan Unicode tersamar perlu ditulis menggunakan domain aslinya.'
    } catch {
      return 'Format tautan tidak valid.'
    }
  }

  if (repeatedCharacterPattern.test(content)) return 'Kurangi pengulangan karakter berlebihan agar post mudah dibaca.'

  for (const value of values) {
    const letters = [...value].filter((character) => /\p{L}/u.test(character))
    if (letters.length < 40) continue
    const uppercase = letters.filter(
      (character) =>
        character === character.toLocaleUpperCase('id-ID') && character !== character.toLocaleLowerCase('id-ID'),
    ).length
    if (uppercase / letters.length > 0.85) return 'Hindari penggunaan huruf kapital berlebihan agar post mudah dibaca.'
  }

  return null
}
