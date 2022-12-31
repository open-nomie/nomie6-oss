import array_utils from '../../utils/array/array_utils'
import logFilter from '../nomie-log/log-filter/log-filter'
import nid from '../../modules/nid/nid'
import NLog from '../nomie-log/nomie-log'

import dayjs from 'dayjs'

import type { Dayjs } from 'dayjs'
import type { IStorage } from '../../domains/storage/storage'

import type { LedgerImporter } from './ledger-importer'
import type { Trackable } from '../trackable/Trackable.class'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
import type { Token } from '../../modules/tokenizer/lite'
import { isLongFormat } from '../nomie-log/nomie-log-utils'
import { ledgerBooksToGet } from './ledger-books-to-get'

export type IBooks = Array<ILedgerBook>
export type ILedgerBook = Array<NLog>

export interface IQueryOptions {
  fresh?: boolean
  start?: Dayjs
  end?: Dayjs
  search?: string
  fuzzy?: boolean
  caller?: string
}

type IBook = Array<NLog>

export type ITrackersSummary = {
  [tag: string]: {
    values: Array<any>
    tag: string
    hours: Array<any>
    logs: Array<NLog>
  }
}

export type ITrackableSummary = {
  [tag: string]: {
    values: Array<any>
    tag: string
    hours: Array<any>
    logs: Array<NLog>
    dates: Array<number>
  }
}

export type ITrackables = {
  [key: string]: Trackable
}
export function getTrackablesAndValuesFromLogs(logs: Array<NLog>): ITrackableSummary {
  if (logs instanceof Array == false) {
    throw new Error('Logs must be an array')
  }
  let trackables: any = {}
  logs.forEach((log: NLog) => {
    log = log instanceof NLog ? log : new NLog(log)
    // Pro tip: Get meta if its not already present
    !log.trackers ? log.getMeta() : ''

    // Loop over people found
    log.people.forEach((trackableElement: Token) => {
      let tag = `@${trackableElement.id}`
      trackables[tag] = trackables[tag] || {
        values: [1],
        tag: `#${tag}`,
        hours: [],
        logs: [],
        dates: [],
      }
    })

    log.context.forEach((trackableElement: Token) => {
      let tag = `+${trackableElement.id}`
      trackables[tag] = trackables[tag] || {
        values: [1],
        tag: `+${tag}`,
        hours: [],
        logs: [],
        dates: [],
      }
    })

    // Loop over the Trackers Found
    log.trackers.forEach((trackableElement: Token) => {
      let tag = `#${trackableElement.id}`
      // Add the Values base to the tracker[tag] of not already
      trackables[tag] = trackables[tag] || {
        values: [],
        tag,
        hours: [],
        logs: [],
        dates: [],
      }
      // Push the value to values array - make sure to convert to number
      let trackableElementValue = parseNumber(trackableElement.value)
      let v: any = isNaN(trackableElementValue) ? 1 : trackableElementValue
      trackables[tag].values.push(v)
      trackables[tag].dates.push(log.end)

      // Add the Logs for Today - so we can calcuate the score
      if (trackables[tag].logs.indexOf(log) == -1) {
        trackables[tag].logs.push(log)
      }
      // Get and set hour for the tracker time ball
      let hour = parseInt(dayjs(log.end).format('H'))
      if (trackables[tag].hours.indexOf(hour) == -1) {
        trackables[tag].hours.push(hour)
      }
    }) // end looping over the logs trackers
  })
  return trackables
}

/**
 * Gets Trackers and Values from Logs
 * This is depcreated - used getTrackablesAndValuesFromLogs
 * @param logs
 * @returns
 */
export function getTrackersAndValuesFromLogs(logs: Array<NLog>): ITrackersSummary {
  if (logs instanceof Array == false) {
    throw new Error('Logs must be an array')
  }
  let trackers: any = {}
  logs.forEach((log: NLog) => {
    log = log instanceof NLog ? log : new NLog(log)
    // Pro tip: Get meta if its not already present
    !log.trackers ? log.getMeta() : ''
    // Loop over the Trackers Found
    log.trackers.forEach((trackableElement: Token) => {
      let tag = trackableElement.id
      // Add the Values base to the tracker[tag] of not already
      trackers[tag] = trackers[tag] || {
        values: [],
        tag: tag,
        hours: [],
        logs: [],
      }
      // Push the value to values array - make sure to convert to number
      let trackableElementValue = parseNumber(trackableElement.value)
      let v: any = isNaN(trackableElementValue) ? 1 : trackableElementValue
      trackers[tag].values.push(v)
      // Add the Logs for Today - so we can calcuate the score
      if (trackers[tag].logs.indexOf(log) == -1) {
        trackers[tag].logs.push(log)
      }
      // Get and set hour for the tracker time ball
      let hour = parseInt(dayjs(log.end).format('H'))
      if (trackers[tag].hours.indexOf(hour) == -1) {
        trackers[tag].hours.push(hour)
      }
    }) // end looping over the logs trackers
  })
  return trackers
}

