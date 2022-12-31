import type { ITrackables } from '../../domains/ledger/ledger-tools'

import { parseNumber } from '../../utils/parseNumber/parseNumber'
import Person from '../../domains/people/Person.class'
import TrackerClass from '../tracker/TrackerClass'
import type { Token } from './lite'
import { ContextClass } from '../../domains/context/context-class'
import type { Trackable } from '../../domains/trackable/Trackable.class'

export const tokenToTag = (token: Token, includeValue: boolean = false): string => {
  if(includeValue && token.value) {
    return `${token.prefix}${token.id}(${token.value})`
  } else {
    return `${token.prefix}${token.id}`
  }
}

export const tokenToTrackable = (token: Token, knownTrackables: ITrackables = {}): Trackable | undefined => {
  if (['tracker', 'person', 'context'].indexOf(token.type) > -1) {
    // Get Trackables as Array
    const key = `${token.prefix}${token.id}`
    let found: Trackable | undefined = knownTrackables[key]
    // If Found - return the trackable
    if (found) {
      found.value = parseNumber(token.value)
      if(token.type == 'tracker' && found.value !== 1) {
        // TODO: This is getting passed up to the 
        // TrackableStore some how... 
        // found.tracker.default = found.value;
        
      }
      return found
    }

    // If not found - let's build one
    if (!found) {
      // Is it a tracker?
      if (token.type === 'tracker') {
        // Create a generic tracker for this #tag
        const tracker = new TrackerClass({
          tag: key,
        })
        // Extract the trackable
        found = tracker.toTrackable()
        // Set value from trackable Element
        found.value = token.value ? parseNumber(`${token.value}`) : NaN
        found.tracker.default = found.value;
        // If it's a person!
      } else if (token.type === 'person') {
        // Create a person using their username
        const person = new Person({ username: `${token.id}` })
        // Extract and return the trackable
        found = person.toTrackable()
        // If its contenxt
      } else if (token.type === 'context') {
        // Create a new context trackable
        found = new ContextClass({ tag: token.id, label: token.id }).toTrackable()
        // Pass a value - this is for a new feature
        found.value = token.value ? parseNumber(`${token.value}`) : NaN

        // Return trackable
      }
    }

    return found
  } else {
    return undefined
  }
}
