import { writable } from 'svelte/store'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { textToId } from '../../utils/text/text'
import type { Trackable, TrackableType } from '../trackable/Trackable.class'
import StreakModal from './streak-modal.svelte'
const initState = { trackable: undefined as undefined | Trackable | TrackableType, date: undefined as undefined | Date }
export const StreakModalStore = writable(initState)

export const openStreakModal = (trackable: Trackable, date: Date = new Date()) => {
  openModal({
    id: textToId(`streak-${trackable.tag}`),
    component: StreakModal,
    componentProps: {
      trackable,
      date,
    },
  })
  // StreakModalStore.update((s) => {
  //   s.trackable = trackable
  //   s.date = date
  //   return s
  // })
}

export const closeStreakModal = () => {
  StreakModalStore.update((s) => {
    s.date = undefined
    s.trackable = undefined
    return s
  })
}
