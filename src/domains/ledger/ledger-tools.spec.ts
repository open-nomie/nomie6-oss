import { DumbStorage } from '../storage/engines/storage.dumb'
import LedgerTools from './ledger-tools'
import NLog from '../nomie-log/nomie-log'
import dayjs from 'dayjs'
import { getBookIdFromDate } from './ledger-books-to-get'
import { it, describe, expect } from 'vitest'
describe('Ledger Tools test sweeeeet', () => {
  let ledgerTools = new LedgerTools(DumbStorage, (date: string) => {
    return `data/books/${getBookIdFromDate(dayjs(date))}`
  })
  let baseDate = dayjs()
  let logs = []

  logs.push(
    new NLog({
      note: '#dance(1) firefly freedom',
      end: dayjs(baseDate).toDate().getTime(),
    })
  )
  logs.push(
    new NLog({
      note: '#dance(4) free',
      end: dayjs(baseDate).toDate().getTime(),
    })
  )
  logs.push(
    new NLog({
      note: '#dance(1) freedom #tree #bird',
      end: dayjs(baseDate).toDate().getTime(),
    })
  )
  logs.push(
    new NLog({
      note: '#house for the #bird',
      end: dayjs(baseDate).toDate().getTime(),
    })
  )

  // it("should save a book of logs", async () => {

  //   expect(res).toBeTruthy();
  // });

  it('should get a book of logs', async () => {
    await ledgerTools.saveBook(getBookIdFromDate(baseDate), logs)
    let res = await ledgerTools.getBook(getBookIdFromDate(baseDate))
    expect(res[0].note).toBe(logs[0].note)
    expect(res[1].note).toBe(logs[1].note)
    expect(res[2].note).toBe(logs[2].note)
  })

  it('should query for logs', async () => {
    let res = await ledgerTools.query({ search: 'dance' })
    expect(res.logs.length).toBe(3)
    expect(res.books).toBeTruthy()

    let res2 = await ledgerTools.query({ search: 'freedom' })
    expect(res2.logs.length).toBe(2)

    let res3 = await ledgerTools.query({ search: 'house OR tree' })
    expect(res3.logs.length).toBe(2)

    let res4 = await ledgerTools.query({ search: 'free', fuzzy: true })
    expect(res4.logs.length).toBe(3)

    let res5 = await ledgerTools.query({ search: 'house and bird' })
    expect(res5.logs.length).toBe(1)
  })

  it('should load up with dumb storage', () => {
    expect(ledgerTools).toBeTruthy()
  })

  // it('should list books', async () => {
  //   let books = await ledgerTools.listBooks()
  //   expect(books[0]).toBe(`${appConfig.book_root}/${getBookIdFromDate(baseDate)}`)
  // })

  // TODO figure out how to get dayjs weekly format into jest

  // it("should convert the right date time", () => {
  //   dayjs.extend(weekOfYear);
  //   expect(dayjs().format(appConfig.book_time_format)).toBe("something");
  // });

  // This no longer works since the test can handle the dayjs plugin for week

  // it("should get first book date", async () => {
  //   let books = await ledgerTools.listBooks();

  //   let firstDate = await ledgerTools.getFirstDate(true);

  //   expect(dayjs(firstDate).format("YYYY-MM-DD")).toBe(dayjs().startOf("month").format("YYYY-MM-DD"));
  // });

  it('should clean a dirty Object, and create a clean NLog', () => {
    let log = {
      note: ' Dirty log man ',
      _dirty: true,
      stats: { random: 'stuff ' },
      meta: {},
      source: 'test',
    }
    let cleaned: any = ledgerTools.prepareLogForSave(log)
    expect(cleaned.meta).toBeUndefined()
    expect(cleaned).toBeInstanceOf(NLog)
    expect(cleaned.source).toBe('test')
    expect(cleaned._ditry).toBeUndefined()
    expect(cleaned.start).toBeTruthy()
    expect(cleaned.note).toBe('Dirty log man')
  })

  it('should clean dirty NLog and clean it NLog', () => {
    let log: any = new NLog({})
    log.note = ' Dirty log man '
    log._dirty = true
    log.stats = { random: 'stuff ' }
    log.meta = {}
    log.source = 'test'
    let cleaned: any = ledgerTools.prepareLogForSave(log)
    expect(cleaned.meta).toBeUndefined()
    expect(cleaned).toBeInstanceOf(NLog)
    expect(cleaned.source).toBe('test')
    expect(cleaned._ditry).toBeUndefined()
    expect(cleaned.start).toBeTruthy()
    expect(cleaned.note).toBe('Dirty log man')
  })

  it('should get tracker values from logs (as used in today)', () => {
    let today = ledgerTools.getTrackersAndValuesFromLogs(logs)
    expect(today.dance).toBeTruthy()
    expect(today.dance.values.join(',')).toBe('1,4,1')
  })
})
