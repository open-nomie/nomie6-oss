import ordinal from './ordinal'
import { it, describe, expect } from 'vitest'
describe('ordinal!', () => {
  it('should change things to ordinal', () => {
    expect(ordinal(1)).toBe('1st')
    expect(ordinal(2)).toBe('2nd')
    expect(ordinal(3)).toBe('3rd')
    expect(ordinal(4)).toBe('4th')
    expect(ordinal(432)).toBe('432nd')
  })
})
