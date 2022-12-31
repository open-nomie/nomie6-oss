import type { Trackable, TrackableTypes } from '../Trackable.class'

import TrackableSelectorModal from './trackable-selector-modal.svelte'
import { openModal } from '../../../components/backdrop/BackdropStore2'
import { wait } from '../../../utils/tick/tick'
import { writable } from 'svelte/store'

export type TrackableSelectorProps = {
  multiple?: boolean
  onSelect?: Function
  type?: TrackableTypes
}

export const TrackableSelectorStore = writable<TrackableSelectorProps | undefined>()

/**
 * It opens a modal with a component called `TrackableSelectorModal` and passes it a prop called
 * `payload` with the value of the `options` argument
 * @param {TrackableSelectorProps} options - TrackableSelectorProps = {}
 */
export const openTrackableSelector = (options: TrackableSelectorProps = {}) => {
  openModal({
    id: `trackable-selector`,
    position: 'fullscreen',
    component: TrackableSelectorModal,
    componentProps: {
      payload: options,
    },
  })
}

/**
 * It updates the `TrackableSelectorStore` with `undefined`
 */
export const closeTrackableSelector = () => {
  TrackableSelectorStore.update((s) => undefined)
}

/**
 * It opens a trackable selector, waits for the user to select a trackable, and then returns the
 * selected trackable
 * @param {TrackableTypes | undefined} [type] - The type of trackable you want to select.
 * @param {boolean} [multiple=true] - boolean = true
 * @returns An array of trackables
 */
export const selectTrackables = async (
  type?: TrackableTypes | undefined,
  multiple: boolean = true
): Promise<Array<Trackable>> => {
  return new Promise((resolve) => {
    openTrackableSelector({
      multiple: multiple,
      type,
      onSelect: async (trackables: Array<Trackable>) => {
        resolve(trackables)
        await wait(200)
      },
    })
  })
}

/**
 * It returns the first trackable of the given type, or undefined if there are none
 * @param {TrackableTypes | undefined} [type] - The type of trackable you want to select.
 * @returns An array of trackables
 */
export const selectTrackable = async (type?: TrackableTypes | undefined) => {
  const trackables = await selectTrackables(type, false)
  if (trackables.length) {
    return trackables[0]
  }
  return undefined
}
