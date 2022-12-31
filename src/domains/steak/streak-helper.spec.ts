import NLog from '../nomie-log/nomie-log'
import { logsToStreaks } from './streak-helper'
import { it, test, describe, expect } from 'vitest'
let logs = [
  { note: '#walked(1.4)', date: '2022-01-01 13:00:42' },
  { note: '#walked(1.4) #mood(5)', date: '2022-01-02 13:00:42' },
  { note: '#walked(1.4) #mood(5)', date: '2022-01-03 13:00:42' },
  { note: '#mood(5) #candy', date: '2022-01-04 13:00:42' },

  { note: '#walked(1.4)', date: '2022-01-05 13:00:42' },
  { note: '#walked(1.4)', date: '2022-01-06 13:00:42' },

  { note: '#walked(1.4)', date: '2022-01-10 13:00:42' },
  { note: '#walked(1.4) #candy', date: '2022-01-11 13:00:42' },
  { note: '#walked(1.4)', date: '2022-01-12 13:00:42' },
  { note: '#walked(1.4)', date: '2022-01-13 13:00:42' },
  { note: '#walked(1.4)', date: '2022-01-14 13:00:42' },
  { note: '#walked(1.4)', date: '2022-01-15 13:00:42' },
].map((d) => {
  return new NLog({ note: d.note, end: new Date(d.date) })
})

describe('streak-helper.ts', () => {
  test('It should be a thing', () => {
    expect(1).toBe(1)
  })
  it('should calculate the right usage', () => {
    const streaks = logsToStreaks(logs, { knownTrackables: {}, now: new Date('2022-01-15 13:00:42') })

    expect(streaks['#candy'].pastStreaks.length).toBe(1)

    expect(streaks['#walked'].streak).toBe(6)
    expect(streaks['#walked'].pastStreaks.length).toBe(2)

    expect(streaks['#mood'].streak).toBe(0)
    expect(streaks['#mood'].pastStreaks.length).toBe(1)
    expect(streaks['#mood'].pastStreaks[0].count).toBe(3)
  })
})
