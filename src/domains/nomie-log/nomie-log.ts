import dayjs, { Dayjs } from 'dayjs'

import type { GeoType } from '../map/LocationModalStore'
import type { ITrackables } from '../ledger/ledger-tools'
import type { ITrackers } from '../../modules/import/import'
import ScoreNote from '../../modules/scoring/score-note'
import type { Token } from '../../modules/tokenizer/lite'
import { Trackable } from '../trackable/Trackable.class'
// Modules
import extractor from '../../utils/extract/extract'
import { getBookIdFromDate } from '../ledger/ledger-books-to-get'
import math from '../../utils/math/math'
import nid, { fastHash } from '../../modules/nid/nid'
import { notePercentage } from './nomie-log-utils'
import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
import { tokenizeLite } from '../../modules/tokenizer/lite'

export type NomieLogType = {
  note?: string
  start?: Date
  end?: Date
  score?: number
  lat?: number
  lng?: number
  location?: string
  offset?: number
  modified?: number
  source?: string
  pinned?: boolean
}

/**
 * Nomie Log / Record
 * It's been called a record since Nomie 1, but a log is a better name
 * you'll see i've used the term both thoughout - 🤦‍♂️
 */
export class NLog {
  public _dirty?: boolean
  public _id?: string
  public note?: string
  public start: Date
  public end: Date
  public score?: number
  public lat?: number
  public lng?: number
  public location?: string
  public offset?: number
  public modified?: number
  public source?: string
  public pinned?: boolean

  public trackers: Array<Token>
  public people: Array<Token>
  public context: Array<Token>

  constructor(starter: NomieLogType | any) {
    starter = starter || {}

    this._dirty = starter._id ? undefined : true

    this._id = starter._id || nid(10) // create a random 10 char id if not proviedd
    this.note = (starter.note || starter.notes || '').trim() // Trim the note

    /**
     * Nomie uses the End date as the primary time.
     * Currently as of 4.4.1 there is no active use of start..
     */

    this.end = starter.end ? new Date(starter.end) : new Date()
    this.start = starter.start ? new Date(starter.start) : new Date(this.end.getTime() - 1000)

    this.pinned = starter.pinned ? true : false;
    // Score Calculation
    // This Might be a bad idea - but i'm doing it anyways
    // If a score is set, use it - if not, calculate it.
    // If a score is 0 or not set
    //starter.score ||
    this.score = starter.score

    // Get location
    this.lat = starter.lat || null
    this.lng = starter.lng || null
    this.location = starter.location || ''
    // Add current timezone offset

    this.offset = starter.offset || new Date().getTimezoneOffset()

    // Get if this has been edited
    this.modified = starter.modified || false

    // Get the source if provided
    this.source = starter.source || null
  }

  get hasNote(): boolean {
    return notePercentage(this.note || '') > 5
  }

  endDayjs(): Dayjs {
    return dayjs(this.end)
  }
  startDayjs(): Dayjs {
    return dayjs(this.start)
  }

  get elements(): Array<Token> {
    return tokenizeLite(this.note)
  }

  get bookId(): string {
    return getBookIdFromDate(this.end)
  }

  get hasTodo(): boolean {
    return `${this.note || ''}`.search(/(\[\]|\[x\])/gi) > -1;
  }

  // Get it as an object
  toObject() {
    return {
      _id: this._id,
      note: this.note,
      end: this.end,
      start: this.start,
      score: this.score,
      lat: this.lat,
      lng: this.lng,
      location: this.location,
      source: this.source,
      modified: this.modified,
    }
  }

  // Get a hash of this note
  hash(): string {
    return fastHash([this.note, this.start, this.end, this.lat, this.lng].join(''))
  }

  isValid(): boolean {
    return this.note.length > 0 || this.lat || this.lng ? true : false
  }

  calculateScore(knownTrackers?: ITrackers): number {
    return ScoreNote(this.note, this.end, knownTrackers)
  }

  setScore(score): void {
    this.score = score
  }

  // add a tag to the note
  addTag(tag, value): this {
    if (value) {
      this.note = `${this.note} #${tag}(${value})`
    } else {
      this.note = `${this.note} #${tag}`
    }
    this.getMeta()
    return this
  }

  get geoType(): GeoType {
    return {
      lat: this.lat,
      lng: this.lng,
      name: this.location,
    }
  }

  // Does it have a specific  tracker?
  hasTracker(trackerTag): boolean {
    if (!this.trackers) {
      this.getMeta()
    }
    return this.trackers.find((trackerElement) => trackerElement.id == trackerTag) ? true : false
  }

  getTrackerValues(trackerTag): Array<any> {
    return this.trackers
      .filter((trackerElement) => trackerElement.id == trackerTag)
      .map((trackerElement) => {
        return trackerElement.value
      })
  }

  // Get note length without tags
  noteTextLength() {
    return this.getScrubbedNote().length
  }

  getScrubbedNote() {
    let results = this.note
      .split(' ')
      .filter((word) => {
        if (word.length > 1 && word.substr(0, 1) == '#') {
          return false
        } else {
          return true
        }
      })
      .join(' ')

    return results
  }

  // Expand for more data
  expand() {
    return this.expanded()
  }

  expanded() {
    return Object.assign(this, {
      tokens: extractor.parse(this.note),
      duration: this.end.getTime() - this.start.getTime(),
      startDate: new Date(this.start),
      endDate: new Date(this.end),
    })
  }

  /**
   * It takes a tracker tag and a calculation method (sum or average) and returns the sum or average of
   * all the values of the tracker with that tag
   * @param {string} trackerTag - The tag of the tracker you want to get the value of.
   * @param [calculateBy=sum] - 'sum' or 'average'
   * @returns The value of the tracker with the given tag.
   */
  getTrackerValue(trackerTag: string, calculateBy = 'sum') {
    let values = this.getMeta()
      .trackers.filter((t) => t.id == trackerTag)
      .map((token) => parseFloat(`${token.value}`))
    
    if (calculateBy == 'sum') {
      return math.round(math.sum(values))
    } else {
      return math.round(math.average(values))
    }
  }

  /**
   * It takes a list of tokens, and returns a list of trackables
   * @param {ITrackables} allTrackables - ITrackables = {}
   * @returns An array of trackables.
   */
  getTrackables(allTrackables: ITrackables = {}): Array<Trackable> {
    const items = this.getMeta()
    const trackables: Array<Trackable> = []
    items.trackers.forEach((trackerTE: Token) => {
      let trackable = tokenToTrackable(trackerTE, allTrackables);
      trackables.push(new Trackable(trackable))
    })
    items.people.forEach((personTE: Token) => {
      trackables.push(tokenToTrackable(personTE, allTrackables))
    })
    items.context.forEach((contextTE: Token) => {
      trackables.push(tokenToTrackable(contextTE, allTrackables))
    })
    return trackables.filter((t) => t)
  }

  getMeta() {
    let tokens = extractor.parse(this.note)
    return Object.assign(this, {
      duration: this.end.getTime() - this.start.getTime(),
      startDate: dayjs(this.start),
      endDate: dayjs(this.end),
      people: tokens.filter((te) => te.type == 'person'),
      context: tokens.filter((te) => te.type == 'context'),
      trackers: tokens.filter((te) => te.type == 'tracker'),
    })
  }
}

export default NLog
