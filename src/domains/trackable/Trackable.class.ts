import { ContextClass } from '../context/context-class'
import { strToColor } from '../../components/dymoji/dymoji'
import isNumber from 'lodash/isNumber'
import math from '../../utils/math/math'
import Person from '../people/Person.class'
import TrackerClass from '../../modules/tracker/TrackerClass'
import is from '../../utils/is/is'
import { parseNumber } from '../../utils/parseNumber/parseNumber'


export type TrackableTypes = 'person' | 'tracker' | 'context'

/**
 * `TrackableType` is an object with a `type` property that is a `TrackableTypes` enum, and an optional
 * `id` property that is a string, and an optional `person` property that is a `Person` type, and an
 * optional `tracker` property that is a `TrackerClass`, and an optional `context` property that is a
 * string, and an optional `ctx` property that is a `ContextClass`, and an optional `value` property
 * that is a number.
 * @property {TrackableTypes} type - The type of trackable. This can be one of the following:
 * @property {string} id - The id of the trackable.
 * @property {Person} person - The person who is being tracked.
 * @property {TrackerClass} tracker - The tracker instance that is tracking this trackable.
 * @property {string} context - The context of the trackable.
 * @property {ContextClass} ctx - The context in which the trackable is being tracked.
 * @property {number} value - The value of the trackable.
 */
export type TrackableType = {
  type: TrackableTypes
  id?: string
  person?: Person
  tracker?: TrackerClass
  context?: string
  ctx?: ContextClass
  value?: number
}

/* `Trackable` is a class that represents a `Person`, `Tracker`, or `Context` and is used to track a
value */
export class Trackable {
  type: TrackableTypes
  id: string
  person?: Person
  tracker?: TrackerClass
  context?: string
  ctx?: ContextClass
  value?: number

  constructor(starter: TrackableType) {
    this.type = starter.type
    if (starter.type == 'tracker') {
      this.tracker = starter.tracker instanceof TrackerClass ? starter.tracker : new TrackerClass(starter.tracker)
      this.id = starter.id || `#${(this.tracker || {}).tag}`
    } else if (starter.type === 'person') {
      this.person = starter.person
        ? starter.person instanceof Person
          ? starter.person
          : new Person(starter.person)
        : undefined
      this.id = starter.id || `@(this.person || {}).username`
    } else if (starter.type === 'context') {
      this.context = starter.context
      this.id = starter.id
      this.ctx = new ContextClass(starter.ctx || this.context)
    }
    this.value = starter.value
  }

  /**
   * It returns the label of the object.
   * @returns The label of the tracker, person, or context.
   */
  get label(): string {
    switch (this.type) {
      case 'tracker':
        return `${this.tracker.label || ''}`
      case 'person':
        return `${this.person.displayName || ''}`
      case 'context':
        return `${this.ctx.label || ''}`
    }
  }

  /**
   * It returns a string based on the type of the object
   * @returns The prefix of the tag.
   */
  get prefix(): string {
    switch (this.type) {
      case 'tracker':
        return `#`
      case 'person':
        return `@`
      case 'context':
        return `+`
      default:
        return ''
    }
  }

  /**
   * If the type of the object is a tracker, then set the avatar of the tracker to the source. If the
   * type of the object is a person, then set the avatar of the person to the source. If the type of
   * the object is a context, then set the avatar of the context to the source
   * @param {string} src - The URL of the image to use as the avatar.
   */
  set avatar(src: string) {
    if (this.type == 'tracker') {
      this.tracker.avatar = src
    } else if (this.type == 'person') {
      this.person.avatar = src
    } else if (this.type == 'context') {
      this.ctx.avatar = src
    }
  }

  /**
   * If the type of the object is a tracker, then set the emoji of the tracker to the source. If the
   * type of the object is a person, then set the emoji of the person to the source. If the type of the
   * object is a context, then set the emoji of the context to the source
   * @param {string} src - The source of the emoji.
   */
  set emoji(src: string) {
    if (this.type == 'tracker') {
      this.tracker.emoji = src
    } else if (this.type == 'person') {
      this.person.emoji = src
    } else if (this.type == 'context') {
      this.ctx.emoji = src
    }
  }

  /**
   * If the type of the object is a tracker, then set the tag of the tracker to the value of the src
   * parameter. If the type of the object is a person, then set the username of the person to the value
   * of the src parameter. If the type of the object is a context, then set the tag of the context to
   * the value of the src parameter
   * @param {string} src - The source of the image.
   */
  set tag(src: string) {
    if (this.type == 'tracker') {
      this.tracker.tag = src
    } else if (this.type == 'person') {
      this.person.username = src
    } else if (this.type == 'context') {
      this.ctx.tag = src
    }
  }

  /**
   * If the type of the object is a tracker, then set the label of the tracker to the value of the src
   * parameter. If the type of the object is a person, then set the displayName of the person to the
   * value of the src parameter. If the type of the object is a context, then set the label of the
   * context to the value of the src parameter
   * @param {string} src - The source of the data.
   */
  set label(src: string) {
    if (this.type == 'tracker') {
      this.tracker.label = src
    } else if (this.type == 'person') {
      this.person.displayName = src
    } else if (this.type == 'context') {
      this.ctx.label = src
    }
  }

