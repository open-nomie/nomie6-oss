import { parseNumber } from './parseNumber'
import { it, describe, expect } from 'vitest'
describe('Parse Number', () => {
  it('should handle parsing a float string', () => {
    expect(parseNumber('1.2345')).toBe(1.23)
  })
  it('should handle parsing a regular string', () => {
    expect(parseNumber('12345')).toBe(12345)
  })
  it('should handle parsing a float string', () => {
    expect(parseNumber('1.2345')).toBe(1.23)
  })

  it('should handle parsing a weird thing as NaN', () => {
    expect(parseNumber('abc1.2345')).toBe(NaN)
  })
})
