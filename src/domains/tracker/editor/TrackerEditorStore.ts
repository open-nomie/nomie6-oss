import TrackerClass from '../../../modules/tracker/TrackerClass'
import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

import math from '../../../utils/math/math'
import { getGroupedUoms } from '../../uom/uom-utils'

type TrackerEditorType = {
  tracker?: TrackerClass
  onComplete?: Function
  showEditor?: boolean
  options?: EditorOptionProps
}

export const TrackerEditorStore: Writable<TrackerEditorType> = writable({
  tracker: undefined,
})

export const closeTrackerEditor = () => {
  TrackerEditorStore.update((s) => {
    s.showEditor = false
    s.tracker = undefined
    s.onComplete = undefined
    s.options = {}
    return s
  })
}

type EditorOptionProps = {
  onSave?: Function
  onComplete?: Function
}

export const openTrackerEditor = (
  tracker?: TrackerClass,
  editorOptions: EditorOptionProps = {}
): Promise<TrackerClass> => {
  return editTracker(tracker, editorOptions)
}

export const editTracker = (tracker?: TrackerClass, editorOptions: EditorOptionProps = {}): Promise<TrackerClass> => {
  tracker =
    tracker ||
    new TrackerClass({
      emoji: randomEmojis[math.random_range(0, randomEmojis.length - 1)],
    })
  return new Promise((resolve, reject) => {
    TrackerEditorStore.update((s) => {
      s.tracker = tracker
      s.showEditor = true
      s.options = editorOptions
      s.onComplete = (trk) => {
        if (editorOptions.onComplete) editorOptions.onComplete(trk)
        resolve(trk)
      }
      return s
    })
  })
}

export const groupedUOM = getGroupedUoms()

export const randomEmojis: Array<string> = [
  '😂',
  '❤️',
  '🥳',
  '🍦',
  '🌞',
  '🍹',
  '🎱',
  '😎',
  '🥫',
  '🍲',
  '🍩',
  '🐕',
  '🌵',
  '📗',
  '🏈',
  '🌸',
]

export const randomEmoji = (): string => {
  return math.random(randomEmojis)
}
