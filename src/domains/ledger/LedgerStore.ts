/**
 * The Ledger!
 *
 * This is the core module for storing Nomie Logs.
 * Ledgers store logs in a month file. /MM-YYYY.json for example
 * this might change in the future, as it makes it
 * easier to accidentally lose a month worth of data.
 *
 * TODO: Move a lot of this to modules that can be easily tested
 *
 */

// Modules

import { UsageStore, updateLastUsed } from '../usage/UsageStore'
import dayjs, { Dayjs } from 'dayjs'
import { deleteLogFromCache, saveLogToCache } from './ledger-cache'

// Hooks for firing off hooks
import Hooky from '../../modules/hooks/hooks'
import type { IQueryOptions } from './ledger-tools'
import type { ITrackables } from '../trackable/trackable-utils'
import type { ITrackers } from '../../modules/import/import'
import type { ITrackersSummary } from './ledger-tools'
// Stores
import { Interact } from '../../store/interact'
import { Lang } from '../../store/lang'

import { LedgerImporter } from './ledger-importer'
// Ledger specific
import LedgerTools from './ledger-tools'
import { MasterTrackables } from '../trackable/TrackableStore'
import NLog from '../nomie-log/nomie-log'
import NPaths from '../../paths'
import ScoreNote from '../../modules/scoring/score-note'
// Storage for generic access to local,blockstack,pouch
import Storage from '../../domains/storage/storage'
import type { Trackable } from '../trackable/Trackable.class'
import { TrackableUsage } from '../usage/trackable-usage.class'
import type { TrackableUsageMap } from '../usage/trackable-usage.class'
import { getBookIdFromDate } from './ledger-books-to-get'

import { loadToday } from '../usage/today/TodayStore'
import { logAppendLocationIfNeeded } from './ledger-add-location'
// Nomie log is the base Log item that is saved in a ledger
import logFilter from '../nomie-log/log-filter/log-filter'
import logsToTrackableUsage from '../usage/usage-utils'
import { showToast } from '../../components/toast/ToastStore'
import textUtils from '../../utils/text/text'

import { writable } from 'svelte/store'


// Get the Geo Location module
// Utils

// Hooky is for firing off generic events

export interface IToday {
  [key: string]: {
    hours: Array<number>
    logs: Array<NLog>
    tag: string
    values: Array<number>
  }
}

export type IBooks = Array<ILedgerBook>
export type IBooksMap = {
  [key: string]: ILedgerBook
}
export type ILedgerBook = Array<NLog>

export interface ILedgerState {
  books: IBooksMap
  booksLastUpdate: any
  today: IToday
  count: number
  saving: boolean
  hash?: string
  memories: Array<NLog>
}

let ledgerTools: LedgerTools

