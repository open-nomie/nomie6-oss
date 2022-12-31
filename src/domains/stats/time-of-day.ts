import math from '../../utils/math/math'
import type NLog from '../nomie-log/nomie-log'
import type { ITrackerMath } from '../../modules/tracker/TrackerClass'
import type { IStatsTod } from './stats-types'

function TimeOfDay(rows: Array<NLog>, tag = null, mathType: ITrackerMath = 'sum') {
  let tod: IStatsTod = {
    early_morning: {
      count: 0,
      values: [],
      start: 0,
      end: 6,
      percent: 0,
    },
    morning: {
      count: 0,
      values: [],
      start: 6,
      end: 12,
      percent: 0,
    },
    afternoon: {
      count: 0,
      values: [],
      start: 12,
      end: 18,
      percent: 0,
    },
    evening: {
      count: 0,
      values: [],
      start: 18,
      end: 21,
      percent: 0,
    },
    night: {
      count: 0,
      values: [],
      start: 21,
      end: 24,
      percent: 0,
    },
  }

  rows.forEach((row: NLog) => {
    let hour = new Date(row.end).getHours()
    Object.keys(tod).forEach((id) => {
      let thisTod = tod[id]
      if (hour >= thisTod.start && hour <= thisTod.end) {
        thisTod.count++
        thisTod.values.push(tag ? row.getTrackerValue(tag, mathType) : 1)
      }
    })
  })

  let counts = Object.keys(tod).map((t) => tod[t].count)
  let countPercentages = math.percentile(counts)

  Object.keys(tod).forEach((key, index) => {
    tod[key].percent = countPercentages[index]
    tod[key].math = mathType
    tod[key].total = mathType === 'sum' ? math.sum(tod[key].values) : math.average(tod[key].values)
  })

  return tod
}

export default TimeOfDay
