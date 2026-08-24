import { describe, expect, it, vi } from 'vitest'
import { fetchBpsJson } from './bps-fetch'

describe('BPS bounded fetch', () => {
  it('retries rate limits and transient server errors', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 429 }))
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(Response.json({ status: 'OK' }))
    const pause = vi.fn().mockResolvedValue(undefined)
    await expect(fetchBpsJson(new URL('https://webapi.bps.go.id/test'), { fetcher, pause })).resolves.toEqual({
      status: 'OK',
    })
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(pause).toHaveBeenCalledTimes(2)
  })

  it('does not retry permanent client errors', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 400 }))
    await expect(fetchBpsJson(new URL('https://webapi.bps.go.id/test'), { fetcher, pause: vi.fn() })).rejects.toThrow(
      'BPS_HTTP_400',
    )
    expect(fetcher).toHaveBeenCalledOnce()
  })
})
