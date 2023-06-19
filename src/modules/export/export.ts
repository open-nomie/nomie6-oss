import type { IPeople, ITrackers } from '../import/import'

import { AppVersion } from '../app-version/app-version'
import type { ContextClass } from '../../domains/context/context-class'
import { ContextStore } from '../../domains/context/context-store'
import type { DashboardClass } from '../../domains/dashboard2/dashboard-class'
import type { GoalClass } from '../../domains/goals/goal-class'
import { GoalStore } from '../../domains/goals/GoalStore'
import type { PivotClass } from '../../domains/analytics/pivot-class'
import { PivotStore } from '../../domains/analytics/PivotStore'
import { Interact } from '../../store/interact'
import { LedgerStore } from '../../domains/ledger/LedgerStore'
import type Location from '../../domains/locations/LocationClass'

import type NLog from '../../domains/nomie-log/nomie-log'
import NPaths from '../../paths'
import { PeopleStore } from '../../domains/people/PeopleStore'
// Modules

import type { UniboardType } from '../../domains/board/UniboardStore'
// stores
import config from '../../config/appConfig'
//vendors
import dayjs from 'dayjs'
import { getBoardsFromStorage } from '../../domains/board/UniboardStore'
import { getDashboards } from '../../domains/dashboard2/DashStore'
import { LocationStore } from '../../domains/locations/LocationStore'
import Storage from '../../domains/storage/storage'

export interface IBackupItems {
  nomie: {
    number: string
    created: string
    startDate: string
    endDate: string
  }
  goals: Array<GoalClass>
  pivots: Array<PivotClass>
  boards: Array<UniboardType>
  events: Array<NLog>
  trackers: ITrackers
  people: IPeople
  locations: Array<Location>
  dashboards: Array<DashboardClass>
  context: Array<ContextClass>
}

export default class Export {
  listeners: Array<Function>
  format: string
  backup: IBackupItems

  constructor(options: any = {}) {
    options = options || {}
    this.listeners = []
    this.format = options.format || 'json'
    this.backup = {
      nomie: {
        number: `${import.meta.env.PACKAGE_VERSION}`,
        created: new Date().toJSON(),
        startDate: new Date().toJSON(),
        endDate: new Date().toJSON(),
      },
      goals: options.goals || [],
      pivots: options.pivots || [],
      boards: options.boards || [],
      events: options.events || [],
      trackers: options.trackers || {},
      people: options.people || {},
      locations: options.locations || [],
      dashboards: options.dashboards || [],
      context: options.context || [],
    }
  }

  async start() {
    try {
      this.fireChange('People...')
      // Get People
      let people = await PeopleStore.rawState()
      this.backup.people = people || {}

      this.fireChange('Dashboards...')
      let dashboards = await getDashboards()
      this.backup.dashboards = dashboards

      this.fireChange('Goals...')
      let goals = await GoalStore.rawState()
      this.backup.goals = goals

      this.fireChange('Pivots...')
      let pivots = await PivotStore.rawState()
      this.backup.pivots = pivots

      this.fireChange('Context...')
      let context = await ContextStore.rawState()
      this.backup.context = context

      this.fireChange('Locations...')
      let locations = await LocationStore.rawState()
      this.backup.locations = locations || []

      // Get Trackers
      this.fireChange('Trackers...')
      let trackers = await this.getTrackers()

      if (trackers) {
        this.backup.trackers = trackers
      }
      // Get Boards
      this.fireChange('Boards...')
      let boards = await this.getBoards()
      this.backup.boards = boards
      // Get Events
      this.fireChange('Events...')
      let events = await this.getEvents()
      this.backup.events = events || []
      this.fireChange(`${(events || []).length} data notes exported`)
      // Setup a Document to Download
      let downloadButton = document.createElement('a')
      downloadButton.setAttribute(
        'href',
        URL.createObjectURL(new Blob([JSON.stringify(this.backup)], { type: 'text/json' }))
      )
      downloadButton.setAttribute('download', `nomie-${AppVersion}-${dayjs().format('YYYY-MM-DD-H:mm')}.json`)
      downloadButton.click()
    } catch (e) {
      Interact.alert('Export Error', e.message)
    }
  }

  getTrackers() {
    return Storage.get(NPaths.storage.trackers()).then((res) => {
      return res
    })
  }

  getPeople() {
    return Storage.get(NPaths.storage.people()).then((res) => {
      return res
    })
  }

  async getBoards() {
    const boards = await getBoardsFromStorage()

    return boards
  }

  getEvents(): Promise<Array<any>> {
    let flatten = (arr) =>
      [].concat.apply(
        [],
        arr.map((element) => (Array.isArray(element) ? flatten(element) : element))
      )
    // get all books
    const failures: Array<string> = []
    return new Promise(async (resolve, reject) => {
      let books = await LedgerStore.listBooks()

      let finished = []
      let loadNext = () => {
        if (finished.length < books.length) {
          this.fireChange(`${config.book_time_unit} ${finished.length} of ${books.length}`)

          // Fix the path if the storage engine uses something differnt than posix style
          let bookPath = Storage.convertPath(books[finished.length])
          if (Storage._storageType() === 'firebase') {
            const profileRoot = Storage.getEngine().basePath()
            bookPath = bookPath.replace(`${profileRoot}/`, '')
          }

          Storage.get(bookPath)
            .then((book) => {
              finished.push(book)
              loadNext()
            })
            .catch((e) => {
              console.error(`Error importing ${bookPath}`)
              failures.push(bookPath)
            })
        } else {
          let events = flatten(finished)
          resolve(events)
        }
      }
      loadNext()
    }) // end promise
  }

  onChange(func) {
    this.listeners.push(func)
  }

  fireChange(change) {
    this.listeners.forEach((func) => {
      func(change)
    })
  }
}
