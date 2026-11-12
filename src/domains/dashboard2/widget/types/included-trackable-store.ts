import { writable } from 'svelte/store'
import type { Trackable } from '../../../trackable/Trackable.class'

// Store to track which trackable is currently included in a chart widget
// Key is widget ID, value is the included trackable
export const IncludedTrackableStore = writable<Map<string, Trackable>>(new Map())

export const setIncludedTrackable = (widgetId: string, trackable: Trackable | undefined) => {
  IncludedTrackableStore.update((map) => {
    if (trackable) {
      map.set(widgetId, trackable)
    } else {
      map.delete(widgetId)
    }
    return map
  })
}

export const getIncludedTrackable = (widgetId: string) => {
  let result: Trackable | undefined
  IncludedTrackableStore.subscribe((map) => {
    result = map.get(widgetId)
  })()
  return result
}
