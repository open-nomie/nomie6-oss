import dayjs, { Dayjs } from 'dayjs'
import type { StreakDataUnit } from '../steak/streak-helper'
import { filterDownPastStreaks } from '../steak/streak-helper'

export interface LastUsedItem {
  book?: string
  date?: Date | string | number
  log?: string
  value?: any
  streak?: number
  streakStart?: Date | string | number | Dayjs
  pastStreaks?: Array<StreakDataUnit>
}

export interface LastUsedItems {
  [key: string]: LastUsedItem
}

type UpdateLastUsedProps = {
  previous?: LastUsedItem
  updated: LastUsedItem
  now?: Date
}
export const adjustLastUsedStreak = (props: UpdateLastUsedProps): LastUsedItem => {
  const updated: LastUsedItem = props.updated || {}
  const previous: LastUsedItem = props.previous || {}
  const now = props.now ? dayjs(props.now) : dayjs()

  updated.pastStreaks = previous.pastStreaks || []
  updated.streakStart = previous.streakStart || now
  updated.streak = previous.streak || 1
  updated.date = dayjs(props.updated.date || now).toJSON()

  // If we have previous, and its value
  if (Object.keys(previous).length > 0) {
    // Get the last used date - compare it to now and get the diff
    const previousDate = dayjs(previous.date)
    const diff = Math.abs(previousDate.startOf('day').diff(now.startOf('day'), 'day'))
    if (diff === 1) {
      // Diff is just one day! Good job
      // Lets update the streak count
      // Make sure if is a NaN to just convert to 1
      if (previous.streak && previous.streak) {
        updated.streak = previous.streak + 1
      } else {
        updated.streak = 2
      }
    } else if (diff > 1) {
      // See if they broken a chain, and then archive the past chain
      if (previous.streak > 1) {
        updated.pastStreaks = updated.pastStreaks || []
        const lastStreakCount: number = previous.streak
        const past = [...(previous.pastStreaks || [])]
        past.push({
          count: lastStreakCount,
          start: previousDate.toDate(),
        })
        updated.pastStreaks = filterDownPastStreaks(past)
      }
      updated.streak = 1
      updated.streakStart = new Date().toJSON()
    }
  } else {
    updated.streak = 1
    updated.streakStart = new Date().toJSON()
  }

  return updated
}
