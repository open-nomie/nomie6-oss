import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

// import appConfig from '../../config/appConfig'

export const getBookIdFromDate = (_d: Date | number | string | Dayjs): string => {
  const date = dayjs(_d)
  const firstDayPart = date.format('DD').substring(0, 1)
  const format = `${date.format('YYYY-MM-')}${firstDayPart}`

  return format
}

/**
 * Get Books based on a date range
 * Takes a start and end, and returns a list of books that
 * the user can interact with.
 * @param start
 * @param end
 * @returns
 */
export const ledgerBooksToGet = (start: Dayjs, end: Dayjs): Array<string> => {
  let startTime = start.startOf('day')
  let endTime = end.endOf('day')
  // Diff Betwen the two
  // How many different books do we need to get to cover this time span?

  // Determine how many days apart of the dates
  // Always add on 1 after the diff answer - as we need the both days included
  let diff = Math.abs(endTime.diff(startTime, 'day')) + 1
  const keys = {}

  // Loop over diff
  for (let i = 0; i < diff; i++) {
    const dateStr = getBookIdFromDate(startTime.add(i, 'day'))
    if (!keys.hasOwnProperty(dateStr)) {
      keys[dateStr] = dateStr
    }
  }

  return Object.keys(keys)
}