  /**
   * If the type of the object is a tracker, then set the color of the tracker to the color passed in.
   * If the type of the object is a person, then set the color of the person to the color passed in. If
   * the type of the object is a context, then set the color of the context to the color passed in
   * @param {string} src - The source of the image.
   */
  set color(src: string) {
    if (this.type == 'tracker') {
      this.tracker.color = src
    } else if (this.type == 'person') {
      this.person.color = src
    } else if (this.type == 'context') {
      this.ctx.color = src
    }
  }

  /**
   * If the type is tracker, return the avatar of the tracker, if the type is person, return the avatar
   * of the person, if the type is context, return the avatar of the context, otherwise return
   * undefined
   * @returns The avatar of the object.
   */
  get avatar(): string | undefined {
    if (this.type == 'tracker') {
      return this.tracker.avatar
    } else if (this.type == 'person') {
      return this.person.avatar
    } else if (this.type == 'context') {
      return this.ctx.avatar
    }
    return undefined
  }

  /**
   * If the type is tracker, return the tracker's emoji. If the type is person, return the person's
   * emoji. If the type is context, return the context's emoji. Otherwise, return undefined
   * @returns The emoji of the object
   */
  get emoji(): string | undefined {
    if (this.type == 'tracker') {
      return this.tracker.emoji
    } else if (this.type == 'person') {
      return this.person.emoji
    } else if (this.type === 'context') {
      return this.ctx.emoji
    }
    return undefined
  }

  /**
   * If the type is tracker, return true if the tracker has a label, type, and tag. If the type is
   * person, return true if the person has a username. If the type is context, return true if the
   * context has a label. Otherwise, return false
   * @returns A boolean value.
   */
  get canSave(): boolean {
    if (this.type == 'tracker') {
      return this.tracker.label && this.tracker.type && this.tracker.tag ? true : false
    } else if (this.type == 'person') {
      return this.person.username ? true : false
    } else if (this.type === 'context') {
      return this.ctx.label ? true : false
    }
    return false
  }

  /**
   * It returns the default value of the current type
   * @returns The default value of the tracker, person, or context.
   */
  get defaultValue(): number {
    switch (this.type) {
      case 'tracker':
        return this.tracker.default !== undefined ? this.tracker.default : 1
      case 'person':
        return 1
      case 'context':
        return 1
    }
  }

  /**
   * It takes a number and an optional boolean, and if the boolean is true, it returns the number with
   * a unit appended to it
   * @param {number} value - The value to be formatted.
   * @param {boolean} [unit] - boolean - If true, the unit will be appended to the value.
   * @returns The value of the tracker.displayValue() function.
   */
  formatValue(value: number, unit?: boolean) {
    if (this.tracker) {
      return this.tracker.displayValue(value, unit)
    }
    return value
  }

  /**
   * It takes an array of numbers, filters out any non-numbers, and then returns the sum of the
   * remaining numbers
   * @param values - Array<number> - the values to tally
   * @returns The sum of the values in the array.
   */
  tallyValues(values: Array<number>): number {
    const filtered = values.filter((v: any) => !isNaN(v))
    if (this.tracker?.math === 'mean') return math.average(filtered)
    return math.sum(filtered)
  }

  /**
   * If the type is tracker, return the tracker's color or a color based on the tracker's tag. If the
   * type is person, return the person's color or a color based on the person's username. If the type
   * is context, return the context's color or a color based on the context's name. Otherwise, return a
   * color based on the item's id
   * @returns The color of the item.
   */
  get color(): string {
    switch (this.type) {
      case 'tracker':
        return this.tracker?.color || strToColor(`#${this.tracker.tag}`)
      case 'person':
        return this.person?.color || strToColor(`@${this.person.username}`)
      case 'context':
        return this.ctx?.color || strToColor(`+${this.context}`)
      default:
        return strToColor(`unknown-${this.id}`)
    }
  }

  /**
   * It returns a string.
   * @param {number} [val] - The value of the note.
   * @returns The tag and value of the note.
   */
  public getNoteValue(val?: number, expand: boolean = true): string {
    const tag = this.tag
    const value = val || this.value || this.defaultValue || NaN
    if(this.type == 'tracker') {
      let parts = [];
      if(!isNaN(value) && is.truthy(value)) {
        parts.push(`${tag}(${value})`)
      } else {
        parts.push(`${tag}`)
      }

      // Should we expand this note with the includes?
      if(expand) {
        parts.push(this.tracker.getIncluded(parseNumber(value)));
      }
      return parts.join(' ');
    } else {
      if (isNumber(value) && this.type !== 'person') return `${tag}(${value})`
    }
    return tag
  }

  /**
   * If the type is tracker, return the tracker's tag, if the type is person, return the person's
   * username, if the type is context, return the context's tag, otherwise return undefined
   * @returns The tag of the object.
   */
  get tag(): string | undefined {
    if (this.type == 'tracker') {
      return this.tracker.tag ? `#${this.tracker.tag}` : undefined
    } else if (this.type == 'person') {
      return this.person.username ? `@${this.person.username}` : undefined
    } else if (this.type === 'context') {
      return this.ctx.tag ? `+${this.ctx.tag}` : undefined
    }
    return undefined
  }

  /**
   * If the value is not defined, return the tag, otherwise return the tag with the value
   * @param {number | string} [v] - the value to be tagged
   * @returns The tagWithValue function is being returned.
   */
  public tagWithValue(v?: number | string) {
    if (!v) return this.tag
    return `${this.tag}(${v})`
  }
}
