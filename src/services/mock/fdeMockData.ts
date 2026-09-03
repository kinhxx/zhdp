import type { FlightCountDto, FlightOverviewDto, FlyRecordDto, TaskOverviewDto, WorkOrderOverviewDto } from '../types'

export const flightOverviewMock: FlightOverviewDto = {
  shelterNum: 11,
  flyLineNum: 48,
  achieveNum: 156,
  flyerNum: 12,
  workOrderNum: 50,
  recordCount: 168,
  flyPlaneNum: 60,
  flightLength: '1392.47',
  durationHours: '35.1',
  routeId: null,
}

export const flyRecordsMock: FlyRecordDto[] = [
  { flyRecordId: 1001, flyRecordName: '巡检飞行记录-东区线路', flyLineId: 2001, flyLineName: '指点飞行', flyerId: 3001, flyerName: '张三', createTime: '2026-05-09 10:30:00', shelterId: 4001, shelterName: '1号方舱' },
  { flyRecordId: 1002, flyRecordName: '巡检飞行记录-西区线路', flyLineId: 2002, flyLineName: '航线飞行', flyerId: 3002, flyerName: '李四', createTime: '2026-05-09 14:20:00', shelterId: 4002, shelterName: '2号方舱' },
  { flyRecordId: 1003, flyRecordName: '巡检飞行记录-南区线路', flyLineId: 2003, flyLineName: '指点飞行', flyerId: 3003, flyerName: '王五', createTime: '2026-05-10 09:15:00', shelterId: 4001, shelterName: '1号方舱' },
  { flyRecordId: 1004, flyRecordName: '巡检飞行记录-北区线路', flyLineId: 2004, flyLineName: '航线飞行', flyerId: 3001, flyerName: '张三', createTime: '2026-05-10 13:45:00', shelterId: 4003, shelterName: '3号方舱' },
  { flyRecordId: 1005, flyRecordName: '应急巡检-故障点A', flyLineId: 2005, flyLineName: '指点飞行', flyerId: 3004, flyerName: '赵六', createTime: '2026-05-11 08:00:00', shelterId: 4002, shelterName: '2号方舱' },
  { flyRecordId: 1006, flyRecordName: '日常巡检-中心区域', flyLineId: 2006, flyLineName: '航线飞行', flyerId: 3002, flyerName: '李四', createTime: '2026-05-11 16:30:00', shelterId: 4001, shelterName: '1号方舱' },
  { flyRecordId: 1007, flyRecordName: '夜间巡检-高压线路', flyLineId: 2007, flyLineName: '指点飞行', flyerId: 3003, flyerName: '王五', createTime: '2026-05-12 20:10:00', shelterId: 4004, shelterName: '4号方舱' },
  { flyRecordId: 1008, flyRecordName: '巡检飞行记录-变电站周边', flyLineId: 2008, flyLineName: '航线飞行', flyerId: 3004, flyerName: '赵六', createTime: '2026-05-12 11:25:00', shelterId: 4003, shelterName: '3号方舱' },
  { flyRecordId: 1009, flyRecordName: '巡检飞行记录-河流区域', flyLineId: 2009, flyLineName: '指点飞行', flyerId: 3001, flyerName: '张三', createTime: '2026-05-13 07:50:00', shelterId: 4002, shelterName: '2号方舱' },
  { flyRecordId: 1010, flyRecordName: '巡检飞行记录-山区线路', flyLineId: 2010, flyLineName: '航线飞行', flyerId: 3002, flyerName: '李四', createTime: '2026-05-13 15:40:00', shelterId: 4001, shelterName: '1号方舱' },
]

const emptyTaskChildren = () => [] as TaskOverviewDto[]
export const taskOverviewMock: TaskOverviewDto = {
  deptId: 100, deptName: '省公司', taskTotalNum: 120,
  dispatchedNum: 24, dispatchingNum: 36, receivedNum: 48, completedNum: 12,
  dispatchedPercent: 20, dispatchingPercent: 30, receivedPercent: 40, completedPercent: 10,
  taskOverviewRespVoList: [
    { deptId: 101, deptName: '市公司A', taskTotalNum: 50, dispatchedNum: 10, dispatchingNum: 15, receivedNum: 20, completedNum: 5, dispatchedPercent: 20, dispatchingPercent: 30, receivedPercent: 40, completedPercent: 10, taskOverviewRespVoList: emptyTaskChildren() },
    { deptId: 102, deptName: '市公司B', taskTotalNum: 40, dispatchedNum: 8, dispatchingNum: 12, receivedNum: 16, completedNum: 4, dispatchedPercent: 20, dispatchingPercent: 30, receivedPercent: 40, completedPercent: 10, taskOverviewRespVoList: emptyTaskChildren() },
    { deptId: 103, deptName: '市公司C', taskTotalNum: 30, dispatchedNum: 6, dispatchingNum: 9, receivedNum: 12, completedNum: 3, dispatchedPercent: 20, dispatchingPercent: 30, receivedPercent: 40, completedPercent: 10, taskOverviewRespVoList: emptyTaskChildren() },
  ],
}

