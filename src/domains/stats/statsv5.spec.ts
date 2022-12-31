import NomieLog from '../nomie-log/nomie-log'

import dayjs, { Dayjs } from 'dayjs'

import StatsProcessor from './statsV5'
import NLog from '../nomie-log/nomie-log'
import { strToTrackable } from '../trackable/trackable-utils'
import { Trackable } from '../trackable/Trackable.class'
import TrackerClass from '../../modules/tracker/TrackerClass'
import type { IStats, ITimeSpanUnit } from './stats-types'
import { timeSpans } from './stats-types'
import { it, describe, expect } from 'vitest'
const goodTrackable = new Trackable({
  type: 'tracker',
  tracker: new TrackerClass({
    tag: 'good',
    type: 'value',
  }),
})

const moodTrackable = new Trackable({
  type: 'tracker',
  tracker: new TrackerClass({
    tag: 'mood',
    math: 'mean',
    type: 'value',
  }),
})
// TODO: write tests for mean math trackers

function rowMaker(count: number): Array<NLog> {
  let rows = []
  let startDaysBack = 100
  let date = dayjs().subtract(startDaysBack, 'day')
  for (let i = 0; i <= startDaysBack; i++) {
    let log = new NLog({
      end: date.add(i, 'day').valueOf(),
      note: `#fake(${i})`,
    })
    rows.push(log)
  }
  return rows
}

function getStatsProcessor(options: any = {}): {
  stats: StatsProcessor
  config: {
    timespan: ITimeSpanUnit
    daysBack?: number
    fromDate?: Dayjs
    toDate?: Dayjs
  }
} {
  let config: any = {}
  config.mode = options.mode || 'm'
  config.timespan = timeSpans[config.mode]
  config.daysBack = options.daysBack || 30
  config.fromDate = options.fromDate || dayjs().subtract(config.daysBack, config.timespan.displayUnit).startOf('day')
  config.toDate = options.toDate || dayjs().endOf('day')

  let rows: Array<NLog> = rowMaker(config.daysBack)
  let stats = new StatsProcessor({
    rows,
    mode: config.mode,
    trackable: strToTrackable('#fake', {}),
    fromDate: config.fromDate,
    toDate: config.toDate,
  })
  return { stats, config }
}

describe('stats processor', () => {
  let statpro = getStatsProcessor()
  let valueMap = statpro.stats.getStarterValueMap()
  let valueMapArray = Object.keys(valueMap)
  let matches = {
    start: statpro.config.fromDate.format(statpro.config.timespan.format),
    end: statpro.config.toDate.format(statpro.config.timespan.format),
    vstart: valueMapArray[valueMapArray.length - 1],
    vend: valueMapArray[0],
  }

  it('should have today in the rows', () => {
    expect(
      statpro.stats.rows.find((r) => dayjs(r.end).format('YYYY-MM-DD') == statpro.config.toDate.format('YYYY-MM-DD'))
    ).toBeTruthy()
  })

  it('should generate the right Starter Valup Map', () => {
    expect(matches.start).toEqual(matches.vstart)
    expect(matches.end).toEqual(matches.vend)
    expect(valueMap[statpro.config.fromDate.format(statpro.config.timespan.format)]).toBeTruthy()
    expect(valueMap[statpro.config.toDate.format(statpro.config.timespan.format)]).toBeTruthy()
    // Right number of elements (days back + today);
    expect(Object.keys(valueMap).length).toBe(statpro.config.daysBack + 1)
  })

  it('should generate the right valueMap', () => {
    let from = statpro.config.fromDate.format(statpro.config.timespan.format)
    let to = statpro.config.toDate.format(statpro.config.timespan.format)
    let valueMap = statpro.stats.getValueMap(statpro.stats.rows)
    expect(valueMap[from].join('')).toBe(`${statpro.stats.rows.length - (statpro.config.daysBack + 1)}`)
    expect(valueMap[to].join('')).toBe('100')
  })
})

