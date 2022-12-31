import { ContextClass } from './context-class'
import { test, describe, expect } from 'vitest'
describe('context class', () => {
  test('should work as a stringl', () => {
    const ctx = new ContextClass('string')
    expect(ctx.tag).toBe('string')
  })
  test('should work as a object', () => {
    const stub = {
      tag: 'sample',
      duration: 1,
      emoji: 'B',
    }
    const ctx = new ContextClass(stub)

    expect(ctx.tag).toBe('sample')
    expect(ctx.label).toBe('sample')
    expect(ctx.emoji).toBe('B')
  })
  test('should convert to a Trackable just fine', () => {
    const stub = {
      tag: 'sample',
      duration: 1,
      emoji: 'B',
      avatar: 'C',
    }
    const ctx = new ContextClass(stub)
    expect(ctx.tag).toBe('sample')
    const trackable = ctx.toTrackable()

    expect(trackable.ctx.tag).toBe('sample')

    expect(trackable.tag).toBe('+sample')
    expect(trackable.label).toBe('sample')
    expect(trackable.emoji).toBe('B')
    expect(trackable.avatar).toBe('C')

    expect(ctx.asObject.tag).toBe('sample')
    expect(ctx.asObject.label).toBe('sample')
    expect(ctx.asObject.emoji).toBe('B')
    expect(ctx.asObject.avatar).toBe('C')
  })
})
