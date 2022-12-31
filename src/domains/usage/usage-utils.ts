import dayjs, { Dayjs } from 'dayjs'

import type { Trackable } from '../trackable/Trackable.class'
import { TrackableUsage } from './trackable-usage.class'

import { isTruthy } from '../../utils/truthy/truthy'

import type NLog from '../nomie-log/nomie-log'

import type { TrackableUsageMap } from './trackable-usage.class'
import type { ITrackables } from '../trackable/trackable-utils'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
import math from '../../utils/math/math'
import ScoreTracker from '../../modules/scoring/score-tracker'
import type { LastUsedCountUnit, TrackableLastUsedType } from '../usage/UsageStore'

type LogToUsageProps = {
  officialOnly?: boolean
  trackables?: ITrackables
  caller?: string
}

type LogFilterProps = {
  trackables?: Array<Trackable>
  start?: Dayjs
  end?: Dayjs
}

export const logHasTrackables = (log: NLog, trackables: Array<Trackable>) => {
  const matches: Array<number> = []
  const logTrackables = log.getTrackables()
  trackables.forEach((trackable) => {
    if (logTrackables.find((lt) => lt.tag === trackable.tag)) {
      matches.push(1)
    }
  })
  return matches.length == trackables.length
}

export const logFilter = (logs: Array<NLog>, filter: LogFilterProps): Array<NLog> => {
  return logs.filter((log) => {
    let shouldReturn: boolean = true
    if (filter.trackables) {
      shouldReturn = logHasTrackables(log, filter.trackables)
    }
    if (shouldReturn && filter.start) {
      const logStart = log.end // Yes, we use .end as the main time - becuase at somepoint we might use start and end...
      shouldReturn = logStart.getTime() >= filter.start.toDate().getTime()
    }
    if (shouldReturn && filter.end) {
      const logEnd = log.end // Yes, we use .end as the main time - becuase at somepoint we might use start and end...
      shouldReturn = logEnd.getTime() <= filter.end.toDate().getTime()
    }
    return shouldReturn
  })
}

/**
 * > It takes a list of logs and returns a map of trackables and their usage
 * @param logs - Array<NLog>
 * @param {LogToUsageProps} options - {
 * @returns A map of trackable usage
 */
export default function logsToTrackableUsage(logs: Array<NLog>, options: LogToUsageProps = {}): TrackableUsageMap {
  // Holder of the Map
  let trackableMap: TrackableUsageMap = {}
  // Loop over notes
  logs.
  sort((a,b)=>{
    return a.end > b.end ? 1: -1
  }).
  forEach((log) => {
    // get trackables from this note and loop over them
    trackableMap = logToTrackableUsage(log, trackableMap, options)
    // trackables.push(note.parsed);
  })

  return trackableMap
}

/**
 * It takes an array of logs and returns the earliest and latest end dates from those logs
 * @param logs - Array<NLog>
 * @returns An object with two properties, start and end.
 */
export const getFirstLastDateFromLogs = (logs: Array<NLog>): { start: Dayjs; end: Dayjs } => {
  const min: number = math.min(logs.map((l) => l.end.getTime()))
  const max: number = math.max(logs.map((l) => l.end.getTime()))
  return {
    start: dayjs(new Date(min)),
    end: dayjs(new Date(max)),
  }
}

