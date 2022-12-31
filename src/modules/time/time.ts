import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type CalendarMapOptionsType = 'hour' | 'day' | 'week' | 'month' | 'year'

export type DayPartUnit = 'morning' | 'afternoon' | 'evening'
export const dateToDayPart = (date: Date): DayPartUnit => {
  let d = dayjs(date)
  let h: number = parseInt(d.format('H'))
  if (h >= 6 && h < 12) {
    return 'morning'
  } else if (h >= 12 && h < 18) {
    return 'afternoon'
  } else if (h >= 18 && h < 20) {
    return 'evening'
  } else {
    return 'evening'
  }
}

export default {
  toId(date: Date) {
    return [date.getTime().toString(16), Math.random().toString().substr(3, 8)].join('.')
  },
  fromId(idString: string): Date {
    try {
      const split = idString.split('.')
      const date = new Date(parseInt(split[0], 16))
      return date
    } catch (e) {
      throw e
    }
  },
  padTime(t: any) {
    return (t + '').length === 1 ? (t + '').padStart(2, '0') : t
  },
  isToday(date: Date): boolean {
    return new Date().toDateString() === date.toDateString()
  },
  isSameDay(date1: Date, date2: Date): boolean {
    if (date1 && date2) {
      return date1.toDateString() === date2.toDateString()
    } else {
      return false
    }
  },
  // Seconds to Time Chunk
  secondsToTime(secondsVar: number): string {
    secondsVar = secondsVar || 0
    let seconds = secondsVar
    let minutes = Math.floor(parseInt(`${seconds}`) / 60).toString()
    let hours

    if (parseInt(minutes) > 59) {
      hours = Math.floor(parseInt(minutes) / 60).toString()
      minutes = (parseInt(minutes) - parseInt(hours) * 60).toString()
    }

    seconds = Math.floor(parseInt(`${seconds}`) % 60)
    minutes = minutes

    if (hours) {
      hours = parseInt(`${hours}`)
      return `${this.padTime(hours)}:${this.padTime(minutes)}:${this.padTime(seconds)}`
    }
    return `00:${this.padTime(minutes)}:${this.padTime(seconds)}`
  },
  dateToDesc(date: Date) {
    let d = dayjs(date)
    let h: number = parseInt(d.format('H'))
    if (h >= 6 && h < 12) {
      return 'morning'
    } else if (h >= 12 && h < 18) {
      return 'afternoon'
    } else if (h >= 18 && h < 20) {
      return 'evening'
    } else {
      return 'night'
    }
  },
  fromNow(date: Date | number, includeAgo: boolean = true): string {
    let fromNow = dayjs(date).fromNow()
    let v = fromNow
    if (fromNow == 'a few seconds ago') {
      v = 'now'
    } else {
      v = v.replace('minutes', 'min').replace('seconds', 'sec').replace('months', 'mon').replace('hours', 'hrs')
    }
    if (!includeAgo) {
      v = v.replace('ago', '').trim()
    }
    return v
  },
  datetimeLocal(dateString: string): Date {
    let dateSplit = dateString.split('T')
    let dateStr = dateSplit[0]
    let timeStr = dateSplit[1]

    // This hack brought to you by datetime-local
    // iOS defaults to GMT - but it doesn't do it on
    // desktop browsers.
    let updatedDate = dayjs(dateStr, 'YYYY-MM-DD')
      .set('hour', parseFloat(timeStr.split(':')[0]))
      .set('minute', parseFloat(timeStr.split(':')[1]))
      .toDate()
    return updatedDate
  },
  // Milliseconds to Seconds
  msToSecond(ms: number): number {
    return ms / 1000
  },
  timestringToSeconds(timestring: string): number {
    let tsa = timestring.split(':')
    return this.unitsToSeconds(tsa[0], tsa[1], tsa[2])
  },
  unitsToSeconds(hour: any, minutes: any, seconds: any): number {
    let s = 0
    s = (parseInt(hour) || 0) * 60 * 60
    s = s + (parseInt(minutes) || 0) * 60
    s = s + (parseInt(seconds) || 0)
    return s
  },
  // Get an array from 00 to 59
  getNumberedArray(stopAt: number): Array<string> {
    stopAt++
    let items = []
    for (var i = 0; i < stopAt; i++) {
      items.push((i + '').toString().length == 1 ? `0${i}` : `${i}`)
    }
    return items
  },
  toggleAMPM(date: Date): Date {
    let _date = dayjs(date)
    let ap = _date.format('a')
    let hour = parseInt(_date.format('H'))
    if (ap == 'am' && hour !== 12) {
      return _date.add(12, 'hour').toDate()
    } else if (ap == 'pm' && hour !== 12) {
      return _date.subtract(12, 'hour').toDate()
    } else {
      return _date.toDate()
    }
  },
  getDateFormat(size: Sizes = 'md', unitSystem: 'imperial' | 'metric', noYear: boolean = false) {
    let format: string = ''
    switch (size) {
      case 'xs':
        format = unitSystem == 'imperial' ? 'M/D/YY' : 'D/M/YY'
        break
      case 'sm':
        format = unitSystem == 'imperial' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'
        break
      case 'md':
        format = unitSystem == 'imperial' ? 'MMM D YYYY' : 'D MMM YYYY'
        break
      case 'lg':
        format = unitSystem == 'imperial' ? 'MMM Do YYYY' : 'Do MMM YYYY'
        break
      case 'xl':
        format = unitSystem == 'imperial' ? 'ddd MMM Do YYYY' : 'ddd Do MMM YYYY'
        break
    }
    return noYear ? format.replace(/(YYYY|YY)/, '') : format
  },
  getTimeFormat(size: Sizes = 'md', unitSystem: 'imperial' | 'metric') {
    switch (size) {
      case 'xs':
        return unitSystem == 'imperial' ? 'ha' : 'H:mm'
      case 'sm':
        return unitSystem == 'imperial' ? 'h:mma' : 'HH:mm'
      default:
        return unitSystem == 'imperial' ? 'h:mm a' : 'HH:mm'
    }
  },
  calendarMap,
  getWeekOfMonth,
  dateToWeekString,
}

export function calendarMap(start: Date, end: Date, grouping: CalendarMapOptionsType = 'day'): Array<GroupedDateItem> {
  const _start: Dayjs = dayjs(start).startOf(grouping)
  const _end: Dayjs = dayjs(end).endOf(grouping)
  const units = Math.abs(_end.startOf(grouping).diff(_start, grouping)) + 1
  return Array(units)
    .fill(0)
    .map(({}, index) => {
      return {
        date: _start.add(index, grouping).toDate(),
      }
    })
}

export function getWeekOfMonth(date: Date) {
  let adjustedDate = date.getDate() + date.getDay()
  let prefixes = ['0', '1', '2', '3', '4', '5']
  return parseInt(prefixes[0 | (adjustedDate / 7)]) + 1
}

export function dateToWeekString(date: Date): string {
  return `${dayjs(date).format('YYYY-MM')}-w${getWeekOfMonth(date)}`
}

export interface GroupedDateItem {
  date: Date
}

export const CalendarGroupByOptions = {
  hour: {
    keyFormat: 'YYYY-MM-DD-HH',
  },
  day: {
    keyFormat: 'YYYY-MM-DD',
  },
  week: {
    keyFormat: 'YYYY-MM-DD-w',
  },
  month: {
    keyFormat: 'YYYY-MM',
  },
  quarter: {
    keyFormat: 'YYYY-MM',
  },
  year: {
    keyFormat: 'YYYY',
  },
}
