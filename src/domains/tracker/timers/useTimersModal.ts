import TimersModal from './timers-modal.svelte'
import { openModal } from '../../../components/backdrop/BackdropStore2'
import { wait } from '../../../utils/tick/tick'
import { writable } from 'svelte/store'

export const RunningTimersModalStore = writable({
  showDom: false,
  showModal: false,
})

export const showRunningTimersModal = async (): Promise<void> => {
  openModal({
    id: `timers-modal`,
    component: TimersModal,
    tappable: true,
    componentProps: {},
    position: 'bottom',
  })
}

export const hideRunningTimersModal = async () => {
  RunningTimersModalStore.update((s) => {
    s.showModal = false
    return s
  })
  await wait(200)
  RunningTimersModalStore.update((s) => {
    s.showDom = false
    return s
  })
}
