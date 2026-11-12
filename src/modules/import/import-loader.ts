import { getDashboards, saveDashboards } from '../../domains/dashboard2/DashStore'

import { ContextClass } from '../../domains/context/context-class'
import { ContextStore } from '../../domains/context/context-store'
import { PointerClass } from '../../domains/pointers/pointer-class'
import { PointerStore } from '../../domains/pointers/pointer-store'
import type { IBackupItems } from '../export/export'
import type { INormalizedImport } from './import'
import Importer from './import'
import { LedgerStore } from '../../domains/ledger/LedgerStore'
import { LocationStore } from '../../domains/locations/LocationStore'
import type NLog from '../../domains/nomie-log/nomie-log'
import { PeopleStore } from '../../domains/people/PeopleStore'
import { TrackerStore } from '../../domains/tracker/TrackerStore'
import type { UniboardType } from '../../domains/board/UniboardStore'
import { dedupArray } from '../../utils/array/array_utils'
import { getBoardsFromStorage } from '../../domains/board/UniboardStore'
// import { DashboardStore } from '../../store/dashboard-store'
import math from '../../utils/math/math'
import { saveBoardsToStorageAndUpdate } from '../../domains/board/UniboardStore'
import { GoalStore } from '../../domains/goals/GoalStore'
import { PivotStore } from '../../domains/analytics/PivotStore'
import Storage from '../../domains/storage/storage'
import NPaths from '../../paths'

type IImportTypes = 'dashboards' | 'locations' | 'people' | 'trackers' | 'logs' | 'context' | 'pointers'
export interface IImportStatus {
  importing: IImportTypes
  progress?: number
}

export default class ImportLoader {
  normalized: INormalizedImport
  raw: any
  changeListeners: Array<Function> = []
  keepDevice: boolean = true
  importing: any = {}
  importer: Importer

  constructor() {
    this.importing = {}
  }

  public onChange(func: Function): void {
    if (this.changeListeners.indexOf(func) == -1) {
      this.changeListeners.push(func)
    }
  }

  public logs(logs: Array<NLog>) {
    this.normalized = {
      logs,
    }
    return this
  }

  public async openPayload(payload: IBackupItems) {
    this.raw = payload
    this.importer = new Importer(payload)
    this.normalized = this.importer.normalized
  }

  public async importAll(func?: Function) {
    func = func || function (status: IImportStatus) {}
    try {
      func({ importing: 'boards' })
      await this.importBoards()
      func({ importing: 'trackers' })
      await this.importTrackers()
      func({ importing: 'dashboards' })
      await this.importDashboards()
      func({ importing: 'people' })
      await this.importPeople()
      func({ importing: 'context' })
      await this.importContext()
      func({ importing: 'pointers' })
      await this.importPointers()
      func({ importing: 'locations' })
      await this.importLocations()
      func({ importing: 'goals' })
      await this.importGoals()
      func({ importing: 'pivots' })
      await this.importPivots()
      func({ importing: 'plugins' })
      await this.importPlugins()
      func({ importing: 'logs' })
      await this.importLogs(func)
      return true
    } catch (e) {
      console.error(e)
      throw new Error(e.message)
    }
  }

  public async importTrackers(): Promise<any> {
    const incoming = this.normalized.trackers || {}
    await TrackerStore.updateSync((state) => {
      return this.keepDevice ? { ...incoming, ...state } : { ...state, ...incoming }
    })
    return this
  }

  public async importDashboards() {
    const existing = await getDashboards()
    const incoming = this.normalized.dashboards || []
    const final = this.keepDevice ? dedupArray([...existing, ...incoming], 'id') : dedupArray([...incoming, ...existing], 'id')
    await saveDashboards(final)
    return this
  }

  public async importBoards() {
    const boards: Array<UniboardType> = (await getBoardsFromStorage()) || []
    const newBoards: Array<UniboardType> = this.normalized.boards || []

    const updatedBoards = this.keepDevice
      ? [...boards, ...newBoards.filter((nb) => !boards.find((b) => b.id == nb.id))]
      : [...boards.filter((b) => !newBoards.find((nb) => nb.id == b.id)), ...newBoards]
    const allBoardIndex = updatedBoards.findIndex((b) => b.id == 'all' || b.id == '_all')
    if (allBoardIndex > -1) {
      if (updatedBoards[allBoardIndex]) {
        updatedBoards[allBoardIndex].id = 'v5-all'
        updatedBoards[allBoardIndex].label = 'All'
      }
    }
    let deduped = dedupArray(updatedBoards, 'id')
    await saveBoardsToStorageAndUpdate(deduped)
    return this
  }

