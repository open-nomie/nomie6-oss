import { UOMClass } from './uom.class'
import { it, describe, expect } from 'vitest'
describe('UOM Class test', () => {
  it('should work as a class', () => {
    const celsius = new UOMClass('celsius')
    const fluidounce = new UOMClass('fluidounce')
    expect(celsius.system).toBe('metric')
    expect(celsius.convertTo('imperial').id).toBe('fahrenheit')
    expect(fluidounce.convertTo('metric').id).toBe('milliliter')
    expect(fluidounce.convertTo('imperial').id).toBe('fluidounce')
  })

  it('should convert values', () => {
    expect(new UOMClass('fluidounce').convertValueTo(12, 'metric')).toBe(354.88)
    expect(new UOMClass('gallon').convertValueTo(1, 'metric')).toBe(3.78)
    expect(new UOMClass('liter').convertValueTo(10, 'imperial')).toBe(2.65)
    expect(new UOMClass('gallon').convertValueTo(2.65, 'metric')).toBe(10.02)
    expect(new UOMClass('mile').convertValueTo(10, 'metric')).toBe(16.09)
    expect(new UOMClass('km').convertValueTo(10, 'imperial')).toBe(6.21)
    expect(new UOMClass('kg').convertValueTo(150, 'imperial')).toBe(330.69)
    expect(new UOMClass('pound').convertValueTo(164, 'metric')).toBe(74.39)
    expect(new UOMClass('oz').convertValueTo(1, 'metric')).toBe(28.35)
    expect(new UOMClass('gram').convertValueTo(50, 'imperial')).toBe(1.76)
  })
})
