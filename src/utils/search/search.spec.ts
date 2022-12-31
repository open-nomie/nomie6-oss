import tokenizer from './search-tokenizer'
import searchItems from './search-items'
import { it, describe, expect } from 'vitest'
describe('Fuzzy vs Exact Searches', () => {
  const rows = [
    { note: '#moOd(3) is good', name: '1' },
    { note: 'the mood is bad', name: '2' },
    { note: 'MooD is bad', name: '2' },
    { note: 'moodle is not the word', name: '3' },
    { note: '+cheese +popcorn', name: '4' },
    { note: 'today @mom and @dad went home', name: '4' },
    { note: "@dad mom's not here", name: '4' },
  ]
  it('should support a fuzzy search - meaning the word can be part of another word', () => {
    let results = searchItems('mood', rows, { fields: ['note'], fuzzy: true })
    expect(results.length).toBe(4)
  })

  it('should support finding @People', () => {
    let results = searchItems('@dad', rows, { fields: ['note'], fuzzy: false })

    expect(results.length).toBe(2)
  })

  it('should search for generic word properly', () => {
    let results = searchItems('mood', rows, { fields: ['note'], fuzzy: false })
    expect(results.length).toBe(3)
  })
  it('should search for hashtags properly', () => {
    let results = searchItems('#mood', rows, { fields: ['note'], fuzzy: false })
    expect(results.length).toBe(1)
  })
  it('should exact search for user with @name properly', () => {
    let results = searchItems('@mom', rows, { fields: ['note'], fuzzy: false })
    expect(results.length).toBe(1)
  })
  it('should exact search for context', () => {
    let results = searchItems('+popcorn', rows, { fields: ['note'], fuzzy: false })
    expect(results.length).toBe(1)
  })
  it('should fuzzy search a user', () => {
    let results = searchItems('mom', rows, { fields: ['note'], fuzzy: true })
    expect(results.length).toBe(2)
  })
})

describe('Search Tokenizer', () => {
  it('should convert to an array', () => {
    const tokened = tokenizer(`åäö and Brandon or Brandon and emily`)
    expect(tokened[0][0]).toBe('aao')
  })
})

describe('Search Items AND Operator', () => {
  const rows = [
    { note: 'brandon', name: '2' },
    { note: 'EmILY', name: '2' },
    { note: 'brandon emily maddy and ethan', name: '3' },
    { note: 'who the hell is Harold Jenkins?', name: '4' },
    { note: "brandons emily's" },
  ]
  it('should handle AND searches', () => {
    let results = searchItems('brandon and emily', rows, { fields: ['note'] })
    expect(results[0].name).toBe('3')
  })
  // Or Operator
  it('should handle OR searches', () => {
    let res2 = searchItems('brandon or emily', rows)
    expect(res2.length).toBe(4)
  })
})

describe('Tracker Searches', () => {
  const rows = [
    { note: '#mood(5) good time', name: '2' },
    { note: 'mood and more @moods', name: '2' },
    { note: 'can you #moodx me more?', name: '3' },
  ]
  it('should search for hashtags properly', () => {
    let results = searchItems('#mood', rows, { fields: ['note'] })
    expect(results.length).toBe(1)
  })
})

describe('Latin Searches', () => {
  const rows = [
    { note: 'Spanish pingüino [piŋˈɡwino]', name: '2' },
    { note: 'Catalan aigües', name: '2' },
    { note: 'mingüei and Brontë no idea what these mean', name: '3' },
  ]
  it('should search latin characters', () => {
    let results = searchItems('Aigues', rows, { fields: ['note'] })
    expect(results[0].name).toBe('2')
    // Or Operator
    let res2 = searchItems('minGuei', rows, { fields: ['note'] })
    expect(res2[0].name).toBe('3')

    let res3 = searchItems('mingüei', rows, { fields: ['note'] })
    expect(res3[0].name).toBe('3')
  })
})
