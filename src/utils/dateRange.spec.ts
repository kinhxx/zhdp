import { resolveDateRange } from './dateRange'

describe('resolveDateRange', () => {
  const now = new Date(2026, 8, 3, 10, 0, 0)

  it('uses 2024-01-01 for cumulative range', () => {
    expect(resolveDateRange('all', now)).toEqual({ startTime: '2024-01-01', endTime: '2026-09-03' })
  })

  it('resolves month and year starts', () => {
    expect(resolveDateRange('month', now).startTime).toBe('2026-09-01')
    expect(resolveDateRange('year', now).startTime).toBe('2026-01-01')
  })

  it('uses Monday as the first day of the week', () => {
    expect(resolveDateRange('week', now).startTime).toBe('2026-08-31')
  })
})
