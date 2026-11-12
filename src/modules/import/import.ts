import type { DashboardClass } from '../../domains/dashboard2/dashboard-class'
import type { GoalClass } from '../../domains/goals/goal-class'
import type { PivotClass } from '../../domains/analytics/pivot-class'
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
  pointers?: Array<string>
  people?: IPeople
  locations?: Array<Location>
  dashboards?: Array<DashboardClass>
  goals?: Array<GoalClass>
  pivots?: Array<PivotClass>
  logs?: Array<NLog>
  plugins?: Array<any>
  pluginPreferences?: { [key: string]: any }
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

// Convert new backup format (with files) to old format expected by normalizers
function convertNewFormatToOldFormat(payload: any): any {
  console.log('convertNewFormatToOldFormat - payload:', { hasFiles: !!payload.files, hasVersion: !!payload.version, version: payload.version })

  if (payload.files && payload.version) {
    console.log('Converting new backup format to old format')
    const converted: any = {
      nomie: {
        number: payload.version,
        created: payload.created,
        startDate: payload.startDate,
        endDate: payload.endDate,
      }
    }

    if (payload.files) {
      const events: Array<any> = []
      Object.keys(payload.files).forEach((path) => {
        // Logs are stored in weekly books (e.g. "data/books/2026-33"); the legacy
        // importer expects them as one "events" list. Without this they were dropped.
        if (/(^|\/)books\//.test(path)) {
          if (Array.isArray(payload.files[path])) events.push(...payload.files[path])
          return
        }
        const key = path.replace('.json', '')
        converted[key] = payload.files[path]
      })
      if (events.length) converted.events = events
    }

    console.log('Converted payload keys:', Object.keys(converted))
    return converted
  }
  console.log('Returning original payload (not new format)')
  return payload
}

export default class Importer {
  original: any
  version: number
  normalized: INormalizedImport
  constructor(importPayload: any) {
    try {
      this.original = importPayload

      const normalizedPayload = convertNewFormatToOldFormat(importPayload)
      console.log('normalizedPayload received in Importer constructor')

      // Support both old format (nomie.number) and new format (version)
      let versionString = normalizedPayload?.nomie?.number || importPayload?.version
      console.log('versionString:', versionString)

      // Extract major version number (handles both "6.7.4..." and "dn6.8.0v..." formats)
      let majorVersionMatch = versionString?.match(/\d+/)
      this.version = majorVersionMatch ? parseInt(majorVersionMatch[0]) : NaN
      console.log('Parsed version:', this.version)

      if (!this.version) {
        throw new Error('Invalid Nomie Backup file - could not extract version')
      } else if (this.version >= 4) {
        console.log('Using N5ImportNormalizer for version', this.version)
        this.normalized = N5ImportNormalizer(normalizedPayload)
      } else if (this.version == 3) {
        this.normalized = N3ImportNormalizer(normalizedPayload)
      } else if (this.version == 2) {
        this.normalized = N2ImportNormalizer(normalizedPayload)
      } else if (this.version == 1) {
        this.normalized = N1ImportNormalizer(normalizedPayload)
      }
      console.log('Importer initialized successfully')
    } catch (e) {
      console.error('Importer constructor error:', e)
      throw e
    }
  }
}
