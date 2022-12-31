import type { DashboardClass } from '../../domains/dashboard2/dashboard-class'
import type { GoalClass } from '../../domains/goals/goal-class'
import type { IPerson } from '../../domains/people/Person.class'
import { N1ImportNormalizer } from './import.n1'
import { N2ImportNormalizer } from './import.n2'
import { N3ImportNormalizer } from './import.n3'
import { N5ImportNormalizer } from './import.n5'
import type NLog from '../../domains/nomie-log/nomie-log'
import type TrackerClass from '../tracker/TrackerClass'
// import type { ILocation } from "../locate/Location";

export type ITrackers = {
  [key: string]: TrackerClass
}

export type IPeople = {
  [key: string]: IPerson
}

export type INormalizedImport = {
  trackers?: ITrackers
  boards?: Array<any>
  context?: Array<string>
  people?: IPeople
  locations?: Array<Location>
  dashboards?: Array<DashboardClass>
  goals?: Array<GoalClass>
  logs?: Array<NLog>
}

// TODO: replace this with the util version
export function dashCase(str: string): string {
  return (
    str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((x) => x.toLowerCase())
      .join('_')
  )
}

export default class Importer {
  original: any
  version: number
  normalized: INormalizedImport
  constructor(importPayload: any) {
    this.original = importPayload
    this.version = parseInt(importPayload?.nomie?.number?.split('.')[0])

    if (!this.version) {
      throw new Error('Invalid Nomie Backup file')
    } else if (this.version >= 4) {
      this.normalized = N5ImportNormalizer(importPayload)
    } else if (this.version == 3) {
      this.normalized = N3ImportNormalizer(importPayload)
    } else if (this.version == 2) {
      this.normalized = N2ImportNormalizer(importPayload)
    } else if (this.version == 1) {
      this.normalized = N1ImportNormalizer(importPayload)
    }
  }
}
