export interface FlightOverviewDto {
  shelterNum: number
  flyLineNum: number
  achieveNum: number
  flyerNum: number
  workOrderNum: number
  recordCount: number
  flyPlaneNum: number
  flightLength: string
  durationHours: string
  routeId: number | null
}

export interface FlyRecordDto {
  flyRecordId: number
  flyRecordName: string
  flyLineId: number
  flyLineName: string
  flyerId: number
  flyerName: string
  createTime: string
  shelterId: number
  shelterName: string
}

export interface FlyRecordQuery {
  pageNum: number
  pageSize: number
  flyRecordId?: number | null
  flyLineName?: string | null
  shelterId?: number | null
}

export interface FlyRecordPage {
  total: number
  rows: FlyRecordDto[]
  code: number
  msg: string
}

export interface WorkOrderOverviewDto {
  deptId: number | null
  deptName: string | null
  workOrderTotalNum: number
  toReceiveNum: number
  receivedNum: number
  completedNum: number
  displayDate: string | null
  workOrderOverviewRespVos: WorkOrderOverviewDto[]
  secondWordOderDetails: WorkOrderOverviewDto[]
}

export interface TaskOverviewDto {
  deptId: number
  deptName: string
  taskTotalNum: number
  dispatchedNum: number
  dispatchingNum: number
  receivedNum: number
  completedNum: number
  dispatchedPercent: number
  dispatchingPercent: number
  receivedPercent: number
  completedPercent: number
  taskOverviewRespVoList: TaskOverviewDto[]
}

export interface FlightCountDto {
  deptId: number | null
  deptName: string | null
  recordCount: number
  flightLength: string
  durationHours: string
  displayDate: string | null
  countViewRespVos: FlightCountDto[]
  secondCountViewRespList: FlightCountDto[]
}

export interface DateRange {
  startTime: string
  endTime: string
}

export interface DeptRangeRequest extends DateRange {
  loginUserId: number
  loginDeptId: number
}
