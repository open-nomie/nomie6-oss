import extractor from '../../utils/extract/extract'
import Tracker from './TrackerClass'
import type TrackerClass from './TrackerClass'
import type { ITrackers } from '../import/import'
import is from '../../utils/is/is'
import { useTrackerInputModal } from '../../domains/tracker/input/TrackerInputStore'

export type ITrackerInputerGetOptions = {
  value?: number
  allowSave?: boolean
}
export type ITrackerInputResult = {
  suffix?: string
  tracker?: TrackerClass
  value?: number
  action?: string
  raw?: string
  expandNote?: boolean
}
/**
 * Tracker Input
 * This is a main method for collecting details on a specific tracker, or group of trackers
 */

export default class TrackerInputer {
  tracker: TrackerClass
  value: number
  listeners: {
    cancel: Array<Function>
    value: Array<Function>
  }
  lastAction: string
  trackers: ITrackers
  allowSave: boolean
  open: Function
  /**
   * Constructor
   * Pass in tracker and the tracker store $ object
   */
  constructor(tracker, trackers: ITrackers, options: any = {}) {
    this.tracker = tracker
    this.value = 0
    this.listeners = {
      cancel: [],
      value: [],
    }
    this.trackers = trackers
    this.allowSave = options.allowSave || false
    throw new Error('This is deprecated! Replace it')
  }
  // Listeners
  on(type: string, func: Function): void {
    if (this.listeners[type].indexOf(func) == -1) {
      this.listeners[type].push(func)
    }
  }
  // Firing listeners
  fire(type: string): void {
    this.listeners[type].forEach((func) => {
      func(this)
    })
  }

  async getTrackerInputAsString(
    tracker: TrackerClass,
    value?: number,
    allowSave: boolean = false
  ): Promise<ITrackerInputResult> {
    return new Promise(async (resolve) => {
      const response: ITrackerInputResult = await this.open({
        tracker,
        trackers: this.trackers,
        value,
        allowSave: allowSave || this.allowSave,
      })
      if (response && response.tracker) {
        resolve({
          raw: `#${response.tracker.tag}(${response.value}) ${response.suffix || ''}`,
          action: response.action,
          tracker: response.tracker,
          value: response.value,
        })
      } else {
        resolve(null)
      }
    })
  }

  /**
   * Get Note as String
   * Used mainly in the auto complete to select a tracker and insert it's value into a note
   */
  async getNoteString() {
    let note = []
    let input: string | ITrackerInputResult
    // Ticks - check for default

    if (this.tracker.type === 'tick') {
      let content = `#${this.tracker.tag}`
      if (this.tracker.default) {
        content = `${content}(${this.tracker.default})`
      }
      note.push(content)
      // } else if (this.tracker.type === "note") {
      //   input = await this.getNoteTrackerInputAsString(this.tracker);
      //   note.push(input);
    } else {
      input = await this.getTrackerInputAsString(this.tracker)
      let noteContent = input.raw
      note.push(noteContent)
    }
    // If this tracker has an Include - let's do it.
    if (this.tracker.include) {
      if (input && typeof input !== 'string') {
        note.push(this.tracker.include.replace('*', `${input?.value || '0'}`))
      }
    }
    return note.join(' ')
  }

  async getTrackerInput(tracker: TrackerClass, options: ITrackerInputerGetOptions): Promise<ITrackerInputResult> {
    let input: ITrackerInputResult = await this.open({
      ...{ tracker },
      ...{ trackers: this.trackers },
      ...options,
    })
    if (input.action) {
      this.lastAction = input.action
    }
    return input
  }

  async getElements(options: ITrackerInputerGetOptions = {}): Promise<Array<string>> {
    return new Promise(async (resolve, reject) => {
      const note = []

      options = options || { value: null }

      let defaultValue: number = is.truthy(options.value) ? options.value : this.tracker.default

      if (this.tracker.type === 'tick') {
        // Make sure
        note.push(`#${this.tracker.tag}${`${defaultValue || ''}`.length ? `(${defaultValue})` : ``}`)
        // Check for include
        if (this.tracker.include) {
          note.push(this.tracker.getIncluded(defaultValue))
        }
        /**
         * Note Tracker Types
         * These might require multiple input popups
         * loop through the note, get tracker values, add people and context
         */
      } else if (this.tracker.type == 'note') {
        // Get values as a string
        let results = await this.getTrackerInputAsString(this.tracker)
        // let results = await this.getNoteTrackerInputAsString(this.tracker);
        // If results - push it.
        if (results) {
          note.push(results.raw)
        }
        // If include, push it too
        if (this.tracker.include) {
          note.push(this.tracker.getIncluded(1))
        }
      } else {
        /**
         * All Other Trackers
         * Catch all for other tracker inputs
         */
        let results: ITrackerInputResult = await this.getTrackerInput(this.tracker, {
          value: defaultValue,
          allowSave: true,
        })
        if (results) {
          // Push results
          if (results.tracker.type == 'picker') {
            // Ignore zero results from the picker type
            note.push(`#${results.tracker.tag}${results.value ? `(${results.value})` : ``}`)
          } else {
            note.push(`#${results.tracker.tag}${is.truthy(results.value) ? `(${results.value})` : ``}`)
          }
          // If there's an include
          if (this.tracker.include) {
            note.push(this.tracker.getIncluded(is.truthy(results.value) ? results.value : 1))
          }
          // If there's a suffix
          if (results.suffix) {
            note.push(results.suffix)
          }
        }
      }
      resolve(note)
    })
  }
}