// initialize the Store
const ledgerInit = () => {
  /**
   * Set base object for store
   */
  let base: ILedgerState = {
    books: {}, // holder of books - YYYY-MM
    booksLastUpdate: {},
    today: {}, // hold todays logs
    count: 0, //
    saving: false, // are we saving?
    hash: null, // hash for svelte auto reloading
    memories: [],
  }

  /**
   * Setup Ledger Tools to have the right Storage Engine
   * This is setup to make testing of the ledgerTools easier
   * but it's pretty hacky
   */
  ledgerTools = new LedgerTools(Storage, NPaths.storage.book)

  /**
   * Get State of the LedgerStore
   * Remember this causes a reaction
   * @param s
   * @returns
   */
  function state(s: any = {}) {
    let _state
    update((state) => {
      _state = { ...state, ...s, ...{ hash: methods.getHash(state) } }
      return _state
    })
    return _state
  }

  const methods = {
    hooks: new Hooky(),
    async init() {
      return true
    },
    /**
     * Filter Logs by start and end dates
     * @param {Array} logs
     * @param {Object} filter
     */
    filterLogs(logs, filter) {
      return logFilter(logs, filter || {})
    },
    // Connect to hooks
    hook(type, func) {
      return methods.hooks.hook(type, func)
    },

    /**
     * getBook
     * Get a Book for a given unit-year (month-year)
     * It will save the book to the ledger so future requests
     *
     * @param {String} bookDateString
     */

    async getBook(dateString: string, allowUndefined: boolean = false): Promise<any> {
      return await ledgerTools.getBook(dateString, allowUndefined)
    },
    /**
     * Put a Book
     *
     * @param {String} bookDateString 2012-12-31
     * @param {Array} rows
     */
    async putBook(bookDateString: string, rows: ILedgerBook): Promise<any> {
      return await ledgerTools.saveBook(bookDateString, rows)
    },
    /**
     * Get the First Book
     * Returns the name of the first book
     * the user has. Good for figuring out
     * first track
     */
    async getFirstDate(fresh = false) {
      return ledgerTools.getFirstDate(fresh)
    },
    async listBooks() {
      return ledgerTools.listBooks()
    },
    getLastUsed() {
      alert('FIX THIS LedgerStore line 173')
      // return LastUsed
    },
    extractTrackerTagAndValues(logs): ITrackersSummary {
      return ledgerTools.getTrackablesFromLogs(logs)
    },
    /**
     * Get the Users location if it's needed
     */
    async locateIfNeeded(log: NLog): Promise<NLog> {
      return await logAppendLocationIfNeeded(log)
    },
    /**
     * UpdateLog
     *
     * Updates a log - you must provide both the updated log, and the previous date it was saved on.
     *
     * @param {NLog} log
     * @param {Date} previousEndDate
     */
    async updateLog(log: NLog, previousEndDate?) {
      if (checkIfBlocked()) {
        promptForUpgrade()
        return false
      } else {
        // Fire hooks
        methods.hooks.run('onBeforeUpdate', log)
        // Set saving
        LedgerStoreSaving.update((s) => true)

        // Add modified flag - in case we want to use it later
        log.modified = new Date().getTime()

        // Get Date for Book ID
        let bookDate = log.bookId
        let previousBookDate = getBookIdFromDate(previousEndDate)
        let isSameBook = bookDate === previousBookDate

        // Get books
        let book: ILedgerBook = await methods.getBook(bookDate)

        let previousBook // incase we're moving a log from one book to another

        // Set empty foundIndex
        const foundIndex: number = book.findIndex((r) => r._id == log._id)

        // Did we find anything?
        if (foundIndex > -1) {
          // Update the row
          book[foundIndex] = log
        } else {
          // We didn't find it in the first book - so it must be a different book
          book.push(log)
        }

        // Remove it from the prvious if we're in a different book
        if (!isSameBook) {
          previousBook = await methods.getBook(previousBookDate)
          previousBook = previousBook.filter((row) => {
            return row._id !== log._id
          })
        }

        // Update base again
        update((s) => {
          s.books[bookDate] = book
          if (!isSameBook) {
            s.books[previousBookDate] = previousBook
          }
          s.hash = methods.getHash(s)
          return s
        })

        LedgerStoreSaving.update((s) => false)

        let promises = [methods.putBook(bookDate, book)]
        if (!isSameBook) {
          promises.push(methods.putBook(previousBookDate, previousBook))
        }

        let final = Promise.all(promises).then((res) => {
          return res[0]
        })

        methods.hooks.run('onLogUpdate', log)
        return final
      }
    },
    /**
     * Prepare a log
     */

    /**
     * Get the Last Updataed File Path
     * Used to help make sure we don't overwrite any data
     * @param {String} date YYYY-MM
     */
    getLastUpdatePath(date: string) {
      return NPaths.storage.book(`${date}_last`)
    },

    /**
     * Get the Last Updataed Time for a book
     * Used to help make sure we don't overwrite any data
     * @param {String} date YYYY-MM
     */
    async getLastUpdate(date: string) {
      return await Storage.get(methods.getLastUpdatePath(date))
    },

    /**
     * Get a Book - with syncing
     * This will pull it from storage first, to ensure we don't overwrite
     * anything in the remote storage engine
     * @param {String} date
     */
    async getBookWithSync(bookDateId: string) {
      try {
        // The sync part - get book first
        const book = await Storage.get(NPaths.storage.book(bookDateId))
        // If no book and on blockstack
        if (!book && Storage.storageType() == 'firebase') {
          // Its blockstack, let's how this is for a new week.
          showToast({ message: `Creating ${getBookIdFromDate(new Date())} in Nomie Cloud` })
          return []
        } else if (!book) {
          // It's local - so we will assume they're creating a new book
          return []
        } else {
          // Else just return the book already
          return book
        }
      } catch (e) {
        Interact.error(e)
        throw e
      }
    }, // end update if out of sync

    async getLog(id, book) {
      let bookData = await Storage.get(NPaths.storage.book(book))
      let logRaw = bookData.find((row) => row._id == id)
      return logRaw ? new NLog(logRaw) : null
    },

    // async fastLog(note) {
    //   let log = new NLog({ note })
    //   return saveLog(log)
    // },
    /**
     * Save Log
     * Real Save Log function - used only in saveLog method.
     * @param log
     * TODO make this dry enough to put in its own ledgerTools function
     */
    async _saveLog(log: NLog, props?: SaveLogProps): Promise<{ log: NLog; date: string }> {
      // Set up a holder for current state

      let currentState = state({
        saving: true,
      })

      if (checkIfBlocked()) {
        promptForUpgrade()
      } else {
        try {
          // Set the date for the book
          let bookDateId = getBookIdFromDate(log.end)

          // Set Path
          let bookPath = NPaths.storage.book(bookDateId)

          // Get the Book - if its blockstack then make sure it exists
          /**
           * This is breaking sometimes and deletes content
           * We must make sure that NEVER happens
           * - if book.length from the getBook is zero
           * and we have logs for that book, something went wrong.
           */
          let book = await methods.getBookWithSync(bookDateId)
          if (!book.length && currentState.books[bookDateId].length) {
            console.error(
              `NOTICE: I was not able to get the latest from the server as it returned an empty array. Instead, I'm just using the book that we have stored locally.`
            )
            book = currentState.books[bookDateId]
          }

          // Push the log
          book.push(log)
          // Save Book.
          await Storage.put(bookPath, book)
          // Set the current state book to this one
          currentState.books[bookDateId] = book
          // Save Last Update to server
          let timeString = new Date().toJSON()
          // get the Last Updated
          let lastDatePath = methods.getLastUpdatePath(bookDateId)
          //await - removing to see if that speeds things up
          // Split this off, so it doesn't slow down the rest
          setTimeout(() => {
            // Put the last Used
            Storage.put(lastDatePath, timeString)

            // Add lastUpdated to state
            currentState.booksLastUpdate[bookDateId] = timeString
          }, 1)

          // Update Store
          update((s) => {
            s.books = currentState.books
            s.hash = methods.getHash(s)
            return s
          })
          LedgerStoreSaving.update((s) => false)

          /** Fire off Notifications and hooks Save */
          const undoLastUsedItems = updateLastUsed(log)

          showToast({
            message: `${Lang.t('general.saved', 'Saved')}: ${textUtils.truncate(log.note, 100)}`,
            timeout: 2200,
            type: 'success',
            buttonLabel: 'Undo',
            buttonClick: () => {
              LedgerStore.deleteLogs([log]).then(async () => {
                // Push the Last Known Ones back to the UsageStore
                UsageStore.updateSync((state) => {
                  return { ...state, ...undoLastUsedItems }
                })
                await loadToday({ knownTrackables: MasterTrackables })
                update((s) => {
                  s.hash = `${Math.random()}`
                  return s
                })
                showToast({ message: 'Undo complete' })
              })
            },
          })

          if (!props?.silent) {
            methods.hooks.run('onLogSaved', log)
          }

          return { log, date: bookDateId }
        } catch (e) {
          console.error(`_saveLog error: ${e.message}`)
          console.error(e)
          throw new Error(e.message)
        }
      } /// end if it's blocked or not.
    },

    getHash(state: ILedgerState) {
      return Object.keys(state.books)
        .map((bookKey: string) => {
          return state.books[bookKey].length
        })
        .reduce((a, b) => a + b)
        .toString()
    },

    /**
     * Delete an Array of Logs
     *
     * This will determine which books to use, and which rows to delete.
     * It will then save the books back to blockstack
     * @param {Array} logs
     */
    async deleteLogs(logs) {
      // Set up target books
      let targets = {}

      // Loop over the Logs
      logs.forEach((log) => {
        // Determin the book it's from by the date
        let book = getBookIdFromDate(log.end)

        // If we're on firebase - delete the
        if (Storage.storageType() == 'firebase') {
          deleteLogFromCache(log)
        }

        // Set book if not set
        targets[book] = targets[book] || []

        // Push Log ID to book
        targets[book].push(log._id)
      })

      // Holder of Promises - kinda of like me as a dad - it's empty by default.
      let promises = []

      // Loop over targe books
      update((_state) => {
        Object.keys(targets).forEach(async (date) => {
          // Use date to get the book
          let book = await methods.getBook(date)

          // Get LogIds to delete for this book.
          let logIds = targets[date]

          // Create a new book - by filtering logs that don't match the id.
          let newBook = book.filter((log) => {
            return logIds.indexOf(log._id) == -1
          })

          // Update the store to use the new book
          // TODO: this doesn't seem to be trigger a change in History.svetle
          _state.books[date] = newBook

          // Add to promise the saving of the book
          promises.push(methods.putBook(date, newBook))
        })

        return _state
      })
      // Wait for all promises to be finished, then resolve
      let results = await Promise.all(promises)
      methods.hooks.run('onLogsDeleted', results)
      return results
    },

    /***
     * Import Function
     */
    async import(rows: Array<NLog>, statusFunc: Function) {
      let importer = new LedgerImporter(Storage, rows, statusFunc, ledgerTools)
      return await importer.import()
    },

    async queryAll(term, start, end) {
      let logs = await methods.query({ start, end, search: term })
      return logs.sort((a, b) => {
        return a.end < b.end ? 1 : -1
      })
    },

    // async queryPerson(username, start, end) {
    //   let logs = await methods.query({ start, end, search: `@${username}` })
    //   return logs.sort((a, b) => {
    //     return a.end < b.end ? 1 : -1
    //   })
    // },

    async queryTag(tag, start, end) {
      let logs = await methods.query({ start, end, search: `#${tag}` })
      return logs.sort((a, b) => {
        return a.end < b.end ? 1 : -1
      })
    },

    // async queryContext(context, start, end) {
    //   let logs = await methods.query({ start, end, search: `+${context}` })
    //   return logs.sort((a, b) => {
    //     return a.end < b.end ? 1 : -1
    //   })
    // },

    async getDay(date) {
      return methods.query({
        start: dayjs(date).startOf('day'),
        end: dayjs(date).endOf('day'),
      })
    },
    async getMemories() {
      let memories = await ledgerTools.getMemories(methods.getDay)
      update((state) => {
        state.memories = memories
        return state
      })
    },

    getState() {
      let state
      update((s) => {
        state = s
        return s
      })
      return state
    },

    /**
     * Main Ledger Query Function
     * This is used for almost everything that needs logs.. Stats, History, Today, etc.
     * @param {Object} options
     */
    async query(options: IQueryOptions) {
      let state = methods.getState()
      let ledgerResults: any = await ledgerTools.query(options, state.books)
      /**
       * If this is a fresh call (default)
       * then let's take the book results and
       * save them to the ledger for faster
       * lookups
       */
      if (options.fresh !== false) {
        update((state) => {
          state.books = { ...state.books, ...ledgerResults.books }
          state.hash = methods.getHash(state)
          return state
        })
      }

      // return ledgerTools.query(options, state.books);
      return ledgerResults.logs
    },
  }

  const { subscribe, set, update } = writable(base)

  return {
    methods,
    update,
    subscribe,
    ...methods,
    reset() {
      return set(base)
    },
  }
}

