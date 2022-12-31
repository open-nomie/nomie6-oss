import { getDashboards, saveDashboards } from '../../domains/dashboard2/DashStore'

import { ContextClass } from '../../domains/context/context-class'
import { ContextStore } from '../../domains/context/context-store'
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

type IImportTypes = 'dashboards' | 'locations' | 'people' | 'trackers' | 'logs' | 'context'
export interface IImportStatus {
  importing: IImportTypes
  progress?: number
}

export default class ImportLoader {
  normalized: INormalizedImport
  raw: any
  changeListeners: Array<Function>
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
      func({ importing: 'locations' })
      await this.importLocations()
      func({ importing: 'logs' })
      await this.importLogs(func)
      return true
    } catch (e) {
      console.error(e)
      throw new Error(e.message)
    }
  }

  public async importTrackers(): Promise<any> {
    await TrackerStore.updateSync((state) => {
      return { ...this.normalized.trackers, ...state }
    })
    return this
  }

  public async importDashboards() {
    let existing = await getDashboards()
    let final = dedupArray([...existing, ...this.normalized.dashboards], 'id')

    saveDashboards(final)
    return this
  }

  public async importBoards() {
    const boards: Array<UniboardType> = (await getBoardsFromStorage()) || []
    const newBoards: Array<UniboardType> = this.normalized.boards || [];

    const oldBoardsNotBeingReplaced = boards.filter((b) => {
      return newBoards.find((nb) => nb.id == b.id) ? false : true
    })
    const updatedBoards = [...oldBoardsNotBeingReplaced, ...newBoards]
    const allBoardIndex = updatedBoards.findIndex((b) => b.id == 'all' || b.id == '_all')
    if (allBoardIndex) {
      if(updatedBoards[allBoardIndex]) {
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
    const people = await PeopleStore.updateSync((state) => {
      let newPeople = (this.normalized || { people: {} }).people
      return { ...newPeople, ...state }
    })
    return people
  }

  public async importContext() {
    // let contexts: Array<ContextClass> = await ContextStore.rawState()
    let importCTX = this.normalized.context || []
    const contexts = importCTX.map((c) => new ContextClass(c))

    try {
      await ContextStore.upsertMany(contexts)
    } catch (e) {
      console.error(e)
    }
    return this
  }

  public async importLocations() {
    await LocationStore.upsertMany(this.normalized.locations)
    return this
  }

  private fireChange(status) {
    this.changeListeners.forEach((func) => {
      func(status)
    })
  }
}
