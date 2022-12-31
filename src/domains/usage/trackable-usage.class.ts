import dayjs, { Dayjs } from 'dayjs'

import type { CalendarMapOptionsType } from '../../modules/time/time'
import { CalendarGroupByOptions, calendarMap } from '../../modules/time/time'
import math from '../../utils/math/math'
import type NLog from '../nomie-log/nomie-log'
import { Trackable } from '../trackable/Trackable.class'
import { summary } from 'date-streaks'
import ScoreNote from '../../modules/scoring/score-note'
import type { ITrackers } from '../../modules/import/import'
export type TrackableUsageMap = {
  [key: string]: TrackableUsage
}

export type ValueDateUnit = {
  v: number
  d: Date
}

export interface TrackableUsageType {
  trackable: Trackable
  values: Array<number>
  hours?: Array<number>
  dates?: Array<Dayjs>
  positivity?: Array<number>
  displayValue?: string
  groupedBy?: CalendarMapOptionsType
  logs?: Array<NLog>
  unitScores?: Array<number>
  noteScores?: Array<number>
}

export interface TrackableUsageValues {
  values: Array<number>
  dates: Array<Date>
  groupedBy: CalendarMapOptionsType
}

export type StreakSummaryType = {
  currentStreak: number
  longestStreak: number
  streaks: Array<number>
  todayInStreak: boolean
  withinCurrentStreak: boolean
}

export class TrackableUsage {
  trackable: Trackable
  values: Array<number>
  hours: Array<number>
  dates: Array<Dayjs>
  positivity: Array<number>
  displayValue?: string
  groupedBy?: CalendarMapOptionsType
  logs: Array<NLog>
  unitScores?: Array<number>
  noteScores?: Array<number>

  constructor(starter: TrackableUsageType) {
    this.trackable = new Trackable(starter.trackable)
    this.values = starter.values || []
    this.dates = starter.dates || []
    this.displayValue = starter.displayValue
    this.hours = starter.hours || []
    this.groupedBy = starter.groupedBy
    
    this.logs = starter.logs || []
    this.positivity = starter.positivity || []
  }

  /**
   * It takes a list of logs and returns the sum of the scores of each log
   * @param {ITrackers} trackers - ITrackers - this is the object that contains the current state of
   * the game.
   * @returns The total score of the game.
   */
  public getTotalScore(trackers:ITrackers):number {
    return math.sum((this.logs || []).map((note)=>{
      return ScoreNote(note.note, note.end, trackers);
    }))
  }


  /**
   * It returns the middle date of the array of dates.
   * @returns The middle date of the array of dates.
   */
  get middleDate():Date {
    return new Date((this.dates[0].toDate().getTime() + this.dates[this.dates.length-1].toDate().getTime()) / 2);
  }

  get firstDate(): Date {
    return this.logs.sort((a, b) => (a.end > b.end ? 1 : -1))[0].end
  }
  
  get lastDate(): Date {
    return this.logs.sort((a, b) => (a.end < b.end ? 1 : -1))[0].end
  }




  /**
   * It takes a trackable usage object, and returns a new trackable usage object, but with the values
   * grouped by a certain time period
   * @param {CalendarMapOptionsType} name - CalendarMapOptionsType
   * @param {string} format - The format of the date you want to group by. For example, if you want to
   * group by month, you would use "MMM YYYY"
   * @param {boolean} [noScoring=false] - boolean = false
   * @returns A new TrackableUsage object
   */
  groupBy(name: CalendarMapOptionsType, format: string, noScoring: boolean = false): TrackableUsage {
    const groupedBy = name
    let map: any = {}

    for (let d = 0; d < this.dates.length; d++) {
      let date = this.dates[d]
      let key: string = dayjs(date).format(format)
      map[key] = map[key] || {
        key: key,
        values: [],
        date: date,
        format: format,
      }
      let value = isNaN(this.values[d]) ? NaN : this.values[d]
      map[key].values.push(value)
    }
    // Set values
    const datesValues = Object.keys(map).map((key) => {
      let actualValueCount = map[key].values.filter((s) => !isNaN(s)).length
      return {
        dates: map[key].date,
        values: actualValueCount > 0 ? this.trackable.tallyValues(map[key].values) : NaN,
      }
    })
    const values = datesValues.map((m) => m.values)
    const dates = datesValues.map((m) => m.dates)

    const noteScores = (this.logs || []).map((note) => {
      return note.score
    })

    
    return new TrackableUsage({
      trackable: this.trackable,
      displayValue: this.displayValue,
      values,
      dates,
      groupedBy,
      noteScores,
      positivity: values.map((v, index) => {
        return noScoring
          ? 0
          : this.trackable.tracker
          ? this.trackable.tracker?.calculateScore(v, dates[index].toDate())
          : 0
      }),
    })
  }

 /**
  * It returns the sum of the values in the values array
  * @returns The total of the values in the values array.
  */
  get total(): number {
    return this.trackable.tallyValues(this.values)
  }



