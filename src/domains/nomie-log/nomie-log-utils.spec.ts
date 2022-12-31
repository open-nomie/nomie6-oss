import { isDataNote, isTextNote, notePercentage } from './nomie-log-utils'
import { it, describe, expect } from 'vitest'
describe('Nomie Log Utils', () => {
  it('should know if a note is a note or a data note', () => {
    const note1 = '#brandon is #taging a #bunch of #stuff and #should be a #note'
    const note2 = '#brandon  #taging  #bunch  #stuff and #should be NOT be a #note'

    expect(notePercentage(note1)).toBe(50)
    expect(notePercentage(note2)).toBe(45)

    expect(isTextNote(note1)).toBe(true)
    expect(isTextNote(note2)).toBe(false)

    expect(isDataNote(note1)).toBe(false)
    expect(isDataNote(note2)).toBe(true)
  })
})