export const LedgerStore = ledgerInit()
export const LedgerStoreSaving = writable(false)

// LedgerStore.subscribe((s) => {
//   console.log(
//     `🔯 Ledger Store`,
//     s,
//     Object.keys(s.books).map((b) => s.books[b])
//   )
// })
/**
 * Save A Log!
 *
 * This is the main function to save a new log
 * It should not be used for updating
 * @param {NLog} log
 */

type LogSaveResponseType = { log: NLog; date: string }

type SaveLogProps = {
  silent?: boolean
}
/**
 * Save a Log
 * @param {Nlog} log
 * @returns {Promise<LogSaveResponseType>}
 */
export const saveLog = async (log: NLog, props?: SaveLogProps): Promise<LogSaveResponseType> => {
  LedgerStoreSaving.update((s) => true)
  const _log: NLog = await prepareLog(log)
  let saved: LogSaveResponseType
  try {
    saved = await LedgerStore._saveLog(_log, props)
    if (_log.score >= 2) {
      Interact.confetti({ show: true, timeout: 2500 })
    }
    LedgerStoreSaving.update((s) => false)
    return saved
  } catch (e) {
    console.error(`Error Saving log: ${e}`)
    LedgerStoreSaving.update((s) => false)
    Interact.error(e.message)
  }
  return saved
}

