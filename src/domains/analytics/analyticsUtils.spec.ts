import NLog from '../nomie-log/nomie-log'
import { getGeneralUsageCounts } from './analyticsUtils'
import type { GeneralCountsResponse } from './analyticsUtils'
import { test, describe, expect } from 'vitest'

const testLogs = [
  new NLog({ note: 'Tracker #cheese for Brandon 1' }),
  new NLog({ _id: 'brandontest', note: 'Tracker #cheese for @brandon, 2' }),
  new NLog({ note: 'Tracker #cheese? for @Brandon 3' }),
  new NLog({ note: 'Tracker #burger! for covid @brandOn 4' }),
  new NLog({ note: 'Tracker #fries for Brandon 5' }),
  new NLog({ note: 'Tracker #cheese(30) cheese(30) #cheesey(33) #cheese-bread for Brandon 6' }),
  new NLog({ note: 'Tracker #milk, for @brandon, +covid 7' }),
  new NLog({ note: 'Tracker not cheese for Brandon +covid 8' }),
  new NLog({ _id: 'latintest', note: '@aigües @aiüe Catalan Tracker #gas #pizza for Brandon 9' }),
  new NLog({
    _id: 'goattest',
    note: `Tracker #cheese(33:33) for Brandon 10  #goat`,
  }),
]

describe('analytics specs', () => {
  test('should get couns', () => {
    const usage: GeneralCountsResponse = getGeneralUsageCounts(testLogs)
    expect(usage).toBeTruthy()
    expect(usage.totalDatapoints).toBeGreaterThan(0)
  })
})
