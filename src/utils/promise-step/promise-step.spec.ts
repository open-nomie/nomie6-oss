import promiseStep from './promise-step'
import { it, describe, expect } from 'vitest'
describe('promise step!', () => {
  it('should wait to do things one at a time.', async () => {
    let sample: Array<any> = ['max', 'george', 'meag', 'ryan', 'sowmya']
    let final: Array<any> = []
    let finished: any = await promiseStep(sample, (row) => {
      final.push(row)
      return Promise.resolve(row)
    })
    expect(finished.length).toBe(sample.length)
    expect(final.join(',')).toEqual(sample.join(','))
  })
})
