import time from './time'
import { it, describe, expect } from 'vitest'
describe('utils/time', function () {
  it('padTime', () => {
    expect(time.padTime(1)).toEqual('01')
  })
  it('secondsToTime', () => {
    expect(time.secondsToTime(60 * 60)).toEqual('1:00:00')
    expect(time.secondsToTime(10 * 60 * 60)).toEqual('10:00:00')
  })
  it('msToSecond', () => {
    expect(time.msToSecond(1000)).toEqual(1)
  })
  it('timestringToSeconds', () => {
    expect(time.timestringToSeconds('01:00:00')).toEqual(3600)
    expect(time.timestringToSeconds('01:00:05')).toEqual(3605)
    expect(time.timestringToSeconds('02:00:00')).toEqual(7200)
  })
  it('unitsToSeconds', () => {
    expect(time.unitsToSeconds(1, 0, 0)).toEqual(3600)
    expect(time.unitsToSeconds(1, 0, 5)).toEqual(3605)
    expect(time.unitsToSeconds(2, 0, 0)).toEqual(7200)
  })
  it('getNumberedArray', () => {
    expect(time.getNumberedArray(2)).toContain('02')
  })
})
