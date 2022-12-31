import distance from './distance'
import { it, describe, expect } from 'vitest'
let locations = [
  [39.9576259, -85.9004901],
  [39.9572825, -85.9008173],
  [39.9568893, -85.9009447],
  [39.9831302, -83.1309127],
]

describe('modules/locate/distance', () => {
  it('distance is calculated', () => {
    let indy2ColumbusNauticalMiles = Math.round(
      distance.between([42.6769715, -79.8837796], [39.9831302, -83.1309127], 'nm')
    )
    let indy2ColumbusKM = Math.round(distance.between([42.6769715, -79.8837796], [39.9831302, -83.1309127]))
    expect(indy2ColumbusNauticalMiles).toEqual(218)
    expect(indy2ColumbusKM).toEqual(404)
  })
  it('determine max distance between multiple points', () => {
    let furthest = Math.round(distance.furthest(locations))
    expect(furthest).toEqual(127)
  })
  it('return zero if only one provied', () => {
    let furthest = Math.round(distance.furthest([[39.9576259, -85.9004901]]))
    expect(furthest).toEqual(0)
  })
})
