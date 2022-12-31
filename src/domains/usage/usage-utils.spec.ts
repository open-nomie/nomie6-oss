import { lastUsedCompareAndMerge, updateStreak } from './usage-utils'
import { it, describe, expect } from 'vitest'
const existing = {
  min: {
    v: 2,
    d: '2022-02-15T15:00:00.000Z',
  },
  max: {
    v: 21,
    d: '2022-02-15T15:00:00.000Z',
  },
  streak: {
    v: 3,
    d: '2022-03-01T15:00:00.000Z',
  },
  longest: {
    v: 1,
    d: '2022-02-15T15:00:00.000Z',
  },
  last: {
    v: 6,
    d: '2022-02-15T17:00:00.000Z',
  },
  logId: '78455e030d',
  bookId: '2022-02-1',
  tag: '#cider',
}
const mockToday = new Date('2022-03-02T17:00:00.000Z')

describe('usage-utils updateStreak', () => {
  const current = {
    v: 1,
    d: '2022-03-02T17:00:00.000Z',
  }
  const updated = updateStreak(current, existing.streak, existing.longest, mockToday)
  it('should update the streak properly', () => {
    expect(updated.streak.v).toBe(4)
  })
})

describe('usage-utils working with MIN', () => {
  const res = lastUsedCompareAndMerge(
    existing,
    {
      v: 1,
      d: '2022-03-02T17:00:00.000Z',
    },
    mockToday
  )
  it('should update the new Min', () => {
    expect(res.min.v).toBe(1)
    expect(res.min.d).toBe('2022-03-02T17:00:00.000Z')
  })
  it('should update the new last', () => {
    expect(res.last.v).toBe(1)
    expect(res.last.d).toBe('2022-03-02T17:00:00.000Z')
  })
  it('should update the streak', () => {
    expect(res.streak.v).toBe(4)
    expect(res.streak.d).toBe('2022-03-02T17:00:00.000Z')
  })
})

describe('usage-utils working with a new Max', () => {
  const res = lastUsedCompareAndMerge(
    existing,
    {
      v: 22,
      d: '2022-03-02T17:00:00.000Z',
    },
    mockToday
  )
  it('should update the new Min', () => {
    expect(res.max.v).toBe(22)
    expect(res.max.d).toBe('2022-03-02T17:00:00.000Z')
  })
  it('should update the new last', () => {
    expect(res.last.v).toBe(22)
    expect(res.last.d).toBe('2022-03-02T17:00:00.000Z')
  })
  it('should update the streak', () => {
    expect(res.streak.v).toBe(4)
    expect(res.streak.d).toBe('2022-03-02T17:00:00.000Z')
  })
})
