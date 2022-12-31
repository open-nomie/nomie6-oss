import type { INormalizedImport, ITrackers } from './import'
import TrackerClass from '../tracker/TrackerClass'
import Board from '../board/board'
import type { IBoard } from '../board/board'
import NLog from '../../domains/nomie-log/nomie-log'

function getTrackers(fileData: any): ITrackers {
  let trackers: ITrackers = {}
  Object.keys(fileData.trackers).forEach((trackerTag) => {
    trackers[trackerTag] = new TrackerClass(fileData.trackers[trackerTag])
  })
  return trackers
}

function getBoards(fileData: any): Array<IBoard> {
  return (fileData.boards || []).map((board) => {
    return new Board(board)
  })
}

function getLogs(fileData: any): Array<NLog> {
  return (fileData.events || []).map((evt) => {
    evt.note = evt.notes
    return new NLog(evt)
  })
}

export function N3ImportNormalizer(importer: any): INormalizedImport {
  let final: INormalizedImport = {
    trackers: getTrackers(importer),
    boards: getBoards(importer),
    logs: getLogs(importer),
    people: {},
    context: [],
    locations: [],
    dashboards: [],
  }

  return final
}
