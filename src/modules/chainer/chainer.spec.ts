import Chainer from './chainer'
import { it, describe, expect } from 'vitest'
describe('Chainer', () => {
  it('should chain steps', () => {
    let test = 'Hi there'
    let d = new Chainer(test).whenExists((val) => val).value
    expect(d).toBe('Hi there')
  })
})