function day(recordCount: number, flightLength: string, durationHours: string, displayDate: string): FlightCountDto {
  return { deptId: null, deptName: null, recordCount, flightLength, durationHours, displayDate, countViewRespVos: [], secondCountViewRespList: [] }
}

export const flightStatisticsMock: FlightCountDto = {
  deptId: 100, deptName: '省公司', recordCount: 168, flightLength: '1392.47', durationHours: '35.1', displayDate: null,
  countViewRespVos: [
    { deptId: 101, deptName: '市公司A', recordCount: 68, flightLength: '560.20', durationHours: '14.2', displayDate: null, countViewRespVos: [], secondCountViewRespList: [day(12, '98.50', '2.5', '2026-05-09'), day(15, '125.30', '3.1', '2026-05-10'), day(10, '82.40', '2.0', '2026-05-11')] },
    { deptId: 102, deptName: '市公司B', recordCount: 55, flightLength: '450.80', durationHours: '11.3', displayDate: null, countViewRespVos: [], secondCountViewRespList: [day(8, '65.20', '1.6', '2026-05-09'), day(12, '98.70', '2.5', '2026-05-10'), day(9, '75.60', '1.9', '2026-05-11')] },
    { deptId: 103, deptName: '市公司C', recordCount: 45, flightLength: '381.47', durationHours: '9.6', displayDate: null, countViewRespVos: [], secondCountViewRespList: [day(7, '58.90', '1.5', '2026-05-09'), day(10, '85.30', '2.1', '2026-05-10'), day(8, '68.20', '1.7', '2026-05-11')] },
  ],
  secondCountViewRespList: [day(27, '222.60', '5.6', '2026-05-09'), day(37, '309.30', '7.7', '2026-05-10'), day(27, '226.20', '5.6', '2026-05-11')],
}

function workDay(date: string, toReceiveNum: number, receivedNum: number, completedNum: number): WorkOrderOverviewDto {
  return { deptId: null, deptName: null, workOrderTotalNum: toReceiveNum + receivedNum + completedNum, toReceiveNum, receivedNum, completedNum, displayDate: date, workOrderOverviewRespVos: [], secondWordOderDetails: [] }
}

export const workOrderOverviewMock: WorkOrderOverviewDto = {
  deptId: 100, deptName: '省公司', workOrderTotalNum: 56, toReceiveNum: 12, receivedNum: 28, completedNum: 16, displayDate: null,
  workOrderOverviewRespVos: [
    { deptId: 101, deptName: '市公司A', workOrderTotalNum: 22, toReceiveNum: 5, receivedNum: 12, completedNum: 5, displayDate: null, workOrderOverviewRespVos: [], secondWordOderDetails: [workDay('2026-05-09',2,4,2), workDay('2026-05-10',1,3,1), workDay('2026-05-11',2,5,2)] },
    { deptId: 102, deptName: '市公司B', workOrderTotalNum: 18, toReceiveNum: 4, receivedNum: 9, completedNum: 5, displayDate: null, workOrderOverviewRespVos: [], secondWordOderDetails: [workDay('2026-05-09',1,3,2), workDay('2026-05-10',2,4,1), workDay('2026-05-11',1,2,2)] },
    { deptId: 103, deptName: '市公司C', workOrderTotalNum: 16, toReceiveNum: 3, receivedNum: 7, completedNum: 6, displayDate: null, workOrderOverviewRespVos: [], secondWordOderDetails: [workDay('2026-05-09',1,2,3), workDay('2026-05-10',1,3,2), workDay('2026-05-11',1,2,1)] },
  ],
  secondWordOderDetails: [workDay('2026-05-09',4,9,7), workDay('2026-05-10',4,10,4), workDay('2026-05-11',4,9,5)],
}
