import dayjs from 'dayjs'
import NLog from '../nomie-log/nomie-log'
import { getUsageMap } from './stats-functions'
import { test, describe, expect } from 'vitest'
let log1 = new NLog({
  score: 1,
  end: dayjs().subtract(1, 'days').toDate().getTime(),
  note: 'Tracker #cheese for Brandon 1',
})
let log2 = new NLog({
  end: dayjs().subtract(1, 'days').toDate().getTime(),
  _id: 'brandontest',
  note: 'Tracker #cheese for @brandon, 2',
})
let log3 = new NLog({
  score: 2,
  end: dayjs().subtract(2, 'days').toDate().getTime(),
  note: 'Tracker #cheese? for @Brandon 3',
})
let log4 = new NLog({
  end: dayjs().subtract(3, 'days').toDate().getTime(),
  note: 'Tracker #burger! for covid @brandOn 4',
})
let log5 = new NLog({
  score: -1,
  end: dayjs().subtract(3, 'days').toDate().getTime(),
  note: 'Tracker #fries for Brandon 5',
})
let log6 = new NLog({
  end: dayjs().subtract(4, 'days').toDate().getTime(),
  note: 'Tracker #cheese(30) cheese(30) #cheesey(33) #cheese-bread for Brandon 6',
})
let log7 = new NLog({
  score: -1,
  end: dayjs().subtract(3, 'days').toDate().getTime(),
  note: 'Tracker #milk, for @brandon, +covid 7',
})
let log8 = new NLog({
  end: dayjs().subtract(2, 'days').toDate().getTime(),
  note: 'Tracker not cheese for Brandon +covid 8',
})
let log9 = new NLog({ _id: 'latintest', note: '@aigües @aiüe Catalan Tracker #gas #pizza for Brandon 9' })
let log10 = new NLog({
  _id: 'goattest',
  note: `Tracker #cheese(33:33) for Brandon 10

#goat`,
})

let logs = [log1, log2, log3, log4, log5, log6, log7, log8, log9, log10]

describe('Stats Functional Functions - a group of functions to bring us more functional', () => {
  const usage = getUsageMap(logs, {
    endDate: dayjs().endOf('day'),
    startDate: dayjs().subtract(30, 'days'),
    mode: 'd',
  })
  test('getting usage', () => {
    expect(usage).toBeTruthy()
  })
})
