import dayjs from 'dayjs'
import TrackerClass from '../../modules/tracker/TrackerClass'
import NLog from '../nomie-log/nomie-log'
import { getFocusScoresFromLogs, getFocusTypes } from './focus-utils'
import { test, describe, expect } from 'vitest'

const logs = [
  { end: dayjs('2021-03-07').toDate(), note: `#walk(2) #coffee(2)` }, // 0
  { end: dayjs('2021-03-08').toDate(), note: `#walk(2) #coffee(2) #mood(8)` }, // 0
  { end: dayjs('2021-03-08').toDate(), note: `#walk(2) #mood(10)` }, // 4
  { end: dayjs('2021-03-09').toDate(), note: `#walk(2) #mood(1)` }, // 0
  { end: dayjs('2021-03-10').toDate(), note: `#walk(2) #pray` }, // 2
  { end: dayjs('2021-03-11').toDate(), note: `#coffee(5) #water(12) #mood(3)` },
  { end: dayjs('2021-03-12').toDate(), note: `#coffee(1) #mood(4) #walk(4.4)` },
  { end: dayjs('2021-03-13').toDate(), note: `#coffee(3) #water(50) #mood(9)` },
  { end: dayjs('2021-03-16').toDate(), note: `#coffee(2) #mood(6)` },
  { end: dayjs('2021-03-15').toDate(), note: `#coffee(3) #water(100) #mood(7)` },
  { end: dayjs('2021-03-16').toDate(), note: `#coffee(2) #mood(8) #walk(43)` },
  { end: dayjs('2021-03-17').toDate(), note: `#coffee(4) #water(400) #mood(1)` },
  { end: dayjs('2021-04-01').toDate(), note: `#coffee(2) #water(400) #mood(4)` },
  { end: dayjs('2021-04-02').toDate(), note: `#coffee(4.3) #sleep(40000) #mood(2)` },
  { end: dayjs('2021-04-04').toDate(), note: `#coffee(4) #water(400) #mood(8)` },
].map((l) => {
  return new NLog({ end: l.end, note: l.note })
})

const mood = new TrackerClass({
  tag: 'mood',
  focus: ['mind', 'spirit'],
  math: 'avg',
  emoji: '😭',
  score: 'custom',
  score_calc: [
    {
      is: 'gt',
      sc: 2,
      v: 8,
      if: 'value',
    },
    {
      if: 'value',
      is: 'gt',
      v: 5,
      sc: '1',
    },
    {
      is: 'lt',
      sc: -1,
      v: 5,
      if: 'value',
    },
  ],
})
const coffee = new TrackerClass({ tag: 'coffee', focus: ['body'], math: 'sum', emoji: '☕️', score: -1 })
const water = new TrackerClass({ tag: 'water', focus: ['body'], math: 'sum', emoji: '💦', score: 1 })
const walk = new TrackerClass({ tag: 'walk', focus: ['body'], math: 'sum', emoji: '🚶‍♀️', score: 2 })
const prayed = new TrackerClass({ tag: 'pray', focus: ['mind', 'spirit'], math: 'sum', emoji: '🚶‍♀️', score: 1 })

let trackables = {
  '#mood': mood.toTrackable(),
  '#coffee': coffee.toTrackable(),
  '#water': water.toTrackable(),
  '#walk': walk.toTrackable(),
  '#pray': prayed.toTrackable(),
}

describe('Focus testing', () => {
  test('it should get all the focus types', () => {
    const types = getFocusTypes()
    expect(types[0].label).toBe('Mind')
  })
  test('it should calculate mind body spirit score', () => {
    const scores = getFocusScoresFromLogs(logs, trackables)
    expect(scores).toBeTruthy()
    expect(scores.find((d) => d.focus.id == 'body').score).toBe(8)
    expect(scores.find((d) => d.focus.id == 'mind').score).toBe(4)
    expect(scores.find((d) => d.focus.id == 'spirit').score).toBe(4)
  })
})
