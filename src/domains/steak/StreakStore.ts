import {
  getTrackerInputAsString
} from '../tracker/input/TrackerInputStore'

import type { ITrackables } from '../trackable/trackable-utils'


import NLog from '../nomie-log/nomie-log'
import type { Trackable } from '../trackable/Trackable.class'
import dayjs from 'dayjs'
import { getDateFormats } from '../preferences/Preferences'

import { saveLog } from '../ledger/LedgerStore'

import ScoreNote from '../../modules/scoring/score-note'
import type { ITrackers } from '../../modules/import/import'
import { openLogEditor } from '../nomie-log/LogEditorStore'

const dateFormats = getDateFormats()

export const trackOnThisDay = async (trackable: Trackable, date: Date, known: ITrackables): Promise<boolean> => {
  try {
    let updatedDate = dayjs(date).hour(dayjs().hour()).minute(dayjs().minute()).toDate();
    let log: NLog = new NLog({ end: updatedDate })

    if (trackable.tracker) {
      if (trackable.tracker.type === 'tick') {
        log.note = `${trackable.tag} ${trackable.tracker.getIncluded(1).trim()}`
      } else {
        const response = await getTrackerInputAsString({
          tracker: trackable.tracker,
          trackables: known,
          value: undefined,
          allowSave: false,
          expandNote: true,
          nextLabel: `Add to ${dayjs(date).format(dateFormats.tinyDate)} →`,
          retrospective: true,
          // onClose: closeModal,
        })
        log.note = response.raw;

        // Score the Note
        let knownTrackers: ITrackers = {}
        Object.keys(known).map((tag) => {
          if (tag.substring(0, 1) === '#') {
            knownTrackers[tag.replace('#', '')] = known[tag].tracker
          }
        })
        log.score = ScoreNote(log.note, log.end, knownTrackers)
      }
      await saveLog(log)
    } else if(trackable.type == 'person') {
      openLogEditor(new NLog({
        note: `${trackable.tag} `,
        end: date
      }))
    } else {
      log.note = trackable.tag
      await saveLog(log)
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

// export const trackOnThisDay2 = async (trackable: Trackable, date: Date, known: ITrackables) => {
//   const newDate = dayjs(date).hour(dayjs().hour()).minute(dayjs().minute())
//   if (trackable.tracker) {
//     try {
//       const trackerInput = await getTrackerInputAsString({
//         tracker: trackable.tracker,
//         trackables: known,
//         expandNote: true,
//         value: trackable.tracker.default,
//         nextLabel: Lang.t('general.save', 'Save'),
//       })

//       if (trackerInput) {
//         const log = new NLog({ end: newDate.toDate().getTime(), note: `${trackerInput.raw}` })
//         await saveLog(log)
//         showToast({ message: Lang.t('general.saved', 'Saved') })
//       }
//     } catch (e) {
//       Interact.error(e)
//     }
//   } else if (trackable.person) {
//     openPersonModal(trackable.person, { date: newDate.toDate() })
//   }
//   return false
// }
