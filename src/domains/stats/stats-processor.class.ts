import dayjs, { OpUnitType } from 'dayjs'
import type { Dayjs } from 'dayjs'
// Modules
import logFilter from '../nomie-log/log-filter/log-filter'
// Utils
import _math from '../../utils/math/math'

import getTimeOfDay from './time-of-day'
import getDayOfWeek from '../stats2/day-of-week'

import NLog from '../nomie-log/nomie-log'

import type { IDow } from '../stats2/day-of-week'
import type { ITrackerMath } from '../../modules/tracker/TrackerClass'
import type {
  IStats,
  IStatsChartLabel,
  IStatsChartMode,
  IStatsChartValue,
  IStatsConfig,
  IStatsMaxMin,
  IStatsTod,
  IStatsValueMap,
  ITimeSpanUnit,
} from './stats-types'
import { timeSpans } from './stats-types'
import type { Trackable } from '../trackable/Trackable.class'
import type { Token, TokenTypes } from '../../modules/tokenizer/lite'

class StatsProcessor implements IStats {
  trackable: Trackable
  rows: Array<NLog>
  type: TokenTypes
  math: ITrackerMath
  avg: number
  sum: number
  chart: {
    labels: Array<IStatsChartLabel>
    values: Array<IStatsChartValue>
    mode: IStatsChartMode
  }
  dow: IDow
  tod: IStatsTod
  min: IStatsMaxMin
  max: IStatsMaxMin
  fromDate: Dayjs
  toDate: Dayjs
  mode: IStatsChartMode
  is24Hour: boolean
  streak?: any
  _stats?: StatsProcessor
  valueMap: IStatsValueMap

  constructor(starter: IStatsConfig) {
    // Set Defaults
    starter = starter || {}
    this.rows = starter.rows || []

    this.fromDate = starter.fromDate || dayjs().subtract(1, 'week')
    this.toDate = starter.toDate || dayjs()

    this.fromDate = this.fromDate.startOf('day')
    this.toDate = this.toDate.endOf('day')

    this.mode = starter.mode || 'w'
    if (starter.trackable) {
      this.trackable = starter.trackable
    }
    this.is24Hour = starter.is24Hour || false
    this.math = starter.math || 'sum'
  }

  init(config: IStatsConfig) {
    if (config.fromDate) {
      this.fromDate = dayjs(config.fromDate)
    }
    if (config.toDate) {
      this.toDate = dayjs(config.toDate)
    }

    this.mode = config.mode || this.mode
    this.trackable = config.trackable || this.trackable
    this.is24Hour = config.is24Hour || this.is24Hour
    this.rows = config.rows || this.rows

    if (config.math !== this.math && config.math) {
      this.math = config.math
    }

    if (this.trackable) {
      this.rows = logFilter(this.rows, { search: this.trackable.tag })
    } else {
      this.rows = []
    }
  }

  /**
   * Generate Results from a Config
   * @param {Object} config
   */
  generate(config: IStatsConfig) {
    this.init(config)
    return this.generateResults()
  }

  /**
   * getUnitFormat
   * Get Unit dayjs Format
   */
  getUnitFormat() {
    return timeSpans[this.mode].format
    // if (this.mode == "d") {
    //   unitFormat = "H";
    // } else if (this.mode == "w" || this.mode == "m") {
    //   unitFormat = "YYYY-MM-DD";
    // } else if (this.mode == "q") {
    //   unitFormat = "YYYY-w";
    // } else if (this.mode == "y") {
    //   unitFormat = "YYYY-MM";
    // }
    // return unitFormat;
  }

  getDayMap(): { [key: string]: number } {
    let map: any = {}
    let diff: number = Math.abs(this.fromDate.diff(this.toDate, 'day')) + 1
    for (var i = 1; i < diff; i++) {
      map[this.fromDate.add(i, 'day').format('YYYY-MM-DD')] = 0
    }
    return map
  }

