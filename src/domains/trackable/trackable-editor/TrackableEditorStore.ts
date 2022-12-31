import type { Trackable } from '../Trackable.class'
import TrackableEditorModal from '../trackable-editor/trackable-editor-modal.svelte'
import { openModal } from '../../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import { trackEvent } from '../../usage/stat-ping'

export type TrackableEditorStoreProps = {
  trackable: Trackable | undefined
}
const initialState = {
  trackable: undefined,
}
export const TrackableEditorStore = writable(initialState)

export const openTrackableEditor = (trackable: Trackable, saveByPass?: Function) => {
  trackEvent('open_trackable_editor');
  openModal({
    id: `trackable-editor-${trackable.tag}`,
    componentProps: {
      trackable,
      saveByPass,
    },
    component: TrackableEditorModal,
  })

  // TrackableEditorStore.update((s) => {
  //   s.trackable = trackable
  //   return s
  // })
}

export const closeTrackableEditor = () => {
  TrackableEditorStore.update((s) => {
    s.trackable = undefined
    return s
  })
}