  formatValue(value: number, includeSymbol: boolean = true): string {
    if (this.trackable.tracker) {
      return this.trackable.tracker.displayValue(value, includeSymbol)
    } else {
      return `${value}`
    }
  }

  get totalDisplay(): string {
    try {
      return `${this.trackable.formatValue(this.total)}`
    } catch (e) {
      return ''
    }
  }
  get totalFormatted(): string {
    return this.totalDisplay
  }
  get totalOnly(): string {
    try {
      return `${this.trackable.formatValue(this.total, false)}`
    } catch (e) {
      return ''
    }
  }

  get average(): number {
    return math.average(this.values.filter((n) => !isNaN(n)))
  }

  get averaged(): TrackableUsage {
    const tu = new TrackableUsage(this)
    const justValues = tu.values.filter((n) => !isNaN(n))
    const max = math.max(justValues)
    tu.values = tu.values.map((v) => {
      if (isNaN(v)) return v
      return math.percentage(max, v)
    })
    return tu
  }

  private getMinMax(type: 'min' | 'max'): undefined | { date: Dayjs; value: number; display?: string } {
    let value: any
    if (type == 'min') {
      value = math.min(this.values)
    } else {
      value = math.max(this.values)
    }
    let index = this.values.indexOf(value)
    if (index > -1) {
      return {
        date: this.dates[index],
        value: this.values[index],
        display: this.trackable.formatValue(this.values[index]),
      }
    } else {
      return undefined
    }
  }

  get max(): undefined | { date: Dayjs; value: number; display?: string } {
    return this.getMinMax('max')
  }

  get min(): undefined | { date: Dayjs; value: number; display?: string } {
    return this.getMinMax('min')
  }

  get byDay(): TrackableUsage {
    return this.groupBy('day', 'YYYY-MM-DD')
  }

  get streakSummary(): StreakSummaryType {
    return summary({ dates: this.dates.map((d) => d.startOf('day').toDate()) })
  }

  /**
   * Truncate
   * @param _start
   * @param _end
   * @returns
   */

  truncate(_start: Dayjs, _end: Dayjs): TrackableUsage {
    const values: Array<number> = []
    const dates: Array<Dayjs> = []
    this.dates.map((d, index) => {
      if (d.unix() <= _end.unix() && d.unix() >= _start.unix()) {
        values.push(this.values[index])
        dates.push(this.dates[index])
      }
    })
    return new TrackableUsage({
      trackable: this.trackable,
      displayValue: this.displayValue,
      values: values,
      dates: dates,
      groupedBy: this.groupedBy,
    })
  }

  /**
   * Reverse the Dates and value arrays
   * Used because some bug in Dashboard is flipping all
   * charts and I can't figure out why.
   * @returns
   */
  reverse(): TrackableUsage {
    let newUsage = new TrackableUsage(this)
    newUsage.values = [...this.values].reverse()
    newUsage.dates = [...this.dates].reverse()
    newUsage.positivity = [...this.positivity].reverse()
    return newUsage
  }

  /**
   * Fill in a full calendar based on a
   * start date, and end date
   * @param _start
   * @param _end
   * @returns
   */
  backfill(_start?: Date, _end?: Date): TrackableUsage {
    if (!_start && !this.dates.length) {
      // console.error('Cannot backfill without at least 2 days provided, or a start and end date')
      return new TrackableUsage({
        trackable: this.trackable,
        displayValue: this.displayValue,
        values: this.values,
        dates: this.dates,
        groupedBy: this.groupedBy,
      })
    }
    // Get date Range
    const date1 = dayjs(_start || this.dates[0])
    const date2 = dayjs(_end || this.dates[this.dates.length - 1])
    let start: Dayjs
    let end: Dayjs

    // Determin which date came first
    end = date1.toDate().getTime() > date2.toDate().getTime() ? date1 : date2
    start = date1.toDate().getTime() < date2.toDate().getTime() ? date1 : date2

    const groupedBy: CalendarMapOptionsType = this.groupedBy || 'day'
    const calendarDates = calendarMap(start.toDate(), end.toDate(), groupedBy)
    const dates: Array<Dayjs> = calendarDates.map((cd) => dayjs(cd.date))
    const values: Array<number> = calendarDates.map(() => NaN)
    const dateFormat: string = (CalendarGroupByOptions[groupedBy] || {}).keyFormat

    if (!dateFormat) {
      throw new Error(`Could not find calendar groupby ${groupedBy}`)
    }

    dates.forEach((date, index) => {
      // Find Value index from original dates
      const valueIndex = this.dates.findIndex((d) => dayjs(d).format(dateFormat) === dayjs(date).format(dateFormat))
      if (valueIndex > -1) values[index] = this.values[valueIndex]
    })

    return new TrackableUsage({
      trackable: this.trackable,
      displayValue: this.displayValue,
      values,
      dates,
      groupedBy: groupedBy,
      positivity: values.map((v, index) => {
        return this.trackable.tracker ? this.trackable.tracker?.calculateScore(v, dates[index].toDate()) : 0
      }),
    })
  }
}