describe('modules/stats/stats', function () {
  let rows = [
    new NomieLog({
      note: `I'm  just a note #region`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #first #note #mood(6) and I'm #good(1)`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #last #note and I'm #bad and #good(2)`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `#mood(0) is empty - and zero too`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `#mood(0) is empty - and zero`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm a thing good! #soggy`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note and I'm #good(3) too`,
      end: dayjs().toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note #mood(2) and I'm #good(4) too`,
      end: dayjs().add(1, 'day').toDate().getTime(),
    }),
    new NomieLog({
      note: `I'm the #middle #note and I'm  too`,
      end: dayjs().subtract(1, 'month').toDate().getTime(),
    }),
  ]

  let startTime = dayjs().subtract(7, 'day')
  let endTime = dayjs().endOf('day')

  let timeStats = new StatsProcessor({
    fromDate: startTime,
    toDate: endTime,
    rows,
    math: 'sum',
    trackable: moodTrackable,
  })

  it('should handle the right times', () => {
    let stats: IStats = timeStats.generateResults()
    expect(stats).toBeTruthy()
    expect(timeStats.fromDate.format('YYYY-MM-DD')).toEqual(startTime.format('YYYY-MM-DD'))
    expect(timeStats.toDate.format('YYYY-MM-DD')).toEqual(endTime.format('YYYY-MM-DD'))

    timeStats.init({
      fromDate: startTime,
      toDate: endTime,
    })

    expect(timeStats.fromDate.format('YYYY-MM-DD')).toEqual(startTime.format('YYYY-MM-DD'))
    expect(timeStats.toDate.format('YYYY-MM-DD')).toEqual(endTime.format('YYYY-MM-DD'))
  })

  const monthago = dayjs().subtract(30, 'day')
  const today = dayjs().endOf('day')

  let moodStats = new StatsProcessor({ math: 'mean' })
  let goodStats = new StatsProcessor({ math: 'sum' })
  let moodGenerated = moodStats.generate({
    rows,
    fromDate: monthago,
    toDate: today,
    math: 'mean',
    trackable: moodTrackable,
  })
  let goodGenerated = goodStats.generate({
    rows,
    fromDate: monthago,
    toDate: today,
    math: 'sum',
    trackable: goodTrackable,
  })

  it('stats initializes', () => {
    expect(goodStats).toBeInstanceOf(StatsProcessor)
  })

  it('should have the right start and end date', () => {
    let testDate = dayjs(goodGenerated.start).format('YYYY-MM-DD')
    let withDate = monthago.format('YYYY-MM-DD')
    expect(testDate).toBe(withDate)

    let testDateTo = dayjs(goodGenerated.end).format('YYYY-MM-DD')
    let withDateTo = today.format('YYYY-MM-DD')
    expect(testDateTo).toBe(withDateTo)
  })

  it('should sum good properly', () => {
    expect(goodGenerated.sum).toEqual(6)
  })

  it('should mean mood properly', () => {
    expect(moodGenerated.avg).toEqual(2)
  })

  it('should respect config order', () => {
    let stats = new StatsProcessor({ math: 'mean', mode: 'd' })
    stats.init({ mode: 'w' })
    expect(stats.math).toEqual('mean')
    expect(stats.mode).toEqual('w')
  })

  it('should generate results', () => {
    expect(moodGenerated.rows).toBeInstanceOf(Array)
    expect(moodGenerated.avg).toBeGreaterThan(-1)
    expect(moodGenerated.sum).toBeGreaterThan(-1)
    expect(moodGenerated.rows.length).toEqual(4)
  })

  it('stats rows should expand', () => {
    expect(moodGenerated.rows[0].getMeta().trackers[0].value).toEqual(1)
    expect(moodGenerated.rows[0].getMeta().trackers[0].id).toEqual('first')
  })

  it('getMinMaxFromValueMap()', () => {
    let valueMap = goodStats.getValueMap(rows)
    let minmax = goodStats.getMinMaxFromValueMap(valueMap)

    expect(minmax.min.value).toEqual(6)
    expect(minmax.max.value).toEqual(6)
  })
})

// outdated
