import math from '../../utils/math/math'
import type { ITrackables } from '../ledger/ledger-tools'
import type NLog from '../nomie-log/nomie-log'
import logsToTrackableUsage from '../usage/usage-utils'

export type IFocusUnit = 'mind' | 'body' | 'spirit'

export const focusTypes: Array<IFocus> = [
  { id: 'mind', label: 'Mind', emoji: '🧠', color: '#087E8B' },
  { id: 'body', label: 'Body', emoji: '🫀', color: '#EB5E55' },
  { id: 'spirit', label: 'Spirit', emoji: '👻', color: '#FFB400' },
]

export type IFocus = {
  id: IFocusUnit
  label: string
  emoji: string
  color: string
}

export type IFocusResults = { score: number; focus: IFocus }

export const getFocusById = (id: IFocusUnit): IFocus | undefined => {
  return getFocusTypes().find((d) => d.id === id)
}

export const getFocusTypes = (): Array<IFocus> => {
  return focusTypes
}

// export const getFocusScoresFromUsage = (usage:TrackableUsage):Array<IFocusResults> => {

// }

/**
 * Get Focus Scores from Logs
 * returns the mind, body, spirit scores
 * @param logs
 * @param known
 * @returns
 */
export const getFocusScoresFromLogs = (logs: Array<NLog>, known: ITrackables): Array<IFocusResults> => {
  // Create a map to hold the results
  const focusMap: { [key: string]: IFocusResults } = {}
  getFocusTypes().forEach((focus: IFocus) => {
    focusMap[focus.id] = {
      score: 0,
      focus,
    }
  })

  // Get Trackable Usages from the logs
  const usages = logsToTrackableUsage(logs, { trackables: known })

  // Loop over usages calcuate scores
  Object.keys(usages).forEach((tag: string) => {
    const trackableUsage = usages[tag]

    // Get Positivity from this trackable usage
    const positivity = math.sum(trackableUsage.positivity)

    // If we have a tracker
    const tracker = trackableUsage.trackable.tracker
    if (tracker) {
      // What does this tracker focus on?
      const focuses = tracker.focus || []
      focuses.forEach((focusId: IFocusUnit) => {
        // Calculate Score
        focusMap[focusId].score = focusMap[focusId].score + positivity
      })
    }
  })

  return Object.keys(focusMap).map((focusId) => {
    return focusMap[focusId]
  })
}
