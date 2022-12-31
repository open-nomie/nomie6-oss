import type { AwardConfig } from './award.class'
import Award from './award.class'
import type Storage from '../../storage/storage'

export default class AwardChain {
  chain: Array<Award>
  storage: typeof Storage
  private path: string

  constructor(storage: any, path: string) {
    this.storage = storage
    this.path = path
  }

  /**
   * Open Storage
   */
  async open(): Promise<AwardChain> {
    // Get file from storage
    let chain = await this.storage.get(this.path)
    // Map to Award objects
    this.chain = (chain || []).map((award: Award) => {
      return new Award(award)
    })
    // If empty chain
    if (!this.chain.length) {
      // Get genesis award
      let genesis: Award = this.genesis
      // Get genesis hash
      genesis.hash = genesis.getHash()
      // Push to chain
      this.chain.push(genesis)
      // Save to storage
      try {
        await this.save()
      } catch (e) {
        console.error(e.message)
      }
      // Return self
    }
    return this
  }

  /**
   * Save to storage
   */
  async save(): Promise<AwardChain> {
    return await this.storage.put(this.path, this.chain)
  }

  getById(id: string): Award | undefined {
    return this.chain.find((a: Award) => a.id === id)
  }

  awardExists(award: AwardConfig): boolean {
    return this.getById(award.id) ? true : false
  }

  /**
   * Get the Last Award
   */
  latestAward(): Award {
    return this.chain[this.chain.length - 1]
  }

  /**
   * Check if Chain is valid
   */
  get valid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]
      if (currentBlock.hash !== currentBlock.getHash()) {
        return false
      }
      if (currentBlock.phash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }

  /**
   * Get a Genesis Award
   */
  get genesis(): Award {
    return new Award({
      id: 'nomie-6',
      name: 'Started Nomie 6',
      reason: `You started using Nomie 6`,
      image: 'streak-0.svg',
      value: 1,
      phash: `0`,
    })
  }

  async add(award: Award): Promise<Award | undefined> {
    if (this.chain.find((a) => a.id === award.id)) {
      return null
    } else {
      // Get last in Chain
      let previous: Award = this.latestAward()
      // Get Last's Previous Hash
      award.phash = previous.hash
      // Make this awards hash
      award.hash = award.getHash()
      // Push to the chain
      this.chain.push(award)
      // Save to storage
      try {
        await this.save()
      } catch (e) {
        console.error(e)
      }
      // return award
      return award
    }
  }
}
