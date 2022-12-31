// Nomie ID
import logFilter from './log-filter'
import NomieLog from '../nomie-log'
import { it, describe, expect } from 'vitest'
import { strToToken, Token } from '../../../modules/tokenizer/lite'

let log1 = new NomieLog({ note: 'Tracker #cheese for Brandon 1' })
let log2 = new NomieLog({ _id: 'brandontest', note: 'Tracker #cheese for @brandon, 2' })
let log3 = new NomieLog({ note: 'Tracker #cheese? for @Brandon 3' })
let log4 = new NomieLog({ note: 'Tracker #burger! for covid @brandOn 4' })
let log5 = new NomieLog({ note: 'Tracker #fries for Brandon 5' })
let log6 = new NomieLog({ note: 'Tracker #cheese(30) cheese(30) #cheesey(33) #cheese-bread for Brandon 6' })
let log7 = new NomieLog({ note: 'Tracker #milk, for @brandon, +covid 7' })
let log8 = new NomieLog({ note: 'Tracker not cheese for Brandon +covid 8' })
let log9 = new NomieLog({ _id: 'latintest', note: '@aigües @aiüe Catalan Tracker #gas #pizza for Brandon 9' })
let log10 = new NomieLog({
  _id: 'goattest',
  note: `Tracker #cheese(33:33) for Brandon 10

#goat`,
})

let logs = [log1, log2, log3, log4, log5, log6, log7, log8, log9, log10]
let cheeseToken: Token = { id: 'cheese', type: 'tracker', raw: '#cheese', prefix: '#' }
let covidToken: Token = { id: 'covid', type: 'context', raw: '+covid', prefix: '+' }
let brandonToken: Token = { id: 'brandon', type: 'person', raw: '@brandon', prefix: '@' }
let latinToken: Token = { id: 'aigües', type: 'person', raw: '@aigües', prefix: '@' }
let goatToken: Token = { id: 'goat', type: 'tracker', raw: '#goat', prefix: '#' }

describe('modules/log-filter trackers', function () {
  it('Should find the latintest', () => {
    let filter = {
      search: latinToken,
    }
    let results = logFilter(logs, filter)
    expect((results[0] || {})._id).toEqual('latintest')
  })

  it('Should find the brandontest', () => {
    let filter = {
      search: brandonToken,
    }
    let results = logFilter(logs, filter)
    expect((results[0] || {})._id).toEqual('brandontest')
  })

  it('Should find the goat on a new line', () => {
    let filter = {
      search: goatToken,
    }
    let results = logFilter(logs, filter)
    expect((results[0] || {})._id).toEqual('goattest')
  })

  it('should search for a trackableElement if provided', () => {
    let filter = {
      search: cheeseToken,
    }
    let results = logFilter(logs, filter)
    expect(results.length).toEqual(5)
  })
  it('should search for a #hashtag if provided', () => {
    let filter = {
      search: '#cheese',
    }
    let results = logFilter(logs, filter)
    expect(results.length).toEqual(5)
  })
})

describe('modules/log-filter people', function () {
  it('should search for a trackableElement if provided', () => {
    let filter = {
      search: brandonToken,
    }
    let results = logFilter(logs, filter)
    expect(results.length).toEqual(4)
  })
  it('should search for a @username if provided', () => {
    let cheeseFilter = {
      search: '@brandon',
    }
    let results = logFilter(logs, cheeseFilter)
    expect(results.length).toEqual(4)
  })
})

describe('modules/log-filter context', function () {
  it('should search for a trackableElement if provided', () => {
    let filter = {
      search: covidToken,
    }
    let results = logFilter(logs, filter)
    expect(results.length).toEqual(2)
  })
  it('should search for a +context if provided', () => {
    let cheeseFilter = {
      search: '+covid',
    }
    let results = logFilter(logs, cheeseFilter)
    expect(results.length).toEqual(2)
  })
})

describe('modules/log-filter generic term', function () {
  it('should search for a trackableElement if provided', () => {
    const token: Token = strToToken('+covid')
    let filter = {
      search: token,
    }
    let results = logFilter(logs, { ...filter, ...{ fuzzy: true } })
    expect(results.length).toEqual(2)
  })
  it('should search for generic term using Fuzzy logic', () => {
    let filter = {
      search: 'covid',
    }
    let results = logFilter(logs, { ...filter, ...{ fuzzy: true } })
    expect(results.length).toEqual(3)
  })
})
