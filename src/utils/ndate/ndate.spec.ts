import NDate from './ndate'
import dayjs from 'dayjs'
import { it, describe, expect } from 'vitest'
describe('NDate Test Suite', () => {
  it('should get this week and last week', () => {
    let firstDayOfWeek = NDate.getFirstDayOfWeek()
    let lastDayOfWeek = NDate.getLastDayOfWeek()
    expect(dayjs(firstDayOfWeek).format('ddd')).toBe('Sun')
    expect(lastDayOfWeek.format('ddd')).toBe('Sat')
  })

  it('should produce 7 days of dayjs records', () => {
    expect(NDate.thisWeek().length).toBe(7)
    expect(NDate.lastWeek().length).toBe(7)
  })

  it('should get this week and last week - when monday is the first day', () => {
    NDate.setFirstDayOfWeek('monday')

    let firstDayOfWeek = NDate.getFirstDayOfWeek()
    expect(firstDayOfWeek.format('ddd')).toBe('Mon')

    let lastDayOfWeek = NDate.getLastDayOfWeek()
    expect(lastDayOfWeek.format('ddd')).toBe('Sun')
  })
})
