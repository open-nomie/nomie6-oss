import Tracker from './TrackerClass'
import calcTrackerScore from '../scoring/score-tracker'
import { it, describe, expect } from 'vitest'

const mood = new Tracker({
  tag: 'mood',
  type: 'range',
  color: '#369DD3',
  math: 'mean',
  ignore_zeros: false,
  uom: 'num',
  emoji: '😉',
  default: '3',
  max: '10',
  min: '1',
  score: 'custom',
  score_calc: [
    {
      if: 'value',
      is: 'gt',
      v: '5',
      sc: '1',
    },
    {
      if: 'value',
      is: 'lt',
      v: '5',
      sc: '-1',
    },
  ],
  goal: null,
  one_tap: false,
  label: 'Mood',
})

describe('Calculate Tracker Score', () => {
  it('should calculate a dynamic score', () => {
    let score = calcTrackerScore(6, mood)
    expect(score).toEqual(1)
  })
})
