import { hasNote } from './on-this-day-utils'
import { it, describe, expect } from 'vitest'
describe('On this day helper', () => {
  it('should know if a note is a note or a data note', () => {
    const note1 = '#brandon is #taging a #bunch of #stuff and #should be a #note'
    const note2 = '#brandon  #taging  #bunch  #stuff and #should  #note'
    expect(hasNote(note1)).toBe(true)

    expect(hasNote(note2)).toBe(false)
  })
})
