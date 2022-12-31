import type { Dayjs, OpUnitType } from 'dayjs'
import type NLog from '../nomie-log/nomie-log'
import type { TokenTypes } from '../../modules/tokenizer/lite'

import type { ITrackerMath } from '../../modules/tracker/TrackerClass'
import type { Trackable } from '../trackable/Trackable.class'
import type { IDow } from '../stats2/day-of-week'
import type StatsProcessor from './statsV5'
import type { StreakViewTypes } from '../steak/streak-helper'

export type IStatsChartUnit = 'day' | 'week' | 'month' | 'quarter' | 'year'
export type IStatsChartMode = 'd' | 'w' | 'm' | 'q' | 'y' | string
export type ITimeSpanKey = IStatsChartMode

export type ITimeSpanUnit = {
  id: string
  label: string
  title: string
  unit: OpUnitType
  displayUnit: OpUnitType
  format: string
  count?: number
  streakUnit: StreakViewTypes
}
export type ITimeSpan = {
  [key: string]: ITimeSpanUnit
}

export const timeSpans: ITimeSpan = {
  d: {
    id: 'd',
    format: 'YYYY-MM-DD-HH',
    label: 'D',
    title: 'Day',
    displayUnit: 'hour',
    unit: 'day',
    streakUnit: 'day',
  },
  w: { id: 'w', format: 'YYYY-MM-DD', label: 'W', title: 'Week', displayUnit: 'day', unit: 'week', streakUnit: 'week' },
  m: {
    id: 'm',
    format: 'YYYY-MM-DD',
    label: 'M',
    title: 'Month',
    displayUnit: 'day',
    unit: 'month',
    streakUnit: 'month',
  },
  q: {
    id: 'q',
    format: 'YYYY-MM-DD',
    label: '3M',
    title: 'Quarter',
    displayUnit: 'day',
    unit: 'month',
    count: 3,
    streakUnit: 'quarter',
  },
  y: { id: 'y', format: 'YYYY-MM', label: 'Y', title: 'Year', displayUnit: 'month', unit: 'year', streakUnit: 'year' },
}

export type IStatDow = {
  count: number
  percent: number
  values: Array<number>
}
export type IStatsChartLabel = {
  x: string
}
export type IStatsChartValue = {
  x: string
  y: number
  date: Dayjs
  unit: IStatsChartUnit
}

export type IStatsValueMap = {
  [key: string]: Array<number>
}

export type IStatsTodUnit = {
  count: number
  values: Array<number>
  start: number
  end: number
  percent: number
}
export type IStatsTod = {
  afternoon: IStatsTodUnit
  early_morning: IStatsTodUnit
  evening: IStatsTodUnit
  morning: IStatsTodUnit
  night: IStatsTodUnit
}

export type IStatsMaxMin = {
  date: Date
  dateKey: string
  value: number
}

export type IStats = {
  trackable: Trackable
  rows: Array<NLog>
  type: TokenTypes
  math: ITrackerMath
  avg: number
  sum: number
  chart: {
    labels: Array<IStatsChartLabel>
    values: Array<IStatsChartValue>
    mode: IStatsChartMode
  }
  dow: IDow
  tod: IStatsTod
  min: IStatsMaxMin
  max: IStatsMaxMin
  distance?: number
  streak?: any
  _stats?: StatsProcessor
  start?: any
  end?: any
}

export type IStatsConfig = {
  fromDate?: Dayjs
  toDate?: Dayjs
  mode?: IStatsChartMode
  is24Hour?: boolean
  trackable?: Trackable
  rows?: Array<NLog>
  math?: ITrackerMath
}
