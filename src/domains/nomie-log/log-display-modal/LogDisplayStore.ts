import LogDisplayModal from './log-display-modal.svelte'
import type NLog from '../nomie-log'
import { openModal } from '../../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'

export const LogDisplayStore = writable({
  log: undefined as undefined | NLog,
})

export const openLogDisplay = (log: NLog) => {
  openModal({
    position: 'bottom',
    id: `display-log-${log._id}`,
    componentProps: { log },
    component: LogDisplayModal,
  })
  // LogDisplayStore.update((s) => {
  //   s.log = log
  //   return s
  // })
}

export const closeLogDisplay = () => {
  // LogDisplayStore.update((s) => {
  //   s.log = undefined
  //   return s
  // })
}
