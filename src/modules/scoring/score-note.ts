import type { ITrackers } from '../import/import'
import ScoreTracker from './score-tracker'
import extractor from '../../utils/extract/extract'
import math from '../../utils/math/math'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
declare let window: any

export default function ScoreNote(note: string, endTime: Date, knownTrackers: ITrackers): number {
  endTime = endTime || new Date()
  // Extract Trackers
  let trackerElements = extractor.trackers(note || '')

  // Hack of the centry! If known Trackers isn't provided, get it from
  // trackerstore in the Window scope - this is so sloppy
  // TODO: // make this not sloppy
  knownTrackers = knownTrackers || {}
  // Extract Scores to total for this note
  let scores = trackerElements.map((tElement) => {
    if (knownTrackers[tElement.id]) {
      return ScoreTracker(parseNumber(tElement.value), knownTrackers[tElement.id], endTime)
    } else {
      return 0
    }
  })

  return math.sum(scores)
}
