import Person from '../people/Person.class'
import type { Token } from '../../modules/tokenizer/lite'
import { Trackable } from './Trackable.class'

import TrackerClass from '../../modules/tracker/TrackerClass'
import downloader from '../../modules/download/download'
import { parseNumber } from '../../utils/parseNumber/parseNumber'
import snakeCase from 'lodash/snakeCase'
import { strToToken } from '../../modules/tokenizer/lite'

export type TrackableVisualType = {
  emoji?: string
  avatar?: string
  color?: string
  label?: string
}

export type ITrackables = {
  [key: string]: Trackable
}

/**
 * Converts iTrackables into an Array
 * @param trackables
 * @returns
 */
export const toTrackableArray = (trackables: ITrackables): Array<Trackable> => {
  return Object.keys(trackables).map((key) => {
    const trackable = trackables[key]
    trackable.id = trackable.tag
    return trackable
  })
}

/**
 * Converts a Trackable into a Token
 * @param trackable
 * @returns
 */
export const trackableToToken = (trackable: Trackable): Token => {
  let id: string
  switch (trackable.type) {
    case 'tracker':
      id = trackable.id.replace('#', '')
      break
    case 'person':
      id = trackable.id.replace('@', '')
      break
    case 'context':
      id = trackable.id.replace('+', '')
      break
  }
  const token: Token = {
    id,
    type: trackable.type,
    value: trackable.value,
    raw: trackable.tag,
    prefix: trackable?.tag.substring(0, 1),
  }
  return token
}

/**
 * Converts a String to a trackable
 * @param str
 * @param known
 * @returns
 */
export const strToTrackable = (str: string, known: ITrackables): Trackable | undefined => {
  const token: Token = strToToken(str)
  if (token) {
    const trackable: any = {
      value: token.value,
    }
    // See if the trackable exists in the provided known iTrackable
    const foundTrackable = toTrackableArray(known).find((t: Trackable) => t.id === `${token.prefix}${token.id}`)
    if (foundTrackable) {
      foundTrackable.value = parseNumber(token.value)
      return foundTrackable
    }
    // If not found
    if (token.type === 'tracker') {
      trackable.type = 'tracker'
      trackable.tracker = new TrackerClass({ tag: token.id })
    } else if (token.type === 'person') {
      trackable.type = 'person'
      trackable.id = str
      trackable.person = new Person({ username: token.id })
    } else if (token.type === 'context') {
      trackable.type = 'context'
      trackable.context = token.id
    }
    const finalTrackable = new Trackable(trackable)
    if (trackable.value && trackable.value > 1 && trackable.type == 'tracker') {
      finalTrackable.tracker.type = 'value'
    }
    return finalTrackable
  } else {
    return undefined
  }
}

/**
 * It takes a Trackable and returns a TrackableVisualType
 * @param {Trackable} trackable - Trackable - this is the trackable object that is passed in from the
 * parent component.
 * @returns An object with the following properties:
 *   color: string
 *   emoji: string
 *   avatar: string
 *   label: string
 */
export const getTrackableVisuals = (trackable: Trackable): TrackableVisualType => {
  return {
    color: trackable.color,
    emoji: trackable.emoji,
    avatar: trackable.avatar,
    label: trackable.label,
  }
}

/**
 * It takes a string, removes any `@` or `+#` characters, trims the string, replaces any
 * non-alphanumeric characters with `_`, and then converts the string to lowercase
 * @param {string} str - The string to convert to a tag-safe string.
 * @returns A string that is safe to use as a tag.
 */
export const strToTagSafe = (str: string) => {
  return str
    .replace(/(\@|\+\#)/gi, '')
    .trim()
    .replace(/[^A-Z0-9]/gi, '_')
    .toLowerCase()
}

/**
 * It takes a trackable and a set of visuals, and returns a new trackable with the visuals applied
 * @param {Trackable} _trackable - The trackable object you want to set the visuals for.
 * @param {TrackableVisualType} visuals - {
 * @returns A Trackable object
 */
export const setTrackableVisuals = (_trackable: Trackable, visuals: TrackableVisualType): Trackable => {
  const trackable = new Trackable(_trackable)
  if (trackable.type === 'context') {
    if (visuals.hasOwnProperty('color')) trackable.ctx.color = visuals.color
    if (visuals.hasOwnProperty('emoji')) trackable.ctx.emoji = visuals.emoji
    if (visuals.hasOwnProperty('avatar')) trackable.ctx.avatar = visuals.avatar
    if (visuals.hasOwnProperty('label')) trackable.ctx.label = visuals.label
  } else if (trackable.type === 'person') {
    if (visuals.hasOwnProperty('color')) trackable.person.color = visuals.color
    if (visuals.hasOwnProperty('emoji')) trackable.person.emoji = visuals.emoji
    if (visuals.hasOwnProperty('avatar')) trackable.person.avatar = visuals.avatar
    if (visuals.hasOwnProperty('label')) trackable.person.displayName = visuals.label
  } else if (trackable.type === 'tracker') {
    if (visuals.hasOwnProperty('color')) trackable.tracker.color = visuals.color
    if (visuals.hasOwnProperty('emoji')) trackable.tracker.emoji = visuals.emoji
    if (visuals.hasOwnProperty('avatar')) trackable.tracker.avatar = visuals.avatar
    if (visuals.hasOwnProperty('label')) trackable.tracker.label = visuals.label
  }

  return trackable
}

/**
 * It takes an array of trackables and a version number, and then downloads a JSON file containing the
 * trackables and the version number
 * @param trackables - Array<Trackable>
 * @param {string} [appVersion=6.0.0] - The version of the app that created the trackables.
 */
export const downloadTrackables = (trackables: Array<Trackable>, appVersion: string = '6.0.0') => {
  let pkg = {
    type: 'trackables',
    trackables: trackables,
    created: new Date(),
    version: appVersion, // TODO figure out how to do this without meta
  }
  downloader.text(
    `${snakeCase(trackables.map((t) => t.label).join('-')).toLowerCase()}.trackables.json`,
    JSON.stringify(pkg)
  )
}
