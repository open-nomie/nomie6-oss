import type { ITrackerType } from '../tracker/TrackerClass'
import { Lang } from '../../store/lang'

export type TrackerTypeConfig = {
  emoji: string
  label: string
  description: string
  id?: ITrackerType
}

export type TrackerTypesConfig = {
  [type: string]: TrackerTypeConfig
}

const types: TrackerTypesConfig = {
  tick: {
    id: 'tick',
    emoji: '☝️',
    label: Lang.t('tracker.type.simple', 'Tally'),
    description: Lang.t(
      'tracker.type.simple_description',
      `Tally each time it's used. Good for: pooped, gluten, made bed, showered.`
    ),
  },
  value: {
    id: 'value',
    emoji: '🔢',
    label: Lang.t('tracker.type.value', 'Value'),
    description: Lang.t('tracker.type.value_description', 'Good for tracking fluids, medicines, distance'),
  },
  range: {
    id: 'range',
    emoji: '🎚',
    label: Lang.t('tracker.type.range', 'Range'),
    description: Lang.t(
      'tracker.type.range_description',
      'Select from a range like 1-10. Good for Mood, Anxiety, Stress'
    ),
  },
  picker: {
    id: 'picker',
    emoji: '✅',
    label: Lang.t('tracker.type.picker', 'Pick List'),
    description: Lang.t(
      'tracker.type.picker_description',
      'Create a pick list of anything. Including #trackers, @people and +context'
    ),
  },
  timer: {
    id: 'timer',
    emoji: '⏲',
    label: Lang.t('tracker.type.timer', 'Timer'),
    description: Lang.t('tracker.type.timer_description', 'Track how long things take.'),
  },
  note: {
    id: 'note',
    emoji: '🎳',
    label: Lang.t('tracker.type.note', 'Combo'),
    description: Lang.t('tracker.type.note_description', 'Track multiple trackers at a time'),
  },
}

export function getTypeDetails(type: string): TrackerTypeConfig | undefined {
  if (types[type]) {
    return types[type]
  } else {
    return undefined
  }
}

export default types
