import { BookOutline, ChatboxOutline, MapOutline, PeopleOutline } from '../../components/icon/nicons'
import BookmarksOutline from "../../n-icons/BookmarksOutline.svelte";
import { Lang } from '../../store/lang'
import type NLog from '../nomie-log/nomie-log'
import type Person from '../people/Person.class'
import type { Token } from '../../modules/tokenizer/lite'
import TrackerClass from '../../modules/tracker/TrackerClass'
import { isLongFormat } from '../nomie-log/nomie-log-utils'
import math from '../../utils/math/math'

export type OTDViewOption = 'all' | 'notes' | 'trackers' | 'people' | 'locations' | 'context'

export interface OTDView {
  view: OTDViewOption
  icon: any
  label: string
  reduce: Function
}

export let OTDViews: Array<OTDView> = [
  {
    view: 'all',
    icon: BookOutline,
    label: `${Lang.t('general.all', 'All')}`, 
    reduce: (items: Array<NLog>) => {
      return items.length
    },
  },
  {
    view: 'context',
    icon: BookmarksOutline,
    label: `${Lang.t('general.context', 'Context')}`,
    reduce: (items: Array<NLog>) => {
      return items.length
    },
  },
  {
    view: 'notes',
    icon: ChatboxOutline,
    label: `${Lang.t('general.notes', 'Notes')}`,
    reduce: (items: Array<NLog>) => {
      return items.filter((log: NLog) => {
        return log.hasNote
      }).length
    },
  },
  {
    view: 'people',
    icon: PeopleOutline,
    label: `${Lang.t('general.people', 'People')}`,
    reduce: (items: Array<NLog>) => {
      return items.filter((log: NLog) => {
        log.getMeta()
        return log.people && log.people.length > 0
      }).length
    },
  },
  {
    view: 'locations',
    icon: MapOutline,
    label: `${Lang.t('general.locations', 'Locations')}`,
    reduce: (items: Array<NLog>) => {
      const locations: any = {}
      return items.filter((log: NLog) => {
        if (log.lat) {
          const key = `${math.round(log.lat, 100)},${math.round(log.lng, 100)}`
          if (!locations[key]) {
            locations[key] = true
            return true
          }
          return false
        } else {
          return false
        }
      }).length
    },
  },
  // { view: "trackers", icon: "tracker", label: `${Lang.t("general.trackers", "Trackers")}` },
  // { view: "context", icon: "bulb", label: `${Lang.t("general.context", "Context")}` },
]

export function getNotes(day): Array<NLog> {
  let notes = day
    .filter((record) => {
      return isLongFormat(record.note)
    })
    .sort((a: NLog, b: NLog) => {
      return a.end < b.end ? 1 : -1
    })
  return notes
}

export function getContext(day): Array<string> {
  let contexts = []
  day.forEach((log: NLog) => {
    log.context.forEach((element: Token) => {
      const context = element.id
      if (context) {
        if (contexts.indexOf(context) === -1) {
          contexts.push(context)
        }
      }
    })
  })
  return contexts
}

export function getPeople(day, peopleStorePeople: any = {}): Array<Person> {
  let people = []
  day.forEach((log: NLog) => {
    log.people.forEach((element: Token) => {
      let person = peopleStorePeople[element.id]
      if (person) {
        if (people.indexOf(person) === -1) {
          people.push(person)
        }
      }
    })
  })
  return people
}

export interface TrackerProcessedConfig {
  tag: string
  tracker: TrackerClass
  values: Array<number>
  count: number
  value: number
}

export function processTrackers(trackersUsed, allTrackers = {}): Array<TrackerProcessedConfig> {
  let trackers: Array<TrackerProcessedConfig> = Object.keys(trackersUsed)
    .map((tag) => {
      let base = trackersUsed[tag]
      let tracker = allTrackers && allTrackers[tag] ? new TrackerClass(allTrackers[tag]) : new TrackerClass({ tag })
      let value = tracker.math == 'sum' ? math.sum(base.values) : math.average(base.values)
      return {
        tag,
        tracker,
        values: base.values,
        count: base.values.length,
        value: tracker.displayValue(value),
      }
    })
    .sort((a, b) => {
      return a.tracker.label > b.tracker.label ? 1 : -1
    })

  return trackers
}
