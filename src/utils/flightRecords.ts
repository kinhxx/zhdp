import type { FlyRecordDto } from '@/services/types'

function toSortableTimestamp(value: string): number {
  return new Date(value.replace(' ', 'T')).getTime()
}

export function sortFlyRecordsNewestFirst(rows: FlyRecordDto[]): FlyRecordDto[] {
  return [...rows].sort((a, b) => toSortableTimestamp(b.createTime) - toSortableTimestamp(a.createTime))
}
