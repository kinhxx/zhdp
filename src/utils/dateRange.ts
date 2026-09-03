import type { DateRange } from '@/services/types'

export type TimePreset = 'today' | 'week' | 'month' | 'year' | 'all'

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function resolveDateRange(preset: TimePreset, now = new Date()): DateRange {
  const endTime = formatDate(now)
  if (preset === 'all') return { startTime: '2024-01-01', endTime }

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (preset === 'week') {
    const day = start.getDay() || 7
    start.setDate(start.getDate() - day + 1)
  } else if (preset === 'month') {
    start.setDate(1)
  } else if (preset === 'year') {
    start.setMonth(0, 1)
  }
  return { startTime: formatDate(start), endTime }
}
