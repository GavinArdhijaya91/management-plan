import { describe, expect, it } from 'vitest'
import { GET } from './route'

describe('public health endpoint', () => {
  it('returns only non-sensitive liveness data', async () => {
    const response = GET()
    const body = await response.json()

    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body).toEqual({
      data: {
        service: 'management-plan-api',
        status: 'ok',
      },
    })
    expect(JSON.stringify(body)).not.toMatch(/database|environment|timestamp|supabase|secret/i)
  })
})
