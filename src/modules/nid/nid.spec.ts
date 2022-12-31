import nid from './nid'
import { it, describe, expect } from 'vitest'
// Nomie ID
describe('modules/nid', function () {
  it('empty nid generator', () => {
    expect(nid().length).toEqual(32)
  })
  it('nid(4) should generate a length of 4', () => {
    expect(nid(4).length).toEqual(4)
  })
  it('two nid()s should generate unique values', () => {
    let nid1 = nid()
    let nid2 = nid()
    let match = nid1 == nid2
    expect(match).toBeFalsy()
  })
  it('should hash a string if provided', () => {
    let nid1 = nid('my string is this', 10)
    let nid2 = nid('my string is this', 10)
    let match = nid1 == nid2
    expect(match).toBeTruthy()
  })
})
