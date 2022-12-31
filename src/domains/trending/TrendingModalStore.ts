import type { TrackableUsage, TrackableUsageMap, TrackableUsageType } from '../usage/trackable-usage.class'

import type { CompareDataResponse } from '../usage/trackable-usage-utils'
import type { Dayjs } from 'dayjs'
import TrendingModal from './trending-modal.svelte'
import dayjs from 'dayjs'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { splitCompareTrackableUsage } from '../usage/trackable-usage-utils'
import { writable } from 'svelte/store'

export type ATTFocalUnit = 'day' | 'hour' | 'week' | 'month'
export type ATTPropType = {
  date: Date
  focalPeriod: ATTFocalUnit
}
export const AroundThisTimeStore = writable<undefined | ATTPropType>(undefined)

export const openTrendingModal = (date: Date, focus: ATTFocalUnit = 'day') => {
  AroundThisTimeStore.update((s) => {
    return { date, focalPeriod: focus }
  })
  openModal({
    id: `trending-${date.toDateString()}`,
    componentProps: {},
    component: TrendingModal,
  })
}

export type SimpleDateRange = {
  start: Dayjs
  end: Dayjs
}

export const getAroundThisTimeDateRanges = (date: Date, focal: ATTFocalUnit): SimpleDateRange => {
  let start: Dayjs = dayjs(date).startOf('day')
  let end: Dayjs = dayjs(date).endOf('day')
  if (focal === 'day') {
    start = dayjs(start).subtract(1, 'day')
    end = dayjs(end).endOf('day')
  } else if (focal === 'hour') {
    start = dayjs(start).subtract(2, 'hour')
    end = dayjs(end).endOf('hour')
  } else if (focal === 'month') {
    start = dayjs(start).startOf('month').subtract(1, 'month')
    end = dayjs(end).endOf('month')
  } else if (focal === 'week') {
    start = dayjs(start).startOf('week').subtract(1, 'week')
    end = dayjs(end).endOf('week')
  } else if (focal === 'month') {
    start = dayjs(start).startOf('month').subtract(1, 'month')
    end = dayjs(end).endOf('month')
  }
  return { start, end }
}

export type UsageComparedType = {
  trackableUsage: TrackableUsage
  compared: CompareDataResponse
}

export const usageMapToSortedArray = (
  usage: TrackableUsageMap,
  dateRange: SimpleDateRange
): Array<UsageComparedType> => {
  const usagesArray = Object.keys(usage)
    .map((tag) => {
      try {
        let tu: TrackableUsage = usage[tag]
        tu = tu.backfill(dateRange.start.toDate(), dateRange.end.toDate())
        const compared = splitCompareTrackableUsage(tu)
        return {
          trackableUsage: tu,
          compared,
        }
      } catch (e) {
        return undefined
      }
    })
    .filter((usage) => usage)
    .sort((a, b) => {
      const aset =
        a.trackableUsage.values.filter((v) => !isNaN(v) && v).length +
          (a.compared.value.change || 0) +
          (a.compared.usage.change || 0) || -1
      const bset =
        a.trackableUsage.values.filter((v) => !isNaN(v) && v).length +
          (b.compared.value.change || 0) +
          (b.compared.usage.change || 0) || -1

      return aset < bset ? -1 : 1
    })
    .filter((a) => {
      return a.compared.value.direction !== 'same'
    })
  return usagesArray
}