  getStreakData(): {
    coverage: number
    days: number
    on: number
    off: number
    streak: number
  } {
    let dayMap = this.getDayMap()
    this.rows.forEach((row: NLog) => {
      let key = dayjs(new Date(row.end)).format('YYYY-MM-DD')
      if (dayMap[key]) {
        dayMap[key]++
      }
    })
    // loop over totals
    let totals = Object.keys(dayMap)
      .map((dateKey: string) => {
        return {
          key: dateKey,
          count: dayMap[dateKey],
        }
      })
      .sort((a, b) => {
        return a.key < b.key ? 1 : -1
      })
    // Find the first index with 0 count.
    let firstZero = totals.findIndex((row) => row.count == 0)
    // If -1 it's completed every day
    if (firstZero == -1) {
      return {
        coverage: 1,
        streak: Object.keys(dayMap).length,
        days: totals.length,
        on: totals.length,
        off: 0,
      }
    } else {
      let totalOn = totals.filter((row) => {
        return row.count > 0
      }).length
      let totalOff = totals.filter((row) => {
        return row.count == 0
      }).length
      // Return the Streak payload
      return {
        coverage: _math.percentage(totalOn, totalOff),
        streak: firstZero,
        days: totals.length,
        on: totalOn,
        off: totals.filter((row) => {
          return row.count === 0
        }).length,
      }
    }
  }

  public getScore(): { score: number; emoji: string } {
    let scores = []
    this.rows.forEach((row) => {
      let score = row.score || row.calculateScore()
      scores.push(score)
    })
    let score = _math.sum(scores)
    if (score > 0) {
      return {
        score,
        emoji: '😄',
      }
    } else if (score < 0) {
      return {
        score,
        emoji: '😞',
      }
    } else {
      return {
        score: 0,
        emoji: '😐',
      }
    }
  }

  getStarterValueMap(): IStatsValueMap {
    let valueMap = {}
    let start = this.fromDate
    let end = this.toDate
    let timespan: ITimeSpanUnit = timeSpans[this.mode]
    let diff = Math.abs(start.diff(end, timespan.displayUnit)) + 1
    for (let i = 0; i < diff; i++) {
      valueMap[end.subtract(i, timespan.displayUnit).format(timespan.format)] = []
    }
    return valueMap
  }

  /**
   * Generate a Value Map
   * {
   *    '2020-03-02': [1,2],
   *    '2020-03-01: [1]
   * }
   * @param {Array} rows
   */
  getValueMap(overrideRows, _unitFormat?: string): any {
    let rows = overrideRows || this.rows
    let valueMap = this.getStarterValueMap()
    const acceptableDates: Array<string> = Object.keys(valueMap)
    // Loop Over each Row
    rows.forEach((row) => {
      // Expand Row if not expanded
      row = row instanceof NLog ? row : new NLog(row)
      row.getMeta()

      let unitFormat = _unitFormat || this.getUnitFormat() // get unit for time format
      let unitKey = dayjs(row.end).format(unitFormat) // generate unit Key

      // Fill in the Value Map with an empty array if not exist
      if (acceptableDates.indexOf(unitKey) > -1) {
        valueMap[unitKey] = valueMap[unitKey] || []

        // If it's a person or context, just count 1
        if (this.trackable.type == 'person' || this.trackable.type == 'context') {
          valueMap[unitKey].push(1)
        } else {
          // It's a tracker
          row.trackers
            // filter only matches for the trackableElement
            .filter((te: Token) => {
              // Only return trackers with the matching Trackable Element Id
              return `${te.prefix}${te.id}` === this.trackable.id
            })
            .forEach((trackerElement) => {
              // Push their value
              valueMap[unitKey].push(trackerElement.value)
            })
        }
      } // end if it's an acceptable date range
    })
    return valueMap
  }

  /**
   * Get the Min and Max values
   * from a valueMap
   * @param {Object} valueMap
   */

