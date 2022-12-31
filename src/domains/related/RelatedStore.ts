import RelatedModal from './related-modal.svelte'
import type { Trackable } from '../trackable/Trackable.class'
import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import { wait } from '../../utils/tick/tick'

export type TrackableRelatedType = {
  trackable: Trackable
  scores?: Array<{ trackable: Trackable; score: number; percent: number }>
}

export const RelatedStore = writable<TrackableRelatedType | undefined>(undefined)

export const openRelated = async (trackable: Trackable) => {
  await wait(100)
  closeModal('related-modal')

  RelatedStore.update((s: TrackableRelatedType | undefined) => {
    const newState = { ...(s || {}) } as TrackableRelatedType
    newState.trackable = trackable
    return newState
  })
  await wait(500)
  openModal({
    id: `related-modal`, // ${trackable.tag} -- removing this since it seems to be recalcuating everyone thats open
    component: RelatedModal,
    componentProps: {},
  })
}

export const closeRelated = () => {
  RelatedStore.update((s) => undefined)
}