  public async importLogs(onProgress?: Function) {
    await LedgerStore.import(this.normalized.logs, (status) => {
      if (status.step) {
        let progress
        if (status.step < status.total) {
          progress = math.round(100 - ((status.total - status.step) / status.total) * 100)
        } else if (status.step == status.total) {
          progress = 100
        } else {
          progress = 0
        }
        if (onProgress) {
          onProgress({
            message: `Step ${status.step} of ${status.total}`,
            progress,
            step: status.step,
            total: status.total,
          })
        }
      }
    })
    await LedgerStore.getFirstDate(true)
    return this
  }

  public async importPeople() {
    const newPeople = this.normalized.people || {}
    await PeopleStore.updateSync((state) => {
      return this.keepDevice ? { ...newPeople, ...state } : { ...state, ...newPeople }
    })

    // Need to refresh TrackableStore so people appear as trackables
    const { InitTrackableStore } = await import('../../domains/trackable/TrackableStore')
    await InitTrackableStore()
    return this
  }

  public async importContext() {
    const contextMap: { [key: string]: ContextClass } = {}
    ;(this.normalized.context || []).forEach((c) => {
      const contextClass = new ContextClass(c)
      if (contextClass.tag) {
        contextMap[contextClass.tag] = contextClass
      }
    })
    if (this.keepDevice) {
      const existing = ContextStore.rawState() || {}
      Object.keys(contextMap).forEach((tag) => {
        if (existing[tag]) delete contextMap[tag]
      })
    }

    try {
      if (Object.keys(contextMap).length > 0) {
        await ContextStore.upsertMany(contextMap)
      }
    } catch (e) {
      console.error('Error importing contexts:', e)
    }
    return this
  }

  public async importPointers() {
    let pointers = (this.normalized.pointers || []).map((p) => new PointerClass(p))
    if (this.keepDevice) {
      const existingTags = new Set((PointerStore.rawState() || []).map((p: any) => p.tag))
      pointers = pointers.filter((p) => !existingTags.has(p.tag))
    }

    try {
      if (pointers.length > 0) {
        await PointerStore.upsertMany(pointers)
      }
    } catch (e) {
      console.error('Error importing pointers:', e)
    }
    return this
  }

  public async importLocations() {
    let locations: Array<any> = this.normalized.locations || []
    if (this.keepDevice) {
      const existingIds = new Set((LocationStore.rawState() || []).map((l: any) => l.id))
      locations = locations.filter((l: any) => !existingIds.has(l.id))
    }
    if (locations.length > 0) {
      await LocationStore.upsertMany(locations)
    }
    return this
  }

  public async importGoals() {
    if (this.normalized.goals && this.normalized.goals.length > 0) {
      await GoalStore.updateSync((state) => {
        const existing = state || []
        const incoming = this.normalized.goals
        return dedupArray(this.keepDevice ? [...existing, ...incoming] : [...incoming, ...existing], 'id')
      })
    }
    return this
  }

  public async importPivots() {
    if (this.normalized.pivots && this.normalized.pivots.length > 0) {
      await PivotStore.updateSync((state) => {
        const existing = state || []
        const incoming = this.normalized.pivots
        return dedupArray(this.keepDevice ? [...existing, ...incoming] : [...incoming, ...existing], 'id')
      })
    }
    return this
  }

  public async importPlugins() {
    const backupPlugins: Array<any> = this.normalized.plugins || []
    if (backupPlugins.length > 0) {
      const existing: Array<any> = (await Storage.getStrict(NPaths.storage.plugins())) || []
      let merged: Array<any>
      if (this.keepDevice) {
        const known = new Set(existing.map((p: any) => p.id))
        merged = [...existing, ...backupPlugins.filter((p: any) => !known.has(p.id))]
      } else {
        const incomingIds = new Set(backupPlugins.map((p: any) => p.id))
        merged = [...existing.filter((p: any) => !incomingIds.has(p.id)), ...backupPlugins]
      }
      await Storage.put(NPaths.storage.plugins(), merged)

      // Plugin settings: with "keep this device" only where the device has none yet
      const preferences = this.normalized.pluginPreferences || {}
      for (const pluginId of Object.keys(preferences)) {
        try {
          const prefsPath = `plugins/${pluginId}/prefs.json`
          if (!this.keepDevice || !(await Storage.getStrict(prefsPath))) {
            await Storage.put(prefsPath, preferences[pluginId])
          }
        } catch (e) {
          console.error(`Could not import the settings of plugin ${pluginId}`, e)
        }
      }
    }
    return this
  }

  private fireChange(status) {
    this.changeListeners.forEach((func) => {
      func(status)
    })
  }
}
