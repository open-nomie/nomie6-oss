import emojiCount from './emoji-count'
import { it, describe, expect } from 'vitest'
describe('emoji-count', () => {
  it('should count the right number of emojis', () => {
    expect(emojiCount(`☀️😙❤️🍔`)).toBe(4)
    expect(emojiCount(`WD`)).toBe(0)
    expect(emojiCount(`👏😆`)).toBe(2)
  })
})
