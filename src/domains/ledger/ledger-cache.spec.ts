/**
 * @vitest-environment jsdom
 */

import NLog from '../nomie-log/nomie-log'
import { getLogChaseDates, getLogsFromCache, getLogsFromCacheByDay, saveLogToCache } from './ledger-cache'
import { it, describe, expect } from 'vitest'
describe('Ledger Cache', () => {
  it('should allow saving of a log', async () => {
    const log = new NLog({ note: 'This is a note! #mood(4)' })
    const saved = await saveLogToCache(log)
    expect(saved).toBeTruthy()
    const items = await getLogsFromCache()
    expect(items.length).toBe(1)
  })
  it('should get a list of dates from the cache', async () => {
    const log1 = new NLog({ note: 'This is a note! #mood(4)', end: new Date('2013-12-21 15:00:00') })
    const log3 = new NLog({ note: 'This is a note! #mood(4)', end: new Date('2016-12-21 15:00:00') })
    const log31 = new NLog({ note: 'This is a note! #mood(4)', end: new Date('2016-12-21 15:00:00') })
    const log2 = new NLog({ note: 'This is a note! #mood(4)', end: new Date('2020-12-21 15:00:00') })
    await saveLogToCache(log1)
    await saveLogToCache(log2)
    await saveLogToCache(log31)
    await saveLogToCache(log3)
    const dates = await getLogChaseDates()
    expect(dates.length).toBe(4) // including the one from the test before

    const logs = await getLogsFromCacheByDay(new Date('2016-12-21 15:00:00'))
    expect(logs.length).toBe(2)
  })
})
