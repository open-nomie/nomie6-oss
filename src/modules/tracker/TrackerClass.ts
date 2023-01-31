import { Trackable } from '../../domains/trackable/Trackable.class'
import { uomFormat } from '../../domains/uom/uom-utils'
import math from '../../utils/math/math'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
import nid from '../nid/nid'
import ScoreTracker from '../scoring/score-tracker'
import type { ICondition } from '../scoring/score-tracker'
import type { Token } from '../tokenizer/lite'
import type { IFocusUnit } from '../../domains/focus/focus-utils'

export type ITrackerType = 'tick' | 'value' | 'range' | 'picker' | 'note' | 'timer'
export type ITrackerMath = 'sum' | 'mean'

export function toTag(str: string) {
  return (str || '')
    .replace(/('|"|\?|-|\)|\(|\*|\&|\||\$|\@|\+|\#)/gi, '')
    .trim()
    .replace(/( )/g, '_')
    .toLowerCase()
}

export const isTrackableType = (payload: any): Boolean => {
  if (!payload.id) return false
  if (!payload.tag) return false
  return true
}

export type ITracker = {
  id?: string // Id of Tracker
  tag?: string // Tag of Tracker
  label?: string // Label of the Tracker
  type?: ITrackerType // Type of Tracker
  color?: string // Color of Tracker
  math?: ITrackerMath // Sum Mean?
  ignore_zeros?: boolean // Ignore Zeros when doing maths
  uom?: string // Unit of Measure KEY
  emoji?: string // Emoji for the Tracker
  default?: number // Default value for a tracker
  max?: number // Max of a Range
  min?: number // Min of a Range
  minLabel?: string;
  maxLabel?: string;
  step?: number // number of steps for a range
  score?: number // Current Score?
  score_calc?: any // Positivity Score calc
  goal?: any // NOT USED
  one_tap?: boolean // One tapper?
  include?: string // Content to always include when tracking this tracker
  note?: string // Content to include when a note tracker
  hidden?: boolean // Hidden from All Board
  started?: number // If its started (and a timer based tracker)
  timeTracked?: number
  picks?: Array<string> // Picks for a Picker type of tracker
  focus?: Array<IFocusUnit>
}

export default class TrackerClass {
  public id?: string // Id of Tracker
  public tag: string // Tag of Tracker
  public label?: string // Label of the Tracker
  public type?: ITrackerType // Type of Tracker
  public color?: string // Color of Tracker
  public math?: ITrackerMath // Sum Mean?
  public ignore_zeros?: boolean // Ignore Zeros when doing maths
  public uom?: string // Unit of Measure KEY
  public emoji?: string // Emoji for the Tracker
  public avatar?: string
  public default?: number // Default value for a tracker
  public max?: number // Max of a Range
  public min?: number // Min of a Range
  public maxLabel?: string // Max of a Range
  public minLabel?: string // Min of a Range
  public step?: number // Steps for Range
  public score?: number | 'custom' // Current Score?
  public score_calc?: Array<ICondition> // Positivity Score calc
  public goal?: any // NOT USED
  public one_tap?: boolean // One tapper?
  public include?: string // Content to always include when tracking this tracker
  public note?: string // Content to include when a note tracker
  public hidden?: boolean // Hidden from All Board
  public started?: number // If its started (and a timer based tracker)
  public timeTracked?: number // amount of time previously tracker if paused (and a timer based tracker)
  public picks?: Array<string> // Picks for a Picker type of tracker
  public _dirty?: boolean
  public focus?: Array<IFocusUnit>

  constructor(starter) {
    // Starter is generic object with params
    starter = starter || {}
    // The tracker name
    this.tag = this.toTag(starter.tag || '')
    //
    if (!this.tag.length) {
      this._dirty = true
    } else {
      this._dirty = undefined
    }
    this.id = starter.id || nid()
    // Set the Type of the Input
    this.type = starter.type || 'tick'
    // Set the color if it's passed
    this.color = starter.color || '#369DD3'
    // Set Math if it's passed
    this.math = starter.math || 'sum'
    // Set Zeros is its passed
    this.ignore_zeros = starter.ignore_zeros || false
    // Set UOM or default to num
    this.uom = starter.uom || 'num'
    // Set the Mind Body Spirit focus
    this.focus = starter.focus || []
    // Set if encrypt
    // this.always_encrypt = starter.always_encrypt === true ? true : false
    // SEt Emoji
    this.emoji = starter.emoji || null
    this.avatar = starter.avatar || null
    // set Default value
    this.default = starter.default
    // max
    if (this.type === 'range') {
      this.max = starter.max ? starter.max.toString() : '10'
      // min
      this.min = starter.max ? starter.min.toString() : '1'
      // step
      this.step = starter.step || '1'
      this.minLabel = starter.minLabel;
      this.maxLabel = starter.maxLabel;
    }
    // score
    this.score = starter.score
    // Dynamic Score
    this.score_calc = starter.score_calc
    // Goal Config
    this.goal = starter.goal
    // one tap
    this.one_tap = starter.one_tap === true ? true : false
    // include
    this.include = starter.include || ''
    // Primary NOte
    this.note = starter.note

    // Hide from All Board
    this.hidden = starter.hidden === true ? true : false

    // If it's a timer, set if started else null
    if (this.type === 'timer') {
      this.started = starter.started
      this.timeTracked = starter.timeTracked || 0
    }

    this.picks = starter.picks || undefined

    if (starter.label) {
      this.label = starter.label
    } else {
      this.label = this.displayTag()
    }
  }

  getUID() {
    return nid(this.tag)
  }

  toTrackable(value?: string | number): Trackable {
    return new Trackable({
      type: 'tracker',
      id: this.id,
      tracker: this,
      value: parseNumber(value),
    })
  }

  /**
   * Generate a Note Chunk for this Tracker
   * @param value
   */
  toNoteString(value: number | undefined = undefined) {
    const parts = []
    parts.push(`#${this.tag}`)
    if (value !== undefined) {
      parts.push(`(${value})`)
      if (this.include && this.include.length) {
        parts.push(` ${this.getIncluded(value)}`)
      }
    } else if (this.default) {
      parts.push(`(${this.default})`)
      if (this.include && this.include.length) {
        parts.push(' ')
        parts.push(` ${this.getIncluded(this.default)}`)
      }
    }
    return parts.join('').trim()
  }

  getIncluded(value) {
    let includedStr = this.include || ''
    if (includedStr.search('{value}') > -1) {
      includedStr = includedStr.replace(/\{value\}/gi, value || '')
    } else {
      includedStr = includedStr.replace(/\*/, value || '')
    }
    return includedStr.trim()
  }

  toToken(value?: number | string): Token {
    const raw = value ? `#${this.tag}(${value})` : `#${this.tag}`
    return {
      id: this.tag,
      type: 'tracker',
      raw,
      prefix: '#',
      value: parseNumber(value),
    }
  }

  // Make the tag look good if no label is provided
  displayTag() {
    return this.tag
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
  }

  toTag(str) {
    // TODO : make this replace special characters too
    return toTag(str)
  }

  displayValue(value, unit = true) {
    let v = parseNumber(value) || 0
    //return value;
    return uomFormat(Math.round(v * 100) / 100, this.uom, unit)
  }

  calculateScore(value: number, date: Date) {
    return ScoreTracker(value, this, date)
  }

  displayValues(values: Array<number>, displayUnitText: boolean = true) {
    const total = this.math === 'sum' ? math.sum(values) : math.average(values)
    return this.displayValue(total, displayUnitText)
  }

  get asObject() {
    return JSON.parse(JSON.stringify(this))
  }
}
