import type NLog from '../../domains/nomie-log/nomie-log'
import time from '../../utils/time/time'
import dayjs from 'dayjs'
import math from '../math/math'

/**
 * Incomplete
 * TODO: Make this able to generate a chart that shows the end and start time.
 * Im kinda stuck - need to think about creating a matrix of hours
 */

export interface ILogTime {
  start: number
  end: number
  hours?: number
  percent?: number
}
export type ILogTimes = Array<ILogTime>
export default function TrackerLogsToTime(trackerTag: string, logs: Array<NLog>): ILogTimes {
  let times: Array<ILogTime> = []
  let dates = {}
  logs.forEach((log: NLog) => {
    let trackerFound = log.trackers.find((t) => t.id == trackerTag)
    if (trackerFound) {
      let end = dayjs(log.end)
      let endDateString = end.format('YYYY-MM-DD')
      dates[endDateString] = dates[endDateString] || []

      if (!dates[endDateString].end || dates[endDateString].end > log.end) {
        dates[endDateString].end = log.end
      }
      let start = dayjs(log.end).subtract(trackerFound.value, 'second').toDate().getTime()
      if (!dates[endDateString].start || dates[endDateString].start > start) {
        dates[endDateString].start = start
      }
    } else {
      console.error('Tracker not found?', log)
    }
  })

  times = Object.keys(dates).map((dateString) => {
    return {
      ...dates[dateString],
      date: dateString,
      hours: math.round(dayjs(dates[dateString].end).diff(dayjs(dates[dateString].start), 'minute') / 60, 100),
      startTimeFormatted: dayjs(dates[dateString].start).format('h:mm a'),
      endTimeFormatted: dayjs(dates[dateString].end).format('h:mm a'),
      startTime: dayjs(dates[dateString].start).format('HHmm'),
      endTime: dayjs(dates[dateString].end).format('HHmm'),
      percent: 0,
    }
  })
  let hours = times.map((t) => t.hours)
  let percentages = math.percentile(hours)
  times = times.map((t, i) => {
    t.percent = percentages[i]
    return t
  })

  return times
}
