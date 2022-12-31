import { writable } from 'svelte/store'
import { wait } from '../../utils/tick/tick'
import dayjs, { Dayjs } from 'dayjs'
import { Trackable } from '../trackable/Trackable.class'
import { strToTrackable } from '../trackable/trackable-utils'
import { trackEvent } from '../usage/stat-ping'

type StatsStoreState = {
  trackable: undefined | Trackable
  showModal: boolean
  date: Dayjs
}

function createStatsStore() {
  const stateBase: StatsStoreState = {
    trackable: undefined,
    showModal: false,
    date: dayjs(),
  }
  const { subscribe, set, update } = writable(stateBase)

  return {
    subscribe,
    update,
  }
}

/**
 * Main Export
 */
export const StatsStore = createStatsStore()

/**
 * Open the Stats Modal
 * @param ele
 * @param date
 */
export const openStats = async (trackable: Trackable | string, date?: Dayjs) => {
  // Convert either string or trackable to trackable
  const element: Trackable = trackable instanceof Trackable ? trackable : strToTrackable(trackable, {})
  // Update the state
  StatsStore.update((s: StatsStoreState) => {
    s.trackable = element
    if (date) {
      s.date = date
    }
    return s
  })
  trackEvent('open_stats')
  // Give time for ui to do Animation
  await wait(300)
  StatsStore.update((s) => {
    s.showModal = true
    return s
  })
}

/**
 * Clear the Stats Store close Modal
 */
export const closeStats = async () => {
  StatsStore.update((s) => {
    s.showModal = false
    return s
  })
  // Give time for ui to do Animation
  await wait(300)
  StatsStore.update((s) => {
    s.trackable = undefined
    return s
  })
}

export const setStatsDate = (date: Dayjs) => {
  StatsStore.update((s) => {
    s.date = date
    return s
  })
}
