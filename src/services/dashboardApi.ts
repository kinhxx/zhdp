import type { DateRange, FlightCountDto, FlightOverviewDto, FlyRecordPage, FlyRecordQuery, TaskOverviewDto, WorkOrderOverviewDto } from './types'
import { flightOverviewMock, flightStatisticsMock, flyRecordsMock, taskOverviewMock, workOrderOverviewMock } from './mock/fdeMockData'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export async function getFlightOverview(): Promise<FlightOverviewDto> {
  return clone(flightOverviewMock)
}

export async function getFlyRecords(params: FlyRecordQuery): Promise<FlyRecordPage> {
  let rows = clone(flyRecordsMock)
  if (params.flyRecordId) rows = rows.filter((item) => item.flyRecordId === params.flyRecordId)
  if (params.flyLineName) rows = rows.filter((item) => item.flyLineName.includes(params.flyLineName as string))
  if (params.shelterId) rows = rows.filter((item) => item.shelterId === params.shelterId)
  const total = rows.length
  const start = Math.max(0, (params.pageNum - 1) * params.pageSize)
  return { total, rows: rows.slice(start, start + params.pageSize), code: 200, msg: '查询成功' }
}

export async function getWorkOrderOverview(_range: DateRange): Promise<WorkOrderOverviewDto> {
  return clone(workOrderOverviewMock)
}

export async function getTaskOverview(_range: DateRange): Promise<TaskOverviewDto> {
  return clone(taskOverviewMock)
}

export async function getFlightStatistics(_range: DateRange): Promise<FlightCountDto> {
  return clone(flightStatisticsMock)
}
