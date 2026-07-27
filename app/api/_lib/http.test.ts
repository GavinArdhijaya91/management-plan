import { describe, expect, it } from 'vitest'
import { apiError, apiSuccess } from './http'

describe('API response boundary', () => {
  it('makes success responses non-cacheable and MIME-safe by default', async () => {
    const response = apiSuccess({ status: 'ok' })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    await expect(response.json()).resolves.toEqual({ data: { status: 'ok' } })
  })

  it('uses the stable public error envelope without exposing internals', async () => {
    const response = apiError('invalid_request', 'Request tidak valid.', 400)

    expect(response.status).toBe(400)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      error: { code: 'invalid_request', message: 'Request tidak valid.' },
    })
  })
})
