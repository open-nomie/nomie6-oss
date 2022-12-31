import calculate from './calculate'
import { it, describe, expect } from 'vitest'
describe('Calculate tests', () => {
  it('should add', () => {
    expect(calculate([1, '+', 1])).toBe(2)
  })
  it('should subtract', () => {
    expect(calculate([4, '-', 1])).toBe(3)
  })
  it('should multiply', () => {
    expect(calculate([4, '*', 2])).toBe(8)
  })
  it('should divide', () => {
    expect(calculate([8, '/', 2])).toBe(4)
  })
  it('should do multiple', () => {
    expect(calculate([1, '+', 1, '*', 2])).toBe(4)
  })
  it('should handle decimals', () => {
    expect(calculate([1.5, '+', 1.5, '*', 2])).toBe(6)
  })
})
