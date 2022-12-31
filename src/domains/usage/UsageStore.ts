import type { ITrackables } from '../trackable/trackable-utils'
import { LedgerStore } from '../ledger/LedgerStore'
import type NLog from '../nomie-log/nomie-log'
import NPaths from '../../paths'

import { createKVStore } from '../../store/KVStore'
import dayjs from 'dayjs'

import { tokenToTag } from '../../modules/tokenizer/tokenToTrackable'
import type { Token } from '../../modules/tokenizer/lite'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
import logsToTrackableUsage, { lastUsedCompareAndMerge } from './usage-utils'
import { derived } from 'svelte/store'
import type { Trackable } from '../trackable/Trackable.class'


export type LastUsedCountUnit = { v: number; d: Date | string }
export type TrackableLastUsedType = {
  tag?: string
  last?: LastUsedCountUnit
  min?: LastUsedCountUnit
  max?: LastUsedCountUnit
  streak?: LastUsedCountUnit
  longest?: LastUsedCountUnit
  logId?: string
  bookId?: string
}

export type LastUsedStoreState = {
  [key: string]: TrackableLastUsedType
}


/**
 * $UsageStore[tag]
 * A Key Value Store for holding the last usage data for a trackable
 */
export const UsageStore = createKVStore(NPaths.storage.trackableUsage(), {
  label: 'Usage Store',
  key: 'tag',
  itemInitializer: (item, key) => {
    item.tag = key
    return item
  },
  itemSerializer: (item) => {
    return item
  },
})

type PreviousUsageMapType = {
  [key: string]: TrackableLastUsedType
}

/**
 * $UsageStreak[tag]
 * Derived store to return the streak value from a tag
 */
export const UsageStreak = derived(UsageStore, ($UsageStore) => {
  const map: {
    [key: string]: { v: number; d: Date }
  } = {}
  Object.keys($UsageStore).map((key) => {
    map[key] = $UsageStore[key].streak
  })
  return map
})

/**
 * Create a Store for the Last Usage
 * This is a derived svelte store $UsageLast[tag]
 */
export const UsageLast = derived(UsageStore, ($UsageStore) => {
  const map: {
    [key: string]: { v: number; d: Date }
  } = {}
  Object.keys($UsageStore).map((key) => {
    let last = $UsageStore[key].last
    if (last) map[key] = last
  })
  return map
})

/**
 * Get Last Usage from State
 * this is a heaver call and will cause a reaction since
 * update is being used and we have a complex object in the store
 * @param trackable
 * @returns
 */
export const getTrackableLastUsageHeavy = (trackable: Trackable): TrackableLastUsedType => {
  const state = UsageStore.rawState()
  return state[trackable.tag]
}

/**
 * Update the Last use for a specific Log
 * @param log
 * @returns Promise UsageMapType
 */
export const updateLastUsed = async (log: NLog): Promise<PreviousUsageMapType> => {
  // get the latest from storage first.
  await UsageStore.init();
  const lastUsedState = UsageStore.rawState()
  return await processLogForLastUsage(log, lastUsedState)
}

/**
 * Update all Last Usage and Streak Data
 * This will go back 2 years and update based on what we find
 * @param knownTrackables
 * @param daysBack
 * @returns
 */
export const updateAllLastUsed = async (knownTrackables: ITrackables, daysBack: number = 650) => {
  const logs = await LedgerStore.query({
    start: dayjs().subtract(daysBack, 'days'),
    end: dayjs().endOf('day'),
  })

  let usages = logsToTrackableUsage(logs, knownTrackables)
  let lastUsage: PreviousUsageMapType = {}

  Object.keys(usages).forEach((tag) => {
    // only do known trackables
    if (knownTrackables[tag]) {
      // Group By Day?
      let usage = usages[tag]
      
      if (usage) {
        try {
          let streakSummary = usage.streakSummary
          let lastLog = usage.logs[usage.logs.length - 1]
          let lastValue = usage.values[usage.values.length - 1]
          let lastDate = usage.dates[usage.dates.length - 1]
          lastUsage[tag] = {
            tag: usage.trackable.tag,
            min: { v: usage.min?.value || 0, d: usage.min?.date.toDate() },
            max: { v: usage.max.value, d: usage.max.date.toDate() },
            last: { v: lastValue, d: lastDate?.toDate() },
            longest: { v: streakSummary.longestStreak },
            streak: streakSummary.todayInStreak
              ? { v: streakSummary.currentStreak, d: new Date() }
              : { v: 0, d: new Date() },
            logId: lastLog?._id,
            bookId: lastLog?.bookId,
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  })

  const saved = await UsageStore.updateSync((state) => {
    return { ...state, ...lastUsage }
  })

  return saved
}

/**
 * Process Log for Last Usage
 * This function takes a log and compares it to the previous Usage State
 * it will update if needed
 * @param log
 * @returns Promise PreviousUsageMapType
 */
export const processLogForLastUsage = async (log: NLog, state: PreviousUsageMapType): Promise<PreviousUsageMapType> => {
  const raw: PreviousUsageMapType = state

  /**
   * Extract Tokens from the Log
   */
  const items: Array<{ tag: string; token: Token }> = log.elements

    // Filter out generic tokens
    .filter((t) => t.type !== 'generic')
    .map((token: Token) => {
      return {
        // Convert token to a tag
        tag: tokenToTag(token),
        token,
      }
    })
    // Trim any 0 length tags
    .filter((t) => t.tag.trim().length)

  /**
   * Create an empty map to update
   *  */
  const toUpdate: PreviousUsageMapType = {}

  /**
   * Loop Over each trackable
   */
  items.forEach((item) => {
    const tag = item.tag
    const baseValue = item.token.value
    const lastUsed: TrackableLastUsedType = raw[tag]
    const itemValue = parseNumber(baseValue)

    /**
     * Setup a Default LastUsedType
     * date is log date, value is item value
     */
    let defaultCountUnit = { d: log.end, v: itemValue }
    if (!lastUsed) {
      /**
       * It's Empty
       * Fill it with the first
       */
      toUpdate[tag] = {
        tag: tag,
        last: defaultCountUnit,
        min: defaultCountUnit,
        max: defaultCountUnit,
        logId: log._id,
        bookId: log.bookId,
        streak: { v: 1, d: new Date() }, // default streak will be 1 day,
        longest: { v: 1, d: new Date() }, // default longest will be 1 day
      }
    } else if (log.end.toDateString() !== new Date().toDateString()) {
      // It's in the past don't count anything
    } else {
      /**
       * It's Today and we have a previous Last Used to Compre against.
       */
      toUpdate[tag] = lastUsedCompareAndMerge(lastUsed || {}, defaultCountUnit)
    }
  })

  const saved = await UsageStore.updateSync((state) => {
    return { ...state, ...toUpdate }
  })

  return saved
}
