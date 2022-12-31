import dayjs from 'dayjs'
// import { ledgerBooksToGet } from './ledgerBooksToGet'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(weekOfYear)
import advancedFormat from 'dayjs/plugin/advancedFormat'
dayjs.extend(advancedFormat)
import dayOfYear from 'dayjs/plugin/dayOfYear'
dayjs.extend(dayOfYear)
import { ledgerBooksToGet } from './ledger-books-to-get'
import { it, describe, expect } from 'vitest'
describe('Ledger Books to get', () => {
  it('should get the right books for a date span', () => {
    const end = dayjs(new Date(1641054343319)) // the jan 1 2022
    const start = dayjs(new Date('2021-12-26'))
    const books = ledgerBooksToGet(start, end)
    expect(books[0]).toBe('2021-12-2')
    expect(books[1]).toBe('2021-12-3')
    expect(books[2]).toBe('2022-01-0')
  })
  it('sjhould work with just 1 day lookups', () => {
    const start = dayjs(new Date(1641054343318))
    const end = dayjs(new Date(1641054343319)) // the jan 1 2022
    const books = ledgerBooksToGet(start, end)
    expect(books[0]).toBe('2022-01-0')
  })
})
