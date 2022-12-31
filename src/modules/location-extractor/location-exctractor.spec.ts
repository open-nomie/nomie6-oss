import { test, describe, expect } from 'vitest'
import NLog from '../../domains/nomie-log/nomie-log'
import extractLocations from './location-extractor'

const testLogs = [
  new NLog({ lat: 25.321345, lng: 85.633456, note: 'Tracker #cheese for Brandon 1' }),
  new NLog({ lat: 25.321545, lng: 85.633556, note: 'Tracker #cheese for Brandon 1' }),
  new NLog({ lat: 25.421345, lng: 85.632456, _id: 'brandontest', note: 'Tracker #cheese for @brandon, 2' }),
  new NLog({ lat: 26.321345, lng: 86.432456, note: 'Tracker #cheese? for @Brandon 3' }),
  new NLog({ lat: 27.321345, lng: 85.662456, note: 'Tracker #burger! for covid @brandOn 4' }),
]

describe('location grouping / extractro', () => {
  test('Should group locations', () => {
    const locations = extractLocations(testLogs)
    expect(locations.length).toBe(4)
  })
})