export default class LedgerTools {
  storage: IStorage
  importer: LedgerImporter
  bookPathLookup: Function

  constructor(storage: any, bookPathLookup: (id: string) => void) {
    this.storage = storage
    this.bookPathLookup = bookPathLookup
  }

  public getDateOfWeek(w: number, y: number) {
    let d: number = 1 + (w - 1) * 7
    return new Date(y, 0, d)
  }

  public async getBook(dateString: string, allowUndefined: boolean = false): Promise<IBook> {
    let bookRaw = await this.storage.get(this.bookPathLookup(dateString))
    let book = bookRaw instanceof Array ? bookRaw : []
    if (allowUndefined && !bookRaw) {
      return undefined
    } else {
      return book.map((_log) => new NLog(_log)).filter((l) => l.isValid())
    }
  }

  public async saveBook(dateString: string, rows: Array<NLog>) {
    if (rows instanceof Array) {
      return await this.storage.put(this.bookPathLookup(dateString), rows)
    } else {
      throw new Error(`invalid book content provided. save failed`)
    }
  }

  public prepareLogForSave(_log: any): NLog {
    // Create a pure log
    let log: any = new NLog(_log)
    log.end = log.end || new Date().getTime()
    log.start = log.start || log.end - 1000
    log.note = log.note.trim()
    log.source = log.source || 'n6'
    delete log._dirty
    return log
  }

  public hashTrackersSummary(obj: ITrackersSummary): string {
    let nodes = Object.keys(obj).map((tag) => {
      return `${tag}-${obj[tag].values.join(',')}`
    })
    return nid(nodes.join(','))
  }

  public getTrackersAndValuesFromLogs(logs: Array<NLog>): ITrackersSummary {
    return getTrackersAndValuesFromLogs(logs)
  }

  public getTrackablesFromLogs(logs: Array<NLog>): ITrackersSummary {
    return getTrackablesAndValuesFromLogs(logs)
  }

  /**
   * Get a list of all books in storage.
   */
  listBooks() {
    return this.storage.list().then((files) => {
      return files.filter((f) => {
        // Extract only the files with books/ books_ or books-, and not with _last
        return f.search(/books(-|_|\/)/g) > -1 && f.search(`_last`) === -1
      })
    })
  }

  /**
   * Getting the users first date lookup
   * Since this can be on blockstack the lookup can take a while
   * we have to look at all of the files to find the first.
   * @param fresh
   */
  async getFirstDate(fresh: boolean = false): Promise<Dayjs> {
    // Let's get the cache if one exists
    let defaultPayload = { date: null, lastChecked: null }
    let bookDetails = this.storage.local.get(`firstBook`) || defaultPayload
    // If the cache is older than 2 days - let's refresh
    let age = bookDetails.lastChecked ? Math.abs(dayjs(bookDetails.lastChecked).diff(dayjs(), 'day')) : 100
    if (age > 2 || fresh) {
      // Get list of books
      const books = await this.listBooks()
      if (books.length) {
        let parsedBooks = books
          .map((path: string) => {
            // If its a firebase path - then convert it to /
            // let newPath = path.replace("data-books-", "data/books/");
            let split = path.split('/')

            // Split it on the dashes in 2021-01-0
            let yearMonSplit = split[split.length - 1].split('-')
            let year = parseInt(yearMonSplit[0])
            let month = parseInt(yearMonSplit[1])
            let firstDayPart = parseInt(yearMonSplit[2]) // the 0 in 02nd, or the 1 in 12th, or the 2 in the 23rd
            if (!isNaN(year) && !isNaN(firstDayPart)) {
              month = isNaN(month) ? 1 : month
              let d = `${year}-${month}-${firstDayPart}1`
              return dayjs(d)
            } else {
              return null
            }
          })
          .filter((d) => d)
          .sort((a: Dayjs, b: Dayjs) => {
            return a.unix() > b.unix() ? 1 : -1
          })

        let date = parsedBooks[0]
        if (date) {
          this.storage.local.put('firstBook', {
            date: date.toDate().getTime(),
            lastChecked: new Date().getTime(),
          })
        }
        return date
      } else {
        return dayjs()
      }
    } else {
      return dayjs(bookDetails.date)
    }
  }

