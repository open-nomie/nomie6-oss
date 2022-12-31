import type { IStorage } from '../../domains/storage/storage'
import NLog from '../nomie-log/nomie-log'
import { wait } from '../../utils/tick/tick'
import type LedgerTools from './ledger-tools'

// const console = new Logger(":The Ledger importer", true);

export class LedgerImporter {
  storage: IStorage
  status: Function
  rows: Array<NLog>
  ledgerTools: LedgerTools
  // putBook: Function
  // getBook: Function

  constructor(storage: any, rows: Array<NLog>, statusCallback: Function, ledgerTools: LedgerTools) {
    this.storage = storage
    this.rows = rows
    this.status = statusCallback
    this.ledgerTools = ledgerTools
  }

  public async import() {
    // Set the callback / status function
    let statusFunc = this.status || function () {}
    let importBooks = {}

    this.rows.forEach((rawLog) => {
      let log = rawLog instanceof NLog ? rawLog : new NLog(rawLog)
      let bookKey = log.bookId
      delete log._dirty
      importBooks[bookKey] = importBooks[bookKey] || []
      importBooks[bookKey].push(log)
    })
    let bookDates = Object.keys(importBooks).map((date) => {
      return {
        date: date,
        records: importBooks[date],
      }
    })

    // Create to hold books while we loop over the results
    let existingBooks = {}

    // Step through each book Date,
    // Create or merge the rows
    // make sure to check for duplicates
    let duplicates: number = 0

    const failures: Array<string> = []
    // Loop over each Book
    for (let i = 0; i < bookDates.length; i++) {
      let row = bookDates[i]
      // Get Book Date
      let bookKey = row.date
      // Define existing rows
      let existingRows: Array<NLog> = []
      // Check if book is cashed already
      if (existingBooks[bookKey]) {
        existingRows = existingBooks[bookKey]
      } else {
        // if not cached, get the book from storage
        existingRows = await this.ledgerTools.getBook(bookKey, true)
        existingRows = existingRows || []
        // Assign book to book loopup
        existingBooks[bookKey] = existingRows
      }
      // Define Duplicate Counter for this book
      // let duplicates = [];

      // Try and import the records for this book
      // Filter out logs that have a matching .hash() result
      row.records.forEach((log) => {
        // Does Existing Row have a log with the same has as the log provided?
        if (existingRows.findIndex((elog) => elog.hash() == log.hash()) == -1) {
          existingRows.push(log)
        } else {
          duplicates++
        }
      })
      // Save the Book with the Merged Rows

      await this.ledgerTools.saveBook(row.date, existingRows).catch((e) => {
        console.error('Error importing', e.message)
        failures.push(row.date)
      })
      if (this.storage.engine.id === 'firebase') {
        await wait(20)
      }
      // Show console if duplicates were found

      // Update Status Function
      statusFunc({
        importing: 'logs',
        step: i,
        total: bookDates.length - 1,
        duplicates,
      })
    } // end for loop

    if (duplicates) {
      console.error(`${duplicates} duplicates found`)
    }
    if (failures.length) {
      alert(`Importer failed to import ${failures.length} weeks of data. ${failures.join(', ')}`)
    }

    return existingBooks
  }
}
