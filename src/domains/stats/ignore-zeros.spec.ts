import ignoreZeros from './ignore-zeros'
import { it, describe, expect } from 'vitest'
describe('Ignore Zeros from an array by back filling', () => {
  it('should remove zeros and replace with the last known', () => {
    let arr: Array<number> = [0, 10, 0, 0, 0]
    expect(ignoreZeros(arr)[3]).toBe(10)

    let arr2: Array<number> = [0, 1.3, 0, 4, 0, 0, 0, 0, 20, 0, 0, 3.4, 0]
    let answer = [0, 1.3, 1.3, 4, 4, 4, 4, 4, 20, 20, 20, 3.4, 3.4]
    expect(ignoreZeros(arr2).join()).toBe(answer.join())
  })
})