  /**
   * Get Users Memeories
   * @param getDayLookup -
   */
  public async getMemories(getDayLookup: Function): Promise<Array<NLog>> {
    let times = []
    let firstDate = await this.getFirstDate()
    let yearsDiff = dayjs().diff(firstDate, 'year')

    if (yearsDiff > 1) {
      for (var y = 0; y < yearsDiff; y++) {
        if (y !== 0 && y < 6) {
          times.push(dayjs().subtract(y, 'year'))
        }
      }
    } else if (dayjs().diff(firstDate, 'month') > 5) {
      times.push(dayjs().subtract(6, 'month'))
    }

    let lookupPromises = []
    times
      .filter((time) => time)
      .forEach((time) => {
        lookupPromises.push(getDayLookup(time))
      })

    let years = await Promise.all(lookupPromises)
    let memories = []
    years.forEach((day) => {
      day = day
        .filter((log) => {
          return isLongFormat(log.note)
        })
        .sort((a, b) => {
          return a.note.length < b.note.length ? 1 : -1
        })

      if (day.length) {
        memories.push(day[0])
      }
    })

    return memories
  }

  anyDateToDayjs = (d: Date | number | string | undefined | Dayjs): Dayjs => {
    return dayjs(d)
  }

  /**
   * Nomie Core Record Query Function
   * @param options - IQueryOptions
   * @param existingBooks - pass any existing books to look for
   */
  async query(options: IQueryOptions, existingBooks: IBooks = []) {
    options = options || {}

    // Fresh? Should pull from storage not cache
    options.fresh = options.fresh === false ? false : true

    // Set Start Time - default to 30 days agao
    options.start = options.start ? this.anyDateToDayjs(options.start) : dayjs().subtract(30, 'day')
    options.end = options.end ? this.anyDateToDayjs(options.end) : dayjs().endOf('day')

    /**
     * Get all books to cover this search query time frame
     * logs could be stored across books so we will
     * get the books, then query the results
     */
    // Set official start and end time
    let startTime = options.start.startOf('day')
    let endTime = options.end.endOf('day')

    const booksToGet = ledgerBooksToGet(startTime, endTime)

    /**
     * Batch All
     * Batches the books lookup, which will help
     * make things faster for remote storage engine
     * @returns
     */

    const batch_all = async (): Promise<ILedgerBook> => {
      let rows = []
      let maxPerBatch = 10

      // Create chunks of books - to look up in groups
      let chunks = array_utils.chunk(booksToGet, maxPerBatch)

      // Loop over the chunks of books
      for (var i = 0; i < chunks.length; i++) {
        let books = await get_batch(chunks[i])
        books.forEach((book) => {
          book.forEach((row) => {
            row = row instanceof NLog ? row : new NLog(row)

            /**
             * Remove Duplicates
             * This looks for duplicate _ids
             */
            if (!rows.find((r: NLog) => r._id == row._id)) {
              rows.push(row)
            }
          })
        })
      }
      return rows
    }

    let stateBooks = { ...existingBooks }

    // Get a Specific Batch of Books
    const get_batch = async (booksChunk): Promise<Array<ILedgerBook>> => {
      let gets = []
      // Loop over each book
      booksChunk.forEach((bookPath: string) => {
        // Get the book if it current exists, or create it if not
        stateBooks[bookPath] = stateBooks[bookPath] || []

        /**
         * If the Options.fresh is TRUE (default)
         * it should get the book from the storage lookup first
         * otherwise, it should just look at the existing books
         * that were passed to the this query.
         *
         * If it's a fresh look up, the results will be sent back up to the ledger and stored
         * for future query lookups.
         */
        if (options.fresh !== false) {
          // Generate promise and stuff the results in stateBooks
          let getBook = this.getBook(bookPath)
          getBook.then((rows) => {
            stateBooks[bookPath] = rows
          })
          // Push the promise
          gets.push(getBook)
        } else {
          // Push automatically what we have in memory
          gets.push(Promise.resolve(stateBooks[bookPath]))
        }
      })
      return Promise.all(gets)
    }

    /** Get all  */
    let get_all = async (): Promise<Array<NLog>> => {
      let rows = await batch_all()
      let filtered = logFilter(rows, options)
      return filtered
    } // end get_all()

    try {
      let rows: Array<NLog> = await get_all()
      return {
        books: stateBooks,
        logs: rows.sort((a, b) => (a.end < b.end ? 1 : -1)),
      }
    } catch (e) {
      console.error('Error caught ', e)
      return undefined
    }
  }
}
