import type { INormalizedImport, IPeople, ITrackers } from './import'

import { DashboardClass } from '../../domains/dashboard2/dashboard-class'
import type { IBoard } from '../board/board'
import Location from '../../domains/locations/LocationClass'
import NLog from '../../domains/nomie-log/nomie-log'
import Person from '../../domains/people/Person.class'
import TrackerClass from '../tracker/TrackerClass'
import type { UniboardType } from '../../domains/board/UniboardStore'

function getTrackers(fileData: any): ITrackers {
  let trackers: ITrackers = {}
  Object.keys(fileData.trackers).forEach((trackerTag) => {
    trackers[trackerTag] = new TrackerClass(fileData.trackers[trackerTag])
  })
  return trackers
}

function getPeople(fileData: any): IPeople {
  let people: IPeople = {}
  Object.keys(fileData.people || {}).forEach((personId) => {
    people[personId] = new Person(fileData.people[personId])
  })
  return people
}

function getBoards(fileData: any): Array<IBoard> {
  return (fileData.boards || [])
    .map((board) => {
      const uniboard: UniboardType = {
        label: board.label,
        elements:
          board.elements ||
          (board.trackers || []).map((oldTrackerTag) => {
            if (oldTrackerTag.search('#') === -1) return `#${oldTrackerTag}`
            return oldTrackerTag
          }),
        id: board.id,
      }
      return uniboard
    })
    .filter((b) => b)
}

const getDashboards = (fileData: any): Array<DashboardClass> => {
  let dashboards = []
  if (fileData.dashboards && fileData.dashboards.dashboards) {
    dashboards = fileData.dashboards.dashboards
  } else if (fileData.dashboards) {
    dashboards = fileData.dashboards
  }
  dashboards = dashboards.map((dash) => {
    return new DashboardClass(dash)
  })
  return dashboards
}

function getLogs(fileData: any): Array<NLog> {
  return (fileData.events || []).map((evt) => {
    return new NLog(evt)
  })
}

export function N5ImportNormalizer(importer: any): INormalizedImport {
  const dashboards = getDashboards(importer)

  let final: INormalizedImport = {
    trackers: getTrackers(importer),
    boards: getBoards(importer),
    logs: getLogs(importer),
    people: getPeople(importer),
    context: importer.context || [],
    locations: (importer.locations || []).map((loc) => {
      return new Location(loc)
    }),
    dashboards: dashboards,
  }

  return final
}
