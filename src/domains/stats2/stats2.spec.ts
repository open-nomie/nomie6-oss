import NLog from '../nomie-log/nomie-log'
import logsToTrackableUsage from '../usage/usage-utils'
import { test, describe, expect } from 'vitest'
const logs = [
  { date: '2021-10-01', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-01', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-01', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-02', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-03', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-03', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-10', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-11', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-11', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-12', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-13', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-14', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-14', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-14', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-14', note: '#walked(1) #jogged(2) #mileage(3)' },
  { date: '2021-10-14', note: '#walked(1) #jogged(2) #mileage(3)' },
].map((d) => {
  return new NLog({
    note: d.note,
    end: new Date(d.date),
  })
})

describe('Stats 2 Tests - stat2times to usage chunks ', () => {
  test('it should chunk properly by day', () => {
    const usage = logsToTrackableUsage(logs, { trackables: {} })
    expect(usage['#walked'].byDay.values[0]).toBe(3)
  })
})
