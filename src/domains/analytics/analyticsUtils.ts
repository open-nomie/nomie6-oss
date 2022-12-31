// import type NLog from '../../domains/log/nomie-log'

import type NLog from '../nomie-log/nomie-log'
import DayOfWeek from '../stats2/day-of-week'
import type { IDow } from '../stats2/day-of-week'

import TimeOfDay from '../stats/time-of-day'
import type { Dayjs } from 'dayjs'
import math from '../../utils/math/math'
import type { Trackable } from '../trackable/Trackable.class'
import type { Token } from '../../modules/tokenizer/lite'
import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
import type { IStatsTod } from '../stats/stats-types'

export type GeneralCountsResponse = {
  totalLogs: number
  totalDatapoints: number
  totalNotes: number
}

type TrackablePositivityResult = { trackable: Trackable; score: number }
export type TrackablePositivityResponse = {
  positive: Array<TrackablePositivityResult>
  negative: Array<TrackablePositivityResult>
}
export const getTrackablePositivityUsage = (logs: Array<NLog>): TrackablePositivityResponse => {
  const positive = {}
  const negative = {}
  logs.forEach((log: NLog) => {
    log.getMeta()
    if (log.score > 0) {
      log.elements.forEach((token: Token) => {
        const tag = `${token.prefix}${token.id}`
        positive[tag] = positive[tag] || { trackable: tokenToTrackable(token, {}), scores: [] }
        positive[tag].scores.push(log.score)
      })
    } else if (log.score < 0) {
      log.elements.forEach((token: Token) => {
        const tag = `${token.prefix}${token.id}`
        negative[tag] = negative[tag] || { trackable: tokenToTrackable(token, {}), scores: [] }
        negative[tag].scores.push(log.score)
      })
    }
  })
  return {
    positive: Object.keys(positive)
      .map((teTag: string) => {
        return {
          trackable: positive[teTag].trackable,
          score: math.sum(positive[teTag].scores),
        }
      })
      .sort((a, b) => {
        return a.score < b.score ? 1 : -1
      }),
    negative: Object.keys(negative)
      .map((teTag: string) => {
        return {
          trackable: negative[teTag].trackable,
          score: math.sum(negative[teTag].scores),
        }
      })
      .sort((a, b) => {
        return a.score > b.score ? 1 : -1
      }),
  }
}

export const getGeneralUsageCounts = (logs: Array<any>): GeneralCountsResponse => {
  const response: GeneralCountsResponse = {
    totalDatapoints: logs.length
      ? logs
          .map((log) => {
            log.getMeta()
            const points = [...log.trackers, ...log.people, ...log.context]
            return points.length
          })
          .reduce((a, b) => {
            return a + b
          })
      : 0,
    totalLogs: logs.length,
    totalNotes: logs.filter((log: NLog) => {
      return log.hasNote
    }).length,
  }

  return response
}

export type TokenUsageType = {
  token: Token
  dates: Array<Date>
  values: Array<number>
}

export type AllUsageResponse = {
  overall: {
    elementCount: Array<number>
    dates: Array<Dayjs>
  }
  timeOfDay?: IStatsTod
  dayOfWeek?: IDow
  elements: Array<TokenUsageType>
}

export const getAllUsage = (logs: Array<NLog>): AllUsageResponse => {
  const tagMap: { [key: string]: TokenUsageType } = {}
  const usageMap: AllUsageResponse = {
    overall: {
      elementCount: [],
      dates: [],
    },
    elements: [],
  }
  logs.forEach((log: NLog) => {
    log.getMeta() // Let the log extract the data from the note
    // Loop over trackable elements
    usageMap.overall.dates.push(log.endDayjs())
    usageMap.overall.elementCount.push(log.elements.length)
    log.elements.forEach((token: Token) => {
      const tag = `${token.prefix}${token.id}`
      if (['person', 'tracker', 'context'].indexOf(token.type) > -1) {
        tagMap[tag] = tagMap[tag] || {
          values: [],
          dates: [],
          token,
        }
        tagMap[tag].values.push(parseNumber(token.value))
        tagMap[tag].dates.push(new Date(log.end))
      }
    })
  })

  usageMap.elements = Object.keys(tagMap)
    .map((tag: string) => {
      return tagMap[tag]
    })
    .sort((a: TokenUsageType, b: TokenUsageType) => {
      return a.values.length < b.values.length ? 1 : -1
    })

  usageMap.timeOfDay = TimeOfDay(logs)
  usageMap.dayOfWeek = DayOfWeek(logs)

  return usageMap
}
