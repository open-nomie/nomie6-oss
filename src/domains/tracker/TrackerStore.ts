import { InitTrackableStore } from '../trackable/TrackableStore'
import type { KVStoreState } from '../../store/KVStore'
import NPaths from '../../paths'
import TrackerClass from '../../modules/tracker/TrackerClass'
import { createKVStore } from '../../store/KVStore'
import { derived } from 'svelte/store'

/**
 * Create the Tracker KV Store
 */
export const TrackerStore = createKVStore(NPaths.storage.trackers(), {
  label: 'Trackers',
  key: 'tag',
  itemSerializer: (item: TrackerClass) => {
    return item.asObject
  },
  itemInitializer: (item: any) => {
    return new TrackerClass(item)
  },
})

/**
 * Stop and Start a Timer
 * @param tracker
 * @param ss
 * @returns Promise<TrackerClass>
 */
const startStopTimer = async (tracker: TrackerClass, ss: 'start' | 'stop'): Promise<TrackerClass> => {
  let newTracker;
  await TrackerStore.updateSync((trackerMap) => {
    newTracker = new TrackerClass(trackerMap[tracker.tag])
    newTracker.timeTracked = trackerMap[tracker.tag].timeTracked || newTracker.default
    switch (ss) {
      case 'start':
        newTracker.started = new Date().getTime()
        break
      case 'stop':
        newTracker.timeTracked += (new Date().getTime() - trackerMap[tracker.tag].started)/1000
        newTracker.started = undefined
    }
    trackerMap[tracker.tag] = newTracker
    return trackerMap
  })
  InitTrackableStore()

  return newTracker
}

/**
 * Start a Timer
 * @param tracker
 * @returns Promise<TrackerClass>
 */
export const startTimer = async (tracker: TrackerClass): Promise<TrackerClass> => {
  return await startStopTimer(tracker, 'start')
}

/**
 * Start a Timer
 * @param tracker
 * @returns Promise<TrackerClass>
 */
export const stopTimer = async (tracker): Promise<TrackerClass> => {
  return await startStopTimer(tracker, 'stop')
}

/**
 * Clear a Timer
 * @param tracker
 * @returns Promise<TrackerClass>
 */
export const resetTimer = async (tracker, timeTracked = 0): Promise<TrackerClass> => {
  let newTracker;
  await TrackerStore.updateSync((trackerMap) => {
    newTracker = new TrackerClass(trackerMap[tracker.tag])

    newTracker.timeTracked = timeTracked
    newTracker.started = undefined

    trackerMap[tracker.tag] = newTracker
    return trackerMap
  })
  InitTrackableStore()

  return newTracker
}

/**
 * Find Running Timers in a Map
 * This is just incase we want to reuse it
 * without having to hit the Update
 * @param map
 * @returns
 */
export const findRunningTimersInTrackersMap = (map: KVStoreState) => {
  return Object.keys(map)
    .map((tag) => {
      const tracker: TrackerClass = map[tag]
      return tracker
    })
    .filter((t) => t.started)
}

/**
 * Derived $RunningTimers
 * Generates an array of trackers that are running
 */
export const RunningTimers = derived(TrackerStore, ($TrackerStore) => {
  return findRunningTimersInTrackersMap($TrackerStore)
})

/**
 * Derived $TrackersAsArray
 * Returns the trackers an Array
 */
export const TrackersAsArray = derived(TrackerStore, ($TrackerStore) => {
  return Object.keys($TrackerStore).map((key) => {
    return $TrackerStore[key]
  })
})