/**
 * Prepare a Log to be saved
 * This will lookup a location, if needed. Then score the note
 * against the current time and known trackers
 * @param {Nlog} log
 * @param {ITrackers} knownTrackers
 * @returns {NLog}
 */
export const prepareLog = async (log: NLog, knownTrackers?: ITrackers) => {
  log = await logAppendLocationIfNeeded(log)
  log.score = log.score || ScoreNote(log.note, log.end, knownTrackers)
  log = ledgerTools.prepareLogForSave(log)
  return log
}

/**
 * Query to Usage Map
 * Takes a Query, and returns an array of logs
 * @param {IQueryOptions} query
 * @param {ITrackables} known
 * @returns {Promise<TrackableUsageMap>}
 */
export const queryToUsageMap = async (query: IQueryOptions, known: ITrackables): Promise<TrackableUsageMap> => {
  const logs: Array<NLog> = await LedgerStore.query(query)
  const usage = logsToTrackableUsage(logs, { trackables: known, caller: 'queryToUsageMap' })
  return usage
}

/**
 * Query to Trackable Usage
 * Takes a query, and a trackable and returns a TrackableUsage
 * @param {ITrackable} trackable
 * @param {IQueryOptions} query
 * @param {ITrackables} known
 * @returns {Promise<TrackableUsage>}
 */
