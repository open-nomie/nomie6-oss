import dayjs from 'dayjs'
import math from '../../utils/math/math'
import type { ITrackerMath } from '../../modules/tracker/TrackerClass'
import type { IStatDow } from '../stats/stats-types'

export interface IDow {
  mon: IStatDow
  tue: IStatDow
  wed: IStatDow
  thu: IStatDow
  fri: IStatDow
  sat: IStatDow
  sun: IStatDow
}

function DayOfWeek(rows, tag = null, mathType: ITrackerMath = 'sum'): IDow {
  let dow: IDow = {
    mon: {
      count: 0,
      values: [],
      percent: 0,
    },
    tue: {
      count: 0,
      values: [],
      percent: 0,
    },
    wed: {
      count: 0,
      values: [],
      percent: 0,
    },
    thu: {
      count: 0,
      values: [],
      percent: 0,
    },
    fri: {
      count: 0,
      values: [],
      percent: 0,
    },
    sat: {
      count: 0,
      values: [],
      percent: 0,
    },
    sun: {
      count: 0,
      values: [],
      percent: 0,
    },
  }

  rows.forEach((row) => {
    let day = dayjs(row.end).format('ddd').toLowerCase()
    let thisDow = dow[day]
    if (thisDow) {
      thisDow.count++
      thisDow.values.push(tag ? row.getTrackerValue(tag, mathType) : 1)
    }
  })

  let counts = Object.keys(dow).map((t) => dow[t].count)
  let countPercentages = math.percentile(counts)

  Object.keys(dow).forEach((key, index) => {
    dow[key].percent = countPercentages[index]
    dow[key].total = mathType == 'sum' ? math.sum(dow[key].values) : math.average(dow[key].valuels)
  })

  return dow
}

export default DayOfWeek
