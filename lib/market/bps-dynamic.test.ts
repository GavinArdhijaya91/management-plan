import { describe, expect, it } from 'vitest'
import { buildBpsDynamicUrl, parseBpsDynamicBinding, parseBpsDynamicResponse } from './bps-dynamic'

const binding = parseBpsDynamicBinding('model=data&domain=0000&var=145&th=100&turvar=289&vervar=9999&turth=0')
const payload = {
  status: 'OK',
  'data-availability': 'available',
  var: [{ val: 145, label: 'Persentase Rumah Tangga', unit: 'Persen' }],
  turvar: [{ val: 289, label: 'Listrik PLN' }],
  labelvervar: 'Provinsi',
  vervar: [{ val: 9999, label: 'INDONESIA' }],
  tahun: [{ val: 100, label: '2000' }],
  turtahun: [{ val: 0, label: 'Tahun' }],
  datacontent: { '99991452891000': 83.68 },
}

describe('BPS dynamic data adapter', () => {
  it('accepts only explicit documented dimensions', () => {
    expect(binding.var).toBe('145')
    expect(() => parseBpsDynamicBinding('model=data&domain=0000&var=145&th=100&key=secret')).toThrow()
    expect(() => parseBpsDynamicBinding('model=data&domain=0000&var=all&th=100')).toThrow()
  })

  it('keeps the token out of evidence URLs', () => {
    expect(buildBpsDynamicUrl(binding, 'secret').searchParams.get('key')).toBe('secret')
    expect(buildBpsDynamicUrl(binding).searchParams.has('key')).toBe(false)
  })

  it('decodes documented dimension keys into attributed observations', () => {
    expect(parseBpsDynamicResponse(payload, binding)).toEqual([
      expect.objectContaining({
        metricCode: 'bps.var.145.turvar.289.vervar.9999',
        numericValue: 83.68,
        observedAt: '2000-01-01T00:00:00+07:00',
        sourceRecordId: 'data:99991452891000',
        unitCode: 'persen',
      }),
    ])
  })

  it('fails closed when a populated content key cannot be reconstructed', () => {
    expect(() => parseBpsDynamicResponse({ ...payload, datacontent: { unknown: 1 } }, binding)).toThrow(
      'BPS_DIMENSION_KEY_UNKNOWN',
    )
  })

  it('rejects nonnumeric values and unsupported derived periods', () => {
    expect(() =>
      parseBpsDynamicResponse({ ...payload, datacontent: { '99991452891000': 'rahasia' } }, binding),
    ).toThrow('BPS_VALUE_NON_NUMERIC')
    expect(() => parseBpsDynamicResponse({ ...payload, turtahun: [{ val: 99, label: 'Lainnya' }] }, binding)).toThrow()
  })
})
