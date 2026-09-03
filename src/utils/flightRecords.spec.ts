import { sortFlyRecordsNewestFirst } from './flightRecords'
import type { FlyRecordDto } from '@/services/types'

const record = (id: number, createTime: string): FlyRecordDto => ({
  flyRecordId: id,
  flyRecordName: `记录${id}`,
  flyLineId: id,
  flyLineName: '航线飞行',
  flyerId: id,
  flyerName: '飞手',
  createTime,
  shelterId: id,
  shelterName: '方舱',
})

describe('sortFlyRecordsNewestFirst', () => {
  it('sorts records descending without mutating the input', () => {
    const input = [record(1, '2026-05-09 10:00:00'), record(2, '2026-05-13 10:00:00')]
    expect(sortFlyRecordsNewestFirst(input).map((item) => item.flyRecordId)).toEqual([2, 1])
    expect(input.map((item) => item.flyRecordId)).toEqual([1, 2])
  })
})