export const queryToTrackableUsage = async (
  trackable: Trackable,
  query: IQueryOptions,
  known: ITrackables
): Promise<TrackableUsage> => {
  const usages = await queryToUsageMap(query, known)
  console.log(usages)
  return usages[trackable.tag] || new TrackableUsage({ trackable, dates: [], values: [] })
}

/**
 * It takes a trackable, a start and end date, and a list of known trackables, and returns a trackable
 * usage
 * @param {Trackable} trackable - The trackable you want to get the usage for.
 * @param {Dayjs} start - The start of the period you want to get the usage for
 * @param {Dayjs} end - The end date of the period you want to get the usage for.
 * @param {ITrackables} known - ITrackables - this is a map of trackables that have already been
 * queried. This is used to prevent duplicate queries.
 * @returns A promise that resolves to a TrackableUsage or undefined
 */
export const getTrackableUsage = async (
  trackable: Trackable,
  start: Dayjs,
  end: Dayjs,
  known: ITrackables
): Promise<TrackableUsage | undefined> => {
  const usage = await queryToTrackableUsage(
    trackable,
    {
      start: start,
      end: end,
    },
    known
  )
  return usage
}

/**
 * It checks if the user is blocked from writing to the database
 * @returns A function that returns a boolean
 */
export const checkIfBlocked = (): boolean => {
  return false
}

/**
 * It prompts the user to upgrade their subscription.
 */
export const promptForUpgrade = async () => {
  let doUpgrade = await Interact.confirm(
    `Subscription Needed`,
    'You need to have a valid subscription to write to the Nomie encrypted cloud',
    'Upgrade'
  )

}

/**
 * `onLogNoteChange` is a function that takes a string and a log object, and returns a promise that
 * resolves to true after 200ms
 * @param {string} note - string - the new note value
 * @param {NLog} log - NLog - this is the log object that is being edited
 * @returns A promise that resolves to true
 */
let debouncer: any
export const onLogNoteChange = async (note: string, log: NLog): Promise<NLog> => {
  return new Promise((resolve) => {
    log.note = note
    clearTimeout(debouncer)
    debouncer = setTimeout(async () => {
      await LedgerStore.updateLog(log)
      resolve(log)
    }, 200)
  })
}
