import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type NLog from '../nomie-log/nomie-log'
import logsToTrackableUsage from '../usage/usage-utils'

import type { Token } from '../../modules/tokenizer/lite'
// import type { PrefsWeekStartTypes } from '../preferences/Preferences'
import type { ITrackables } from '../trackable/trackable-utils'
import type { TrackableUsage } from '../usage/trackable-usage.class'
import { summary }  from "date-streaks";
export interface CalendarLog {
  start: Date
  end: Date
  repeat: boolean
}

export type StreakViewTypes = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface StreakDateRange {
  start: Dayjs
  end: Dayjs
}

function getPercentage(rows: Array<NLog>, month: Dayjs) {
  let start = month.startOf('month')
  let end = month.endOf('month')
  // if (state.thisMonth) {
  //   end = dayjs().endOf("day");
  // }
  let diff = end.diff(start, 'day') + 1
  let final = []
  for (var i = 0; i < diff; i++) {
    let date = dayjs(start).add(i, 'day')
    let hasEvent = rows.find((row) => new Date(row.end).toDateString() === date.toDate().toDateString())
    final.push(hasEvent)
  }
  let found: number = final.filter((r) => r).length
  let total: number = final.length
  return {
    daysTotal: total,
    daysHit: found,
    percentage: found / total,
  }
}

const logsToCalendar = (logs: Array<NLog>): Array<CalendarLog> => {
  return logs.map((log: any) => {
    log.start = new Date(log.start)
    log.end = new Date(log.end)
    log.repeat = false
    return log
  })
}

// const getLogs = async (
//   trackable: Trackable,
//   date: Dayjs,
//   view: StreakViewTypes = 'month',
//   weekStartsOn: PrefsWeekStartTypes = 'sunday'
// ): Promise<Array<NLog>> => {
//   let payload = getDateRange(date, view, weekStartsOn)

//   return await LedgerStore.query({
//     search: trackable.tag,
//     start: payload.start,
//     end: payload.end,
//   })
// }

const getStreak = async (element: Token, date: Dayjs, logs: Array<NLog>) => {
  return {
    logs: logs,
    results: getPercentage(logs, date),
  }
}

export default {
  logsToCalendar,
  getPercentage,
  getStreak,
  // getLogs,
}

export type StreakDataUnit = {
  count: number
  start: Date
}
export type StreakResponse = {
  streak: number
  streakStart: Date
  pastStreaks: Array<StreakDataUnit>
}

export type LogToStreakResponse = {
  [key: string]: StreakResponse
}

type LogToStreakOptions = {
  knownTrackables?: ITrackables
  now?: Date
}

export const logsToStreaks = (logs: Array<NLog> = [], options: LogToStreakOptions = {}): LogToStreakResponse => {
  let response: LogToStreakResponse = {}
  const usages = logsToTrackableUsage(logs, { trackables: options.knownTrackables || {} })
  Object.keys(usages).map((tag) => {
    response[tag] = trackableUsageToStreak(usages[tag], options)
  })

  return response
}

export type StreakSummaryResults = { currentStreak: number; longestStreak: number; streaks: number[]; todayInStreak: boolean; withinCurrentStreak: boolean; };

export const streakSummary = (dates:Array<Date>): StreakSummaryResults => {
  let res = summary({ dates });
  return res;
}

export const extractStreaksFromDates = (dates: Array<Dayjs>): Array<StreakDataUnit> => {
  const streakDates = dates.sort((a, b) => (a.unix > b.unix ? -1 : 1))
  let streaks: Array<Array<Dayjs>> = []
  let currentStreak = []

  streakDates.map((d, index) => {
    let current = d.endOf('day')
    let previous = (streakDates[index - 1] || dayjs(new Date('1999-10-10'))).endOf('day')
    let diff = Math.abs(current.diff(previous, 'day'))

    if (index === streakDates.length - 1 && currentStreak.length) {
      // If we're on the last Date and we have a streak
      currentStreak.push(current)
      streaks.push(currentStreak)
    } else if (index === 0) {
      currentStreak.push(current)
    } else if (diff === 1) {
      currentStreak.push(current)
    } else if (diff > 1) {
      streaks.push([...currentStreak])
      currentStreak = [current]
    }
  })

  return streaks
    .map((s) => {
      if (s.length > 1) {
        return {
          count: s.length,
          start: s[0].toDate(),
        }
      }
      return undefined
    })
    .filter((s) => s)
}

export const trackableUsageToStreak = (tu: TrackableUsage, options: LogToStreakOptions = {}): StreakResponse => {
  // let now = options.now || new Date()
  let now = options.now || new Date()
  const streakData = extractStreaksFromDates(tu.dates)

  const response: StreakResponse = {
    streak: 0,
    streakStart: undefined,
    pastStreaks: [],
  }

  if (streakData.length) {
    let lastStreak = streakData[streakData.length - 1]
    const lastUsedDate = dayjs(lastStreak.start)
      .add(lastStreak.count - 1, 'day')
      .toDate()

    if (lastUsedDate.toDateString() === now.toDateString()) {
      // It ends on Today! so its still a streak
      let activeStreak = lastStreak
      streakData.pop()
      response.streak = activeStreak.count
      response.streakStart = activeStreak.start
      response.pastStreaks = streakData
    } else {
      // No active Streak
      response.pastStreaks = streakData
    }
  }

  // Return only the last streaks that are the highest
  response.pastStreaks = filterDownPastStreaks(response.pastStreaks)

  return response
}

export const filterDownPastStreaks = (streaks: Array<StreakDataUnit>) => {
  return streaks
    .sort((a, b) => {
      return a.count < b.count ? 1 : -1
    })
    .filter((ps, index) => {
      return ps.count > 1 && index < 2
    })
}