  getMinMaxFromValueMap(valueMap) {
    let min = { value: null, dateKey: null, date: null }
    let max = { value: 0, dateKey: null, date: null }
    let dates = []
    let values = []
    Object.keys(valueMap).map((dateKey) => {
      let value
      if (this.math === 'sum') {
        value = _math.sum(valueMap[dateKey])
      } else {
        value = _math.average(valueMap[dateKey])
      }
      values.push(value)
      dates.push({ dateKey, value })
    })
    min.value = _math.min(values, false)
    max.value = _math.max(values)
    let maxDateFound = dates.find((d) => d.value == max.value)
    let minDateFound = dates.find((d) => d.value == min.value)
    min.date = minDateFound ? dayjs(minDateFound.dateKey).toDate() : new Date()
    min.dateKey = minDateFound ? minDateFound.dateKey : null
    max.date = maxDateFound ? dayjs(maxDateFound.dateKey).toDate() : new Date()
    max.dateKey = maxDateFound ? maxDateFound.dateKey : null

    return { min, max }
  }

  /**
   * Get Related Items
   * @param {Array} rows NLog
   */
  getRelated(overrideRows?: Array<NLog>) {
    let rows = overrideRows || this.rows
    let people = {}
    let context = {}
    let tags = {}

    this.rows.forEach((row: NLog) => {
      if (!row.trackers) {
        row.getMeta()
      }
      row.trackers.forEach((trackerElement) => {
        tags[trackerElement.id] = tags[trackerElement.id] || 0
        tags[trackerElement.id]++
      })
      row.people.forEach((personElement) => {
        people[personElement.id] = people[personElement.id] || 0
        people[personElement.id]++
      })
      row.context.forEach((contextElement) => {
        context[contextElement.id] = context[contextElement.id] || 0
        context[contextElement.id]++
      })
    })

    const returnMap = (base, type, prefix) => {
      return Object.keys(base).map((elementId) => {
        return {
          count: base[elementId],
          type: type,
          value: elementId,
          search: `${prefix}${elementId}`,
        }
      })
    }

    let peopleArr = returnMap(people, 'person', '@')
    let tagArr = returnMap(tags, 'tracker', '#')
    let contextArr = returnMap(context, 'context', '+')

    let relatedArr = [...peopleArr, ...tagArr, ...contextArr].sort((a, b) => {
      return a.count < b.count ? 1 : -1
    })

    return relatedArr
  }

  /**
   * getChartDataByType
   * Generate chart data for a set of options
   *
   * @param {*} unit // hour, day, month, year
   * @param {*} timeFormat // format of the day
   * @param {*} labelFormat // label format dayjs
   * @param {*} valueMapTotals // totals from the valuemap
   */
  getChartDataByType(unit, timeFormat, labelFormat, valueMapTotals) {
    let labels = [] // Holds the labels for the chart
    let values = [] // holds the values for the cahrt
    let unitValues = valueMapTotals.days // Each of the individual x units for the chart
    // Get start
    // Set the from date... if it's hour - keep it on the same day.
    let from = unit == 'hour' ? this.toDate.startOf('day') : this.fromDate
    // Get End
    let to = unit == 'hour' ? this.toDate.endOf('day') : this.toDate
    // Get Length between to and fromt
    let diff = to.diff(from, unit)
    // Loop over each diff
    for (var i = 0; i <= diff; i++) {
      // Get the unit format
      const unitDate = dayjs(from).add(i, unit)
      // Generate the key
      let key = unitDate.format(timeFormat)
      // Generate a label
      let label = unitDate.format(labelFormat)
      // If our unitValues map has our key we will
      let value
      // Get the value if it exists
      if (unitValues.hasOwnProperty(key)) {
        // Is this a sum or a average?
        value = this.math == 'sum' ? unitValues[key].sum : unitValues[key].avg
      }
      // Push the label
      labels.push({ x: label })
      // Push the value
      values.push({ x: label, y: value || 0, date: unitDate, unit })
    }
    // Return labels and values
    return {
      labels,
      values,
    }
  }

