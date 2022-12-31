import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import NLog from '../nomie-log/nomie-log'
import type { Token } from '../../modules/tokenizer/lite'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
import type { Trackable } from '../trackable/Trackable.class'
import type { IStatsChartMode, IStatsValueMap, ITimeSpanUnit } from './stats-types'
import { timeSpans } from './stats-types'

const getStarterValueMap = (startDate: Dayjs, endDate: Dayjs, groupTimeBy: IStatsChartMode): IStatsValueMap => {
  let valueMap = {}
  let start = startDate
  let end = endDate
  let timespan: ITimeSpanUnit = timeSpans[groupTimeBy]
  let diff = Math.abs(start.diff(end, timespan.displayUnit)) + 1
  for (let i = 0; i < diff; i++) {
    valueMap[end.subtract(i, timespan.displayUnit).format(timespan.format)] = []
  }
  return valueMap
}

export type GetValueMapProps = {
  endDate: Dayjs
  startDate: Dayjs
  _unitFormat?: string
  mode: IStatsChartMode
  token?: Token
}

export type UsageMapNode = {
  values: Array<number>
  dates: Array<Dayjs>
  positivity: Array<number>
}
export type UsageMap = {
  [key: string]: UsageMapNode
}

export const getUsageMap = (rows: Array<NLog>, props: GetValueMapProps): UsageMap => {
  let valueMap: IStatsValueMap = getStarterValueMap(props.startDate, props.endDate, props.mode)
  let usageMap: UsageMap = {}
  const acceptableDates: Array<string> = Object.keys(valueMap)
  // Loop Over each Row
  rows.forEach((row) => {
    // Expand Row if not expanded
    row = row instanceof NLog ? row : new NLog(row)
    row.getMeta()
    //
    let unitFormat = props._unitFormat || timeSpans[props.mode].format
    let unitKey = dayjs(row.end).format(unitFormat) // generate unit Key

    // Fill in the Value Map with an empty array if not exist
    if (acceptableDates.indexOf(unitKey) > -1) {
      usageMap[unitKey] = usageMap[unitKey] || {
        positivity: [],
        dates: [],
        values: [],
      }

      // If it's a person or context, just count 1
      if (props.token && props.token.type === 'tracker') {
        row.trackers
          // filter only matches for the trackableElement
          .filter((te) => {
            // Only return trackers with the matching Trackable Element Id
            return te.id == props.token.id
          })
          .forEach((trackerElement) => {
            // Push their value
            usageMap[unitKey].values.push(parseNumber(props.token.value))
            usageMap[unitKey].dates.push(row.endDayjs())
            usageMap[unitKey].positivity.push(row.score)
          })
      } else {
        usageMap[unitKey].values.push(1)
        usageMap[unitKey].dates.push(row.endDayjs())
        usageMap[unitKey].positivity.push(row.score)
      }

      // if (this.trackableElement.type == 'person' || this.trackableElement.type == 'context') {
      //   valueMap[unitKey].push(1)
      // } else {
      //   // It's a tracker
      //   row.trackers
      //     // filter only matches for the trackableElement
      //     .filter((te) => {
      //       // Only return trackers with the matching Trackable Element Id
      //       return te.id == this.trackableElement.id
      //     })
      //     .forEach((trackerElement) => {
      //       // Push their value
      //       valueMap[unitKey].push(trackerElement.value)
      //     })
      // }
    } // end if it's an acceptable date range
  })
  return usageMap
}

export type ITrackableUsageMapProps = {
  endDate: Dayjs
  startDate: Dayjs
  _unitFormat?: string
  mode: IStatsChartMode
  trackable?: Trackable
}

export const getTrackableUsageMap = (rows: Array<NLog>, props: ITrackableUsageMapProps): UsageMap => {
  let valueMap: IStatsValueMap = getStarterValueMap(props.startDate, props.endDate, props.mode)
  let usageMap: UsageMap = {}
  const acceptableDates: Array<string> = Object.keys(valueMap)
  // Loop Over each Row
  rows.forEach((row) => {
    // Expand Row if not expanded
    row = row instanceof NLog ? row : new NLog(row)
    row.getMeta()
    //
    let unitFormat = props._unitFormat || timeSpans[props.mode].format
    let unitKey = dayjs(row.end).format(unitFormat) // generate unit Key

    // Fill in the Value Map with an empty array if not exist
    if (acceptableDates.indexOf(unitKey) > -1) {
      usageMap[unitKey] = usageMap[unitKey] || {
        positivity: [],
        dates: [],
        values: [],
      }

      // If it's a person or context, just count 1
      if (props.trackable && props.trackable.tracker) {
        row.trackers
          // filter only matches for the trackableElement
          .filter((token: Token) => {
            // Only return trackers with the matching Trackable Element Id
            return `${token.prefix}${token.id}` === props.trackable.tag
          })
          .forEach((token: Token) => {
            // Push their value
            usageMap[unitKey].values.push(parseNumber(token.value))
            usageMap[unitKey].dates.push(row.endDayjs())
            usageMap[unitKey].positivity.push(row.score)
          })
      } else {
        usageMap[unitKey].values.push(1)
        usageMap[unitKey].dates.push(row.endDayjs())
        usageMap[unitKey].positivity.push(row.score)
      }
    } // end if it's an acceptable date range
  })
  return usageMap
}
