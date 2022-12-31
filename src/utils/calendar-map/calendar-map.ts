import dayjs from 'dayjs'
import type NLog from '../../domains/nomie-log/nomie-log'

export type TimeGroupType = 'hour' | 'day' | 'week' | 'month' | 'year'
export type CalendarMapProps = {
  timeGroup?: TimeGroupType
  end?: number // time in ms
  start?: number // time in ms
  label?: string
  rows?: Array<NLog>
}

const groupLogsByType = (logs: Array<NLog>, groupBy: TimeGroupType) => {
  const formats = getCalendarMapFormats(groupBy)
  const timeMap: any = {}
  logs.forEach((log) => {
    const timeKey = log.endDayjs().format(formats.slotFormat)
    timeMap[timeKey] = timeMap[timeKey] || {
      values: [],
      positivity: [],
      date: log.endDayjs(),
    }
    timeMap[timeKey].values.push(1)
    timeMap[timeKey].positivity.push(log.score)
  })
}

export type CalendarMapResponseType = {
  times: Array<number>
  count: Array<number>
  value: Array<number>
  location: Array<any>
  label: Array<string>
  positivity: Array<number>
  slots: Array<any>
  meta: {
    start: any
    end: any
    timeGroup: any
  }
  toXY?: Function
}
const CalendarMap = (options: CalendarMapProps): CalendarMapResponseType => {
  // Defaults
  options = options || { rows: [] }
  options.timeGroup = options.timeGroup || 'day'
  options.rows = options.rows || []

  if (options.rows.length && !options.start) {
    options.start = options.rows[0].end // yes end - is the only real time stamp for a log
  }
  if (options.rows.length && !options.end) {
    options.end = options.rows[0].end
  }

  options.start = options.start || dayjs().startOf('month').toDate().getTime()
  options.end = options.end || dayjs().endOf('month').toDate().getTime()
  options.label = options.label || 'YYYY-MM-DD'

  // Setup base Map
  let map: CalendarMapResponseType = {
    times: [],
    count: [],
    value: [],
    location: [],
    label: [],
    positivity: [],
    slots: [],
    meta: {
      start: null,
      end: null,
      timeGroup: null,
    },
    toXY: () => {
      return map.times.map((date, i) => {
        return {
          x: dayjs(new Date(date)),
          y: map.value[i],
        }
      })
    },
  }

  var start = dayjs(options.start)
  var end = dayjs(options.end)

  var starti = dayjs(start)
  var unitDiff = end.diff(start, options.timeGroup) + 1

  // this was set to 2 - not sure why.
  // it should be the start minus the end + 1 unit.

  map.meta.start = options.start
  map.meta.end = options.end
  map.meta.timeGroup = options.timeGroup

  // loop over Units of Difference to build empty Map
  const formats = getCalendarMapFormats(options.timeGroup)
  for (var i = 0; i < unitDiff; i++) {
    const start = dayjs(starti).add(i, options.timeGroup)
    map.times.push(start.toDate().getTime())
    map.count.push(NaN)
    map.value.push(NaN)
    map.positivity.push(NaN)
    map.slots.push(start.format(formats.slotFormat))
    map.label.push(start.format(formats.labelFormat))
    starti.add(1, options.timeGroup)
  } // end looping over items

  return map
}

export default CalendarMap

export const getCalendarMapFormats = (groupBy: TimeGroupType) => {
  groupBy = groupBy || 'day'

  switch (groupBy) {
    // case 'dayName':
    //   return { labelFormat: 'ddd', slotFormat: 'dddd' }

    case 'day':
      return { labelFormat: 'MM/DD/YY', slotFormat: 'YYYY/MM/DD' }

    case 'hour':
      return { labelFormat: 'ddd ha', slotFormat: 'YYYY/MM/DD ha' }

    case 'week':
      return { labelFormat: 'WW YYYY', slotFormat: 'YYYY/WW' }

    case 'month':
      return { labelFormat: 'MM/YYYY', slotFormat: 'YYYY/MM' }

    // case 'monthName':
    //   return { labelFormat: 'MMMM', slotFormat: 'MM' }

    case 'year':
      return { labelFormat: 'YYYY', slotFormat: 'YYYY' }
  }
} // end Calendar Format
