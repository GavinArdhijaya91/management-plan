export async function fetchBpsJson(
  url: URL,
  options: { attempts?: number; fetcher?: typeof fetch; pause?: (milliseconds: number) => Promise<void> } = {},
) {
  const attempts = options.attempts ?? 3
  const fetcher = options.fetcher ?? fetch
  const pause = options.pause ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)))
  let lastStatus = 500

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetcher(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Siapin factual-market-ingestion/1.0' },
      signal: AbortSignal.timeout(15_000),
    })
    if (response.ok) return response.json()
    lastStatus = response.status
    if (response.status !== 429 && response.status < 500) break
    if (attempt < attempts) await pause(250 * 2 ** (attempt - 1))
  }
  throw new Error(`BPS_HTTP_${lastStatus}`)
}
