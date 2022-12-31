import dayjs from 'dayjs'
import { test, describe, expect } from 'vitest'
describe('Award Tests', () => {
  // const day = dayjs()
  test('Should handle dates', () => {
    const dateString1 = '2021-12-09T14:04:54.911Z'
    const date = new Date(dateString1)
    expect(dayjs(date).format('YYYY-MM-DD')).toBe('2021-12-09')
  })
})
