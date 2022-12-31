import uom from './uom'
import { test, describe, expect } from 'vitest'

describe('UOM Tests', () => {
  test('should return array of uom', () => {
    expect(uom.toArray() instanceof Array).toBe(true)
  })

  test('it should format the display', () => {
    expect(uom.format(10, 'dollars')).toBe('$10.00')
    expect(uom.format(10.432, 'dollars')).toBe('$10.43')
    expect(uom.format(10000.432, 'dollars', false)).toBe('$10000.43')
    expect(uom.format(13, 'inch')).toBe('13 in')
    expect(uom.format(13, 'inch', false)).toBe('13')
    expect(uom.format(123, 'percent')).toBe('123%')
    expect(uom.format(3600, 'timer')).toBe('1h 0m')
    expect(uom.format(10000, 'bitcoin')).toBe('B10,000')
  })

  test('it should fail gracefully', () => {
    expect(uom.format(10, 'nothingexists')).toBe(10)
    expect(uom.format('turkey', 'C')).toBe('turkey')
    expect(uom.format(0, 'bitcoin')).toBe('B0')
  })

  test('it should handle pre and format', () => {
    expect(uom.format(10, 'dollars', true)).toBe('$10.00')
  })

  test('it should handle pre and symbol', () => {
    expect(uom.format(10, 'bitcoin', true)).toBe('B10')
  })

  test('it should get the symbol', () => {
    expect(uom.abv('dollars')).toBe('$')
    expect(uom.abv('turkey')).toBe(null)
  })

  test('it should get the singular and plural', () => {
    expect(uom.singular('dollars')).toBe('Dollar')
    expect(uom.plural('dollars')).toBe('Dollars')
    expect(uom.singular('turkey')).toBe('turkey')
    expect(uom.plural('turkey')).toBe('turkey')
  })

  test('it should add commas to a number', () => {
    expect(uom.addCommas(10000)).toBe('10,000')
    expect(uom.addCommas(10000.5)).toBe('10,000.5')
    expect(uom.addCommas()).toBe('0')
  })
})
// test('it should get Grouped by Type', () => {
//   expect(uom.toGroupedArray().general).toBeInstanceOf(Array)
// })
