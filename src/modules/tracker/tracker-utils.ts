import { startTimer, stopTimer } from '../../domains/tracker/TrackerStore'

import { ActiveLogStore } from '../../domains/capture-log/CaptureLogStore'
import type { ITrackers } from '../import/import'
import { Interact } from '../../store/interact'
import { onTrackerTap } from '../../domains/tracker/input/TrackerInputStore'
import { saveLog } from '../../domains/ledger/LedgerStore'

/**
 * Long Press a Tracker
 * If it's a timer, it will toggle the running state.
 * otherwise, it will auto save a log using the trackers default value
 * @param tracker
 */
export const onTrackerLongPress = async (tracker, trackers: ITrackers) => {
  let note: string
  // If it's a timer - then toggle running state
  if (tracker.type == 'timer') {
    if (tracker.started) {
      const age = (new Date().getTime() - tracker.started) / 1000
      note = tracker.toNoteString(age)
      stopTimer(tracker)
    } else {
      startTimer(tracker)
    }
    // If itx anything other than a note-type get the value
  } else if (tracker.type !== 'note' && tracker.type !== 'picker') {
    note = tracker.toNoteString()
  }

  // If we have a note
  if (note && note.length) {
    // Add element to Capture Log
    const confirmed = await Interact.confirm('Save Note?', note)
    if (confirmed) {
      ActiveLogStore.addElement(note)
      // Save it
      await saveLog(ActiveLogStore.asLog())
      // Clear active log
      await ActiveLogStore.clear()
    }
  } else if (tracker.type !== 'timer') {
    // If it's a note - just open it like normal
    onTrackerTap(tracker, trackers)
  }
  return false
}