export function logToTrackableUsage(
  log: NLog,
  map: TrackableUsageMap = {},
  options: LogToUsageProps = {}
): TrackableUsageMap {
  const trackableMap: TrackableUsageMap = map

  log.getTrackables(options.trackables || {}).forEach((trackable: Trackable) => {
    // create a Trackable usage map
    const tmap = trackableMap[trackable.tag]

    // Get hour of this note - used in the trackable button time balls
    const hour: number = parseInt(dayjs(new Date(log.end)).format('HH'))

    // Determine if we should add this to the map
    let shouldAdd = true

    // If we should add it
    if (shouldAdd) {
      // Make sure we have a tmap
      if (tmap) {
        // make sure value is real
        const value = isTruthy(trackable.value) ? parseNumber(`${trackable.value || 0}`) : 1
        const score = trackable.tracker ? ScoreTracker(value, trackable.tracker) : 0

        // If we have the trackable in the map
        if (trackableMap[trackable.tag]) {
          //Setup the map detail for the trackable
          const mapNode: any = trackableMap[trackable.tag]
          mapNode.values.push(value)
          mapNode.hours.push(hour)
          mapNode.logs.push(log)
          mapNode.positivity.push(score)
          mapNode.dates.push(log.endDayjs())
        }
      } else {
        // create the tmap since it doesnt exist
        const value = isTruthy(trackable.value) ? parseNumber(`${trackable.value || 0}`) : 1
        const score = trackable.tracker ? ScoreTracker(value, trackable.tracker) : 0
        // Setup the default trackable usage
        const def = new TrackableUsage({
          trackable: trackable,
          values: [value],
          hours: [hour],
          dates: [log.endDayjs()],
          logs: [log],
          positivity: [score],
        })
        trackableMap[trackable.tag] = trackableMap[trackable.tag] || def
      }
      // Pre render the display value
      trackableMap[trackable.tag].displayValue = trackable.formatValue(
        trackable.tallyValues(trackableMap[trackable.tag].values)
      )
    }
  })
  return trackableMap
}

/**
 * Last Used Compare and Merge
 */

export const lastUsedCompareAndMerge = (
  prev: TrackableLastUsedType,
  current: LastUsedCountUnit,
  today: Date = new Date()
): TrackableLastUsedType => {
  const tag = prev.tag
  // Its today and we have a lastUsed ... time to do some comparisons
  const res: TrackableLastUsedType = {
    tag,
  }
  const prevDate = new Date(prev.last.d)
  const nextDate = new Date(current.d)
  const prevMax = prev.max?.v || 0
  const prevMin = prev.min?.v || 0
  const nextMax = current.v || 0
  const nextMin = current.v || 0

  if (prevDate >= nextDate) {
    res.last = prev.last
  } else {
    res.last = current
  }

  if (prevMax >= nextMax) {
    res.max = prev.max
  } else {
    res.max = current
  }

  if (prevMin <= nextMin) {
    res.min = prev.min
  } else {
    res.min = current
  }

  //  // Get updated Streak details
  prev.longest = prev.longest || { v: 0, d: undefined }
  const { streak, longest } = updateStreak(current, prev.streak, prev.longest, today)
  res.streak = streak
  res.longest = longest

  return res
}

/**
 * Update Streak
 * Takes a current streak, a last streak, and the longest streak
 * @param current
 * @param streak
 * @param longest
 * @returns { streak, longest}
 */
export const updateStreak = (
  current: LastUsedCountUnit,
  streak: LastUsedCountUnit,
  longest: LastUsedCountUnit,
  today: Date = new Date()
): { streak: LastUsedCountUnit; longest: LastUsedCountUnit } => {
  // Get the Last Streak Date
  let lastStreakDate = dayjs(streak.d)

  // Create some cloned Objects
  const newStreak = { ...streak }
  const newLongest = { ...longest }

  // Is the Last Streak Date, right now?
  if (lastStreakDate.format('YYYY-MM-DD') === dayjs(today).format('YYYY-MM-DD')) {
    newStreak.v = newStreak.v || 1
    // Same Day - don't change anthing
  } else if (
    lastStreakDate.startOf('day').format('YYYY-MM-DD') ===
    dayjs(today).startOf('day').subtract(1, 'day').format('YYYY-MM-DD')
  ) {
    // Was Yesterday! Streak Continues
    newStreak.v = newStreak.v + 1
    newStreak.d = current.d
  } else {
    newStreak.v = 1
    newStreak.d = current.d
  }

  return {
    streak: newStreak,
    longest: newLongest,
  }
}
