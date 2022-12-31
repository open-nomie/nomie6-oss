import math from './math'
import findIndex from 'lodash/findIndex'
import { it, describe, expect } from 'vitest'
describe('utils/math/calc', () => {
  it('should add a calculator buffer', () => {
    expect(math.calculate([2, '+', 2])).toEqual(4)
    expect(math.calculate([2, '+', 2, '+', 4, '+', 4])).toEqual(12)
    expect(math.calculate([10, '*', 2])).toEqual(20)
    expect(math.calculate([5, '.', 5, '*', 2])).toEqual(11)
  })
})

describe('utils/math', function () {
  it('math.sum', () => {
    expect(math.sum([1, 2])).toEqual(3)
    expect(math.sum([])).toEqual(0)
  })
  it('math.average', () => {
    expect(math.average([30, 344, 21, 23])).toEqual(104.5)
    expect(math.average([])).toEqual(0)
  })

  it('should generate percentages', () => {
    let positivity = [10, 5, 2]
    let percentile = math.percentile(positivity)
    console.table(percentile)
    expect(percentile.join(',')).toBe('59,29,12')
  })

  it('math.average sleeo', () => {
    let avg = math.average([
      29400, 25980, 24720, 27420, 1860, 24900, 5400, 21540, 18960, 18060, 11340, 60, 21180, 3600, 17760, 28140, 26940,
      23580, 24000, 28260, 22500, 6000, 4020, 3840, 15660, 17340, 10800, 25440, 32400, 24000, 29820, 22500, 27660,
      23760, 5340, 22320, 28620, 20580, 22860, 21840, 25560,
    ])
    expect(avg).toEqual(19413.66)
    expect(math.average([])).toEqual(0)
  })

  it('math.round - default', () => {
    expect(math.round(10.12345)).toEqual(10.12)
  })
  it('math.round - 1000', () => {
    expect(math.round(10.12345, 1000)).toEqual(10.123)
  })
  it('math.round - 10', () => {
    expect(math.round(10.12345, 10)).toEqual(10.1)
  })
  it('math.max', () => {
    expect(math.max([0, 12, 223, 332, 12, 345, 32.32, -324])).toEqual(345)
    expect(math.max([])).toBe(0)
  })
  it('math.min - negative', () => {
    expect(math.min([0, 12, 223, 332, 12, 345, 32.32, -324, 443])).toEqual(-324)
    expect(math.min([])).toBe(0)
  })
  it('math.min - no negative', () => {
    expect(math.min([1, 12, 223, 332, 12, 345, 32.32, 443])).toEqual(1)
  })
  it('math.percentage', () => {
    expect(math.percentage(100, 50)).toEqual(50)
    expect(math.percentage(6, 6)).toEqual(100)
  })

  it('math.random', () => {
    let randomList = [10, 20, 30]
    let random = math.random(randomList)
    let found = findIndex(randomList, (r) => r == random)
    expect(found).toBeGreaterThan(-1)
  })
  // .join(",")
  //       .search(/10|20|30/) > -1
  it('math.random_range', () => {
    let random = math.random_range(100, 150)
    expect(random).toBeGreaterThan(99)
    expect(random).toBeLessThan(151)
  })
  it('math.percentile', () => {
    expect(math.sum(math.percentile([3, 6, 4]))).toBe(100)
  })
  it('math.trustfulNumber', () => {
    expect(math.trustfulNumber(32 + 'abc', 0)).toEqual(0)
  })
  it("should detect if it's a number or not", () => {
    expect(math.isNumber(0)).toBe(true)
    expect(math.isNumber(1.5)).toBe(true)
    expect(math.isNumber(undefined)).toBe(false)
    expect(math.isNumber('A')).toBe(false)
  })
  it("should detect if it's a float or not", () => {
    expect(math.isFloat(1.234)).toBe(true)
    expect(math.isFloat(0)).toBe(false)
    expect(math.isFloat(undefined)).toBe(false)
    expect(math.isFloat('A')).toBe(false)
  })
})
