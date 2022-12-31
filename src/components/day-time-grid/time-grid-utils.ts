import type NLog from '../../domains/nomie-log/nomie-log'
import type { Trackable } from '../../domains/trackable/Trackable.class'
import math from '../../utils/math/math'
import { parseNumber } from '../../utils/parseNumber/parseNumber'

export type TimeGridDay = Array<string | number>

export type TimeGridResponse = {
  grid: TimeGridArray
  meta: {
    max: number
  }
}
export type TimeGridArray = Array<{ daykey: string; day: TimeGridDay }>
export type TimeGrid = {
  sun: TimeGridDay
  mon: TimeGridDay
  tue: TimeGridDay
  wed: TimeGridDay
  thu: TimeGridDay
  fri: TimeGridDay
  sat: TimeGridDay
}

const getEmptyTimeGrid = (): TimeGrid => {
  return {
    sun: Array(24).fill(0),
    mon: Array(24).fill(0),
    tue: Array(24).fill(0),
    wed: Array(24).fill(0),
    thu: Array(24).fill(0),
    fri: Array(24).fill(0),
    sat: Array(24).fill(0),
  }
}

const getWeekDayKeys = (weekStarts: 'monday' | 'sunday') => {
  if (weekStarts === 'monday') return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
}

export const logsToTimeGrid = (
  logs: Array<NLog>,
  weekStarts: 'monday' | 'sunday',
  trackable: Trackable
): TimeGridResponse => {
  let max = 0
  let dayKeys = getWeekDayKeys(weekStarts)
  let grid: TimeGrid = getEmptyTimeGrid()
  logs.forEach((log) => {
    let hour = parseNumber(log.endDayjs().format('H'))
    let day = log.endDayjs().format('ddd').toLowerCase()

    if (trackable.tracker?.type == 'timer') {
      let seconds = log.getTrackerValue(trackable.tracker.tag)
      let hours = math.round(seconds ? seconds / 60 / 60 : 0)
      if (hours) {
        for (let i = 1; i < hours; i++) {
          let thisHour = hour - i
          let theDay = log.endDayjs().subtract(thisHour, 'hour').format('ddd').toLowerCase()
          grid[theDay][thisHour] = grid[theDay][thisHour] + 1
        }
      }
    }

    grid[day][hour] = grid[day][hour] + 1
    if (max < grid[day][hour]) {
      max = grid[day][hour]
    }
  })

  let timeGridArray = dayKeys.map((daykey) => {
    return { daykey, day: grid[daykey] }
  })
  return {
    grid: timeGridArray,
    meta: {
      max,
    },
  }
}
