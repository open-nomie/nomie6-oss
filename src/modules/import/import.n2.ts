import { dashCase } from './import'
import type { INormalizedImport, ITrackers } from './import'
import TrackerClass from '../tracker/TrackerClass'
import type { ITracker } from '../tracker/TrackerClass'
import type { IBoard } from '../board/board'
import NLog from '../../domains/nomie-log/nomie-log'
import nid from '../nid/nid'

function getEmoji(label: string) {
  return label.substr(0, 1)
}

function getTrackers(fileData: any): ITrackers {
  let types = {
    tick: 'tick',
    numeric: 'value',
    range: 'range',
    timer: 'timer',
  }
  // Set a Trackers Holder
  let trackers: ITrackers = {}
  // Loop over the Trackers - will be an array
  ;(fileData.trackers || []).forEach((ot: any) => {
    ot.config = ot.config || {}
    // Search for an emoti by name
    // let emojis = EmojiSearch(ot.label.toLowerCase());
    // Set new tracker object
    let tracker: ITracker = {
      tag: dashCase(ot.label),
      label: ot.label,
      color: ot.color,
      emoji: getEmoji(ot.label),
      min: ot.config.min || '',
      max: ot.config.max || '',
      uom: ot.config.uom || 'num',
      type: types[ot.config.type || 'tick'] || 'tick',
      math: ot.config.math || 'sum',
      //   score: score[(ot.charge || 0).toString()] || null
    }
    // Assign tracker to trackers object
    trackers[tracker.tag] = new TrackerClass(tracker)
  })
  return trackers
}

function getBoards(fileData: any): Array<IBoard> {
  let boards = {}
  ;(fileData.trackers || []).forEach((tracker) => {
    let tag = dashCase(tracker.label)
    if (tracker.groups) {
      tracker.groups.forEach((group) => {
        if ((group || '').trim().length) {
          boards[group] = boards[group] || []
          if (boards[group].indexOf(tag) === -1) {
            boards[group].push(tag)
          }
        }
      })
    }
  })
  return Object.keys(boards)
    .filter((groupName) => {
      return groupName.toLowerCase() !== 'all'
    })
    .map((groupName) => {
      return {
        id: dashCase(groupName),
        label: groupName,
        trackers: boards[groupName] || [],
      }
    })
}

function getOldN1Trackers(fileData: any) {
  let oldTrackers = {}
  // If Trackers
  if (fileData.trackers.hasOwnProperty('length')) {
    // Loop over trackers
    ;(fileData.trackers || []).forEach((tracker) => {
      // Set a new base tracker with right tag
      let baseTkr = {
        ...{ tag: dashCase(tracker.label) },
        ...tracker,
      }
      // Add to oldTracker
      oldTrackers[tracker._id] = new TrackerClass(baseTkr)
    })
  }
  return oldTrackers
}

function getLogs(fileData: any): Array<NLog> {
  // Get current Trackers
  let trackers = getTrackers(fileData)
  // Hold Parent (tracker Id) for each event.
  let oldTrackers = getOldN1Trackers(fileData)
  // Hold Records
  let logs = []
  // First get the notes
  ;(fileData.notes || []).forEach((note: any) => {
    let log = new NLog({
      _id: nid(10),
      start: note.time,
      end: note.time + 1000,
      lat: (note.geo || []).length == 2 ? note.geo[0] : null,
      lng: (note.geo || []).length == 2 ? note.geo[1] : null,
      location: '',
      note: note.value,
    })
    logs.push(log)
  })

  // Count for missing parents
  let missingParent = 0
  // Next get the Tracked Events
  ;(fileData.events || []).forEach((event) => {
    // Get the tracker id (event.parent)
    // let eventTrackerId = event.parent;
    // Check if we have a tracker for it.
    if (oldTrackers.hasOwnProperty(event.parent)) {
      let note
      // Sert tracker to whatever the old parent tag is
      let tracker = trackers[oldTrackers[event.parent].tag] // this doesn't work like that.
      let tag = tracker.tag
      // If it's a tick - then no value
      if (tracker.type === 'tick') {
        note = `#${tracker.tag}`
      } else {
        // it's not a tick - so add the value
        note = `#${tracker.tag}(${event.value})`
      }
      // Create a new Record
      let record = new NLog({
        _id: nid(10),
        start: event.time,
        end: event.time + 1000,
        lat: (event.geo || []).length == 2 ? event.geo[0] : null,
        lng: (event.geo || []).length == 2 ? event.geo[1] : null,
        location: '',
        note: note,
      })
      // Push log to records
      logs.push(record)
    } else {
      // We have another tracked event for a tracker that doesnt exist
      // we cannot know what it was for... Differnt times back then
      missingParent++
    }
  })
  return logs
}

export function N2ImportNormalizer(importer: any): INormalizedImport {
  let final: INormalizedImport = {
    trackers: getTrackers(importer),
    boards: getBoards(importer),
    logs: getLogs(importer),
    context: [],
    people: {},
    dashboards: [],
    locations: [],
  }
  return final
}
