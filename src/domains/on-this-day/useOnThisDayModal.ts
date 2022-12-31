import OnThisDayModal from './on-this-day.svelte'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'

const state: Date | undefined = undefined
export const OnThisDayModalStore = writable(state)

export const openOnThisDayModal = (day: Date) => {
  if (day) {
    OnThisDayModalStore.update((s) => day)
    openModal({
      id: `on-this-day-modal-${day.toDateString()}`,
      component: OnThisDayModal,
      componentProps: {},
    })
  }
}

export const changeOnThisDay = (date: Date) => {
  OnThisDayModalStore.update((s) => {
    return date
  })
}
