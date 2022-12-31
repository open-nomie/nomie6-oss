import DumbStorage from '../../storage/engines/storage.dumb'
import AwardChain from './award-chain.class'
import Award from './award.class'
import { it, describe, expect } from 'vitest'
export async function generateMockChain(): Promise<AwardChain> {
  let chain = new AwardChain(DumbStorage, 'awards.json')
  await chain.open()
  await chain.add(
    new Award({
      name: 'Test Award',
      reason: 'Need to Test!',
    })
  )
  return chain
}

describe('AwardChain', () => {
  it('should create a new one', async () => {
    const chain = await generateMockChain()

    expect(chain.chain.length).toEqual(2)
    expect(chain.valid).toBe(true)
  })
})
