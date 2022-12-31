import { compareTrackableUsage, splitCompareTrackableUsage } from './trackable-usage-utils'

import NLog from '../nomie-log/nomie-log'
import { Trackable } from '../trackable/Trackable.class'
import { TrackableUsage } from './trackable-usage.class'
import TrackerClass from '../../modules/tracker/TrackerClass'
import dayjs from 'dayjs'
import logsToTrackableUsage, { logToTrackableUsage } from './usage-utils'
import math from '../../utils/math/math'
import { it, test, describe, expect } from 'vitest'
const moodTrackable = new Trackable({
  type: 'tracker',
  tracker: new TrackerClass({ tag: 'mood', math: 'mean', emoji: '🥲' }),
})

const sangTrackable = new Trackable({
  type: 'tracker',
  tracker: new TrackerClass({ tag: 'sang', uom: 'dollars', math: 'sum', emoji: '🥲' }),
})

const date = dayjs('2021-11-04')
const logs = Array(200)
  .fill(0)
  .map((c, index) => {
    return new NLog({
      // end: math.random([0, 1]) ? date.add(index, 'day') : date,
      end: date.add(index, 'day'),
      note: [`#mood(1) #walked(1) #water(12) #water(32)`, '#mood(6) #walked(5)', '#mood(9) nothing here'][
        math.random([0, 1, 2])
      ],
    })
  })

describe('should be able to compare trackables', () => {
    test('It should find an up turn', () => {
      const tuSum = new TrackableUsage({
        trackable: sangTrackable,
        values: [1, 2, 1],
        dates: [dayjs('2020-03-01'), dayjs('2020-03-02'), dayjs('2020-03-03')],
      })
      const tuSum2 = new TrackableUsage({
        trackable: sangTrackable,
        values: [3, 5, 6, 7],
        dates: [dayjs('2020-03-04'), dayjs('2020-03-05'), dayjs('2020-03-06')],
      })
      const compared = compareTrackableUsage(tuSum, tuSum2)

      expect(compared.value.direction).toBe('up')
    })

    test('it should find a down turn', () => {
      const tu = new TrackableUsage({
        trackable: moodTrackable,
        values: [4,5],
        dates: [dayjs('2020-03-02'),dayjs('2020-03-01')],
      })
      const tu2 = new TrackableUsage({
        trackable: moodTrackable,
        values: [1, 1, 1],
        dates: [dayjs('2020-03-04'), dayjs('2020-03-06'), dayjs('2020-03-06')],
      })
      const compared2 = compareTrackableUsage(tu, tu2)

      expect(compared2.value.direction).toBe('down')
      expect(compared2.usage.direction).toBe('up')
    })



    test('It should detect if there are no chanes', () => {
      const SameTu = new TrackableUsage({
        trackable: moodTrackable,
        values: [4,5],
        dates: [dayjs('2020-03-02'),dayjs('2020-03-01')],
      })
      const SameTu2 = new TrackableUsage({
        trackable: moodTrackable,
        values: [5, 4],
        dates: [dayjs('2020-03-03'), dayjs('2020-03-04')],
      })
      const compared3 = compareTrackableUsage(SameTu, SameTu2)
      expect(compared3.value.direction).toBe('same')
      expect(compared3.usage.direction).toBe('same')
    })

    test('it should split a trackable usage and compare the halfs', () => {
      const SameTu = new TrackableUsage({
        trackable: moodTrackable,
        values: [1, 1, 2, 2],
        dates: [dayjs('2020-03-01'), dayjs('2020-03-02'), dayjs('2020-03-04'), dayjs('2020-03-10')],
      })
      const compared = splitCompareTrackableUsage(SameTu)
      expect(compared.value.direction).toBe('up')
      expect(compared.value.change).toBe(0.5)
    })
  })

  describe('Trackable Usage Tests', () => {
    const tu = new TrackableUsage({
      trackable: moodTrackable,
      values: [1, 4],
      dates: [dayjs('2020-03-01'), dayjs('2020-03-06')],
    })
    const tuSum = new TrackableUsage({
      trackable: sangTrackable,
      values: [1, 2, 1],
      dates: [dayjs('2020-03-01'), dayjs('2020-03-06'), dayjs('2020-03-13')],
    })
    const trackables = {
      '#mood': moodTrackable,
      '#sang': sangTrackable,
    }
    const usages = logsToTrackableUsage(logs, { trackables })

    it('should have usage', () => {
      expect(usages).toBeTruthy()
      // const usage = usages['#mood'].groupBy('week', 'YYYY-MM-W').backfill()
    })

    it('should be able to truncate a usage into a smaller usage', () => {
      const trackableUsage = usages['#mood']

      // const base = dayjs('2021-11-04')
      const start = dayjs('2021-11-06')
      const end = dayjs('2021-11-10')

      const shorter = trackableUsage.truncate(start, end)

      console.table(
        shorter.dates.map((d, i) => {
          return { date: d.format('MMM Do YYYY'), value: shorter.values[i] }
        })
      )
      expect(shorter.values.length).toBe(5)
    })

    it('should be an object', () => {
      expect(tu).toBeTruthy()
    })
    it('should have the right number of dates', () => {
      expect(tu).toBeTruthy()
      expect(tu.dates.length).toBe(2)
    })
    it('should backfill properly', () => {
      const backfilled = tu.backfill()
      expect(backfilled.values[0]).toBe(1)
      expect(backfilled.values[backfilled.values.length - 1]).toBe(4)
      expect(tu.backfill().byDay.dates.length).toBe(6)
    })

    it('should get min and max values and dates', () => {
      expect(tu.min?.value).toBe(1)
      expect(tu.max?.value).toBe(4)
      expect(tu.max?.date.toDate().toDateString()).toBe(dayjs('2020-03-06').toDate().toDateString())
    })

    it('Should get values', () => {
      expect(tu.totalDisplay).toBe('2.5')
      expect(tu.total).toBe(2.5)
      expect(tuSum.total).toBe(4)
      expect(tuSum.totalDisplay).toBe('$4.00')
    })

    it('should get the middle of 3 dates', () => {
      const tu = new TrackableUsage({
        trackable: moodTrackable,
        values: [5, 4],
        dates: [dayjs('2020-03-01'), dayjs('2020-03-02'), dayjs('2020-03-03')],
      })
      let middle = tu.middleDate
      expect(dayjs(middle).format('DD-MM-YYYY')).toBe('02-03-2020')
    })

    it('should get the middle of 2 dates', () => {
      const tu = new TrackableUsage({
        trackable: moodTrackable,
        values: [5, 4],
        dates: [dayjs('2020-03-01'), dayjs('2020-03-02')],
      })
      let middle = tu.middleDate
      expect(dayjs(middle).format('DD-MM-YYYY')).toBe('01-03-2020')
    })

    it('should handle notes with the same trackable done multiple times', () => {
      const log = new NLog({
        note: '#water(1) #water(20)',
      })
      const tracker = new TrackerClass({
        tag: 'water',
        type: 'tick',
      }).toTrackable()
      const trackables = { '#water': tracker }
      const tArray = log.getTrackables(trackables)
      const values = tArray.map((t) => t.value).join(',')
      expect(values).toBe('1,20')
      // const usage = logToTrackableUsage(log, {}, { trackables: {  '#water': tracker  }} )
      // const values = (usage['#water'].values);
      // expect(values.join(',')).toBe('1,20')
    })
  })
