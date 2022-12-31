import { TrackableUsage } from './trackable-usage.class'
import type { TrackableUsageType } from './trackable-usage.class'
import math from '../../utils/math/math'

type DataMovementType = {
  direction: 'up' | 'down' | 'same'
  change: number
  from?: number
  to?: number
}

export type CompareDataResponse = {
  value: DataMovementType
  usage: DataMovementType
}

/**
 * It takes a trackable usage object, splits it in half, and then compares the two halves
 * @param {TrackableUsage} _tu - TrackableUsage - the trackable usage object that you want to split
 * @returns An object with the following properties:
 *   - firstTU: TrackableUsageType
 *   - secondTU: TrackableUsageType
 *   - firstTUMean: number
 *   - secondTUMean: number
 *   - firstTUStdDev: number
 *   - secondTUStdDev: number
 *   - firstTUStdEr
 */
export const splitCompareTrackableUsage = (_tu: TrackableUsage): CompareDataResponse => {
  let tu: TrackableUsage = !_tu.groupedBy ? _tu.byDay : _tu;
  let valueCount = tu.values.length
  let half = Math.floor(valueCount * 0.5)

  let firstTU: TrackableUsageType = {
    trackable: tu.trackable,
    values: [],
    dates: [],
  }
  let secondTU: TrackableUsageType = {
    trackable: tu.trackable,
    values: [],
    dates: [],
  }
  tu.values.forEach((value, index) => {
    if (index < half) {
      firstTU.values.push(value)
      firstTU.dates.push(tu.dates[index])
    } else {
      secondTU.values.push(value)
      secondTU.dates.push(tu.dates[index])
    }
  })

  return compareTrackableUsage(new TrackableUsage(firstTU), new TrackableUsage(secondTU))
}

/**
 * It compares two objects of type TrackableUsage and returns an object of type CompareDataResponse
 * @param {TrackableUsage} olderUsage - TrackableUsage - The older usage data
 * @param {TrackableUsage} newerUsage - The usage data for the newer time period
 * @returns A CompareDataResponse object
 */
export const compareTrackableUsage = (olderUsage: TrackableUsage, newerUsage: TrackableUsage): CompareDataResponse => {
  const oldTotal = olderUsage.average
  const oldUsageCount = olderUsage.values.filter((v) => v).length
  const newerTotal = newerUsage.average
  const newerUsageCount = newerUsage.values.filter((v) => v).length
  const valueDirection = oldTotal < newerTotal ? 'up' : oldTotal > newerTotal ? 'down' : 'same'
  const usageDirection = oldUsageCount < newerUsageCount ? 'up' : oldUsageCount > newerUsageCount ? 'down' : 'same'

  const valueDiff =
    newerTotal > oldTotal ? math.percentage(newerTotal, oldTotal) : math.percentage(oldTotal, newerTotal)
  const usageDiff =
    newerUsageCount > oldUsageCount
      ? math.percentage(newerUsageCount, oldUsageCount)
      : math.percentage(oldUsageCount, newerUsageCount)

  const res: CompareDataResponse = {
    value: {
      direction: valueDirection,
      change: 1 - math.round(valueDiff / 100),
      from: oldTotal,
      to: newerTotal,
    },
    usage: {
      direction: usageDirection,
      change: 1 - math.round(usageDiff / 100),
    },
  }

  return res
}
