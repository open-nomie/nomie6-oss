/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// utils
import Logger from '../../utils/log/log'
import TrackableLibraryModal from './library-modal.svelte'
import { openModal } from '../../components/backdrop/BackdropStore2'
// Svelte
import { writable } from 'svelte/store'

// Vendors

// Stores

const console = new Logger('📚 Nomie Library')

// Nomie API Store

const TrackerLibInit = () => {
  const { update, subscribe, set } = writable({
    trackers: [],
    show: false,
    first: false,
    activeBundle: null,
  })

  const methods = {
    toggle() {
      update((p) => {
        p.show = !p.show
        p.first = false
        return p
      })
    },
    presentBundle(bundle) {
      update((state) => {
        state.activeBundle = bundle
        return state
      })
    },
    installBundle(bundle) {},
    showFirst() {
      update((p) => {
        p.show = true
        p.first = true
        return p
      })
    },
  }

  return {
    update,
    subscribe,
    set,
    ...methods,
  }
}

export const TrackerLibrary = TrackerLibInit()

export const openTrackableLibrary = (first: boolean = false) => {
  TrackerLibrary.update((p) => {
    p.show = true
    return p
  })
  openModal({
    id: 'trackable-library',
    component: TrackableLibraryModal,
    componentProps: {
      first,
    },
  })
}

export const toggleTrackerLibrary = (first: boolean = false) => {
  TrackerLibrary.update((p) => {
    p.show = !p.show

    p.first = first
    return p
  })
}
