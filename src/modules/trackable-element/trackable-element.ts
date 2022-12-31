/**
 * * What's a trackable element?
 *
 * Trackable Element - are elements within a Nomie Data Note
 * that is parsed out and used for stats or other UX
 * things (like clickable links)
 *
 * Trackable - a Trackable is the high level object that wraps a Person, a Tracker or a Context.
 * Trackables are then passed around without having to always determine the type of thing we're tracking
 * - people, context, and trackers for examples
 *
 * Future Trackables might be location, and lifemarker
 */

import snakeCase from '../../utils/snake-case/snake-case'
import stringToValue from '../../utils/string-to-value/string-to-value'
// import extractor from '../../utils/extract/extract'
import type { ITracker } from '../tracker/TrackerClass'
import Person from '../../domains/people/Person.class'
import type { ITrackables } from '../../domains/ledger/ledger-tools'
import TrackerClass from '../tracker/TrackerClass'
import { Trackable } from '../../domains/trackable/Trackable.class'
// import { strToTokens } from '../tokenizer/lite'

export type ITrackableElementType = 'tracker' | 'person' | 'context' | 'generic' | 'line-break' | 'link'
export interface ITrackableElement {
  id?: string
  type?: ITrackableElementType
  raw?: string
  value?: any
  prefix?: any
  remainder?: any
  obj?: any
  getPrefix?: any
  toSearchTerm?: any
}

// export function toElement(str: string): TrackableElement | undefined {
//   const tokens = strToTokens(str)
//   return tokens.length ? tokens[0] : undefined
// }

export default class TrackableElement {
  id?: string
  type?: ITrackableElementType
  raw?: string
  value?: any
  prefix?: any
  remainder?: any
  obj?: ITracker | Person | TrackerClass

  constructor(starter: ITrackableElement) {
    if (typeof starter == 'object') {
      this.id = starter.id // brandon of @brandon, meet of #meet, home of +home
      this.type = starter.type // tracker, person, context
      this.raw = starter.raw // the raw string
      this.value = starter.value // any value passed or 1
      this.prefix = starter.prefix // @ # or +
      this.remainder = starter.remainder // holder of any characters after this
      this.obj = starter.obj // holder of related things
    }

    // Lowercase the ID no matter what
    if (this.id) {
      this.id = this.id.toLowerCase().trim()
    }

    // if type but no prefix, set the prefix
    if (this.type && !this.prefix) {
      this.prefix = this.getPrefix()
    }
    // If no raw set, set it
    if (this.type && this.id && !this.raw) {
      this.raw = `${this.prefix}${this.id}`
    }
    if (this.raw && !this.id) {
      this.id = snakeCase(this.raw)
      switch (this.raw.substr(0, 1)) {
        case '#':
          this.prefix = '#'
          this.type = 'tracker'
          // See if there's a value provided as in #tracker(value)
          let valueSplit: Array<any> = this.raw.split('(')
          if (valueSplit.length == 2) {
            // Convert it to a number.
            this.value = stringToValue(valueSplit[1].replace(')', ''))
          }
          break
        case '+':
          this.prefix = '+'
          this.type = 'context'
          break
        case '@':
          this.prefix = '@'
          this.type = 'person'
          break
      }
    }
  }

  /**
   * Converts tracker, people and context trackable elements into a Trackable
   * @param trackables
   * @returns
   */
  toTrackable(trackables: ITrackables = {}): Trackable | undefined {
    if (['tracker', 'person', 'context'].indexOf(this.type) > -1) {
      // Get Trackables as Array
      let found: Trackable | undefined = trackables[this.toTrackableId()]

      // If Found - return the trackable
      if (found) return found

      // If not found - let's build one
      if (!found) {
        // Is it a tracker?
        if (this.type === 'tracker') {
          // Create a generic tracker for this #tag
          const tracker = new TrackerClass({
            tag: `${this.prefix}${this.id}`,
          })
          // Extract the trackable
          found = tracker.toTrackable()
          // Set value from trackable Element
          found.value = this.value

          // If it's a person!
        } else if (this.type === 'person') {
          // Create a person using their username
          const person = new Person({ username: `${this.id}` })
          // Extract and return the trackable
          found = person.toTrackable()
          // If its contenxt
        } else if (this.type === 'context') {
          // Create a new context trackable
          found = new Trackable({ type: 'context', context: this.id })
          // Pass a value - this is for a new feature
          found.value = this.value

          // Return trackable
        }
      }
      return found
    } else {
      return undefined
    }
  }

  public getPrefix(type?: string): string {
    type = type || this.type
    switch (type) {
      case 'tracker':
        return '#'

      case 'person':
        return '@'

      case 'context':
        return '+'

      default:
        return ''
    }
  }

  public toSearchTerm(): string {
    return `${this.prefix}${this.id}`
  }

  public toTrackableId(): string {
    return this.toSearchTerm()
  }
}