  /**
   * getChartData
   * returns the chart data fro a given type
   * @param {*} valueMapTotals
   */
  getChartData(valueMapTotals, modeOverride?: 'd' | 'w' | 'm' | 'q' | 'y') {
    // If it's a date mode
    let mode = modeOverride || this.mode
    let timespan: ITimeSpanUnit = timeSpans[mode]
    if (mode == 'd') {
      let { labels, values } = this.getChartDataByType(
        timespan.displayUnit,
        timespan.format,
        this.is24Hour ? 'H' : 'ha',
        valueMapTotals
      )

      return {
        mode: mode,
        labels,
        values,
      }
      // If it's a week mode
    } else if (this.mode == 'w') {
      let { labels, values } = this.getChartDataByType(timespan.displayUnit, timespan.format, 'dd Do', valueMapTotals)
      return {
        mode: mode,
        labels,
        values,
      }
      // if it's a month mode
    } else if (mode == 'm') {
      let { labels, values } = this.getChartDataByType(
        timespan.displayUnit,
        timespan.format,
        this.is24Hour ? 'D/M' : 'M/D',
        valueMapTotals
      )
      return {
        mode: mode,
        labels,
        values,
      }
      // If it's a year mode
    } else if (mode == 'q') {
      let { labels, values } = this.getChartDataByType(
        timespan.displayUnit,
        timespan.format,
        this.is24Hour ? 'D/M' : 'M/D',
        valueMapTotals
      )
      return {
        mode: mode,
        labels,
        values,
      }
      // If it's a year mode
    } else if (mode == 'y') {
      let { labels, values } = this.getChartDataByType(timespan.displayUnit, timespan.format, 'MMM', valueMapTotals)
      return {
        mode: mode,
        labels,
        values,
      }
    }
  } // end to Chart Data;

  getTracker(): Tracker | undefined {
    if (this.trackable?.tracker) {
      return this.trackable.tracker
    }
    return undefined
  }

  getValueMapTotals(valueMap) {
    let newMap = {
      sum: 0,
      avg: 0,
      days: {
        ...valueMap, // put the valuemap in this new map
      },
    }
    // Hold all values for total sum and avg
    let allValues = []
    let ignoreZeros = this.getTracker()?.ignore_zeros || false
    // Loop over the days provided
    Object.keys(newMap.days).forEach((date) => {
      let values = newMap.days[date]
      // If we should ignore zeros, then
      // filter them out.

      if (ignoreZeros) {
        values = values.filter((v) => {
          return v !== 0 ? true : false
        })
      }
      // Let's calcuate the days total
      if (values.length) {
        // If it's sum - add them all up
        if (this.math === 'sum') {
          allValues.push(_math.sum(values))
        } else {
          // Else add it to the array for average lating
          allValues = [...allValues, ...values]
        }
      }
      // Sum and Avg this day
      newMap.days[date] = {
        sum: _math.sum(values),
        avg: _math.average(values),
      }
    }) // end loop over each day

    newMap.sum = _math.sum(allValues)
    newMap.avg = _math.average(allValues, ignoreZeros)
    return newMap
  }

  generateResults(): IStats {
    this.valueMap = this.getValueMap(this.rows)
    let valueMapTotals = this.getValueMapTotals(this.valueMap)
    let minMax = this.getMinMaxFromValueMap(this.valueMap)
    let chart = this.getChartData(valueMapTotals)
    return {
      _stats: this,
      type: this.trackable.type,
      trackable: this.trackable,
      math: this.math,
      rows: this.rows,
      chart: chart,
      avg: valueMapTotals.avg,
      sum: valueMapTotals.sum,
      min: minMax.min,
      max: minMax.max,
      // streak: this.getStreakData(),
      dow: getDayOfWeek(this.rows), // day of week
      tod: getTimeOfDay(this.rows, this.trackable.id, this.math), // time of day
      start: this.fromDate,
      end: this.toDate,
    }
  }
}

export default StatsProcessor
