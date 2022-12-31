import type { Trackable } from '../Trackable.class'
import TrackableVisualModal from './trackable-visual-modal.svelte'
import { openModal } from '../../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import type { TrackableVisualType } from '../trackable-utils'

type TrackableVisualStoreType = {
  trackable: Trackable
  onComplete: Function
  onCancel: Function
}

export const TrackableVisualStore = writable<TrackableVisualStoreType | undefined>(undefined)

export const closeTrackableVisuals = () => {
  TrackableVisualStore.update((s) => undefined)
}

export const openTrackableVisuals = async (trackable: Trackable): Promise<TrackableVisualType | undefined> => {
  return new Promise((resolve) => {
    openModal({
      id: `trackable-visual-${encodeURIComponent(trackable.tag)}`,
      component: TrackableVisualModal,
      componentProps: {
        trackable,
        onComplete(res: TrackableVisualType) {
          resolve(res)
        },
        onCancel() {
          resolve(undefined)
        },
      },
    })
    // TrackableVisualStore.update((s) => {
    //   return {
    //     trackable: trackable,
    //     onComplete(res: TrackableVisualType) {
    //       resolve(res)
    //     },
    //     onCancel() {
    //       resolve(undefined)
    //     },
    //   }
    // })
  })
}
