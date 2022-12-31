import dayjs from 'dayjs'
import { adjustLastUsedStreak, LastUsedItems } from './last-used-utils'
import { it, describe, expect } from 'vitest'
describe('last used streak monitoring tests', () => {
  it('should know how to update streaks', () => {
    const now = dayjs()
    const fromStorage: LastUsedItems = {
      '#bob': {
        date: now.subtract(1, 'day').toDate().toJSON(),
        value: 12,
        streak: 3,
        streakStart: now.subtract(3, 'day').toDate().toJSON(),
      },
      '#sally': {
        date: now.subtract(2, 'day').toDate().toJSON(),
        value: 12,
        streak: 3,
        streakStart: now.subtract(3, 'day').toDate().toJSON(),
      },
    }

    const updated = adjustLastUsedStreak({
      previous: fromStorage['#bob'],
      updated: {
        date: now.toDate().toJSON(),
        value: 14,
      },
    })
    expect(updated.streak).toBe(4)

    // Break the Streak
    const updated2 = adjustLastUsedStreak({
      previous: fromStorage['#sally'],
      updated: {
        value: 14,
      },
    })
    expect(updated2.streak).toBe(1)
    expect(updated2.pastStreaks.length).toBe(1)

    const updated3 = adjustLastUsedStreak({
      previous: {},
      updated: {
        value: 14,
      },
    })
    expect(updated3.streak).toBe(1)
  })
})
