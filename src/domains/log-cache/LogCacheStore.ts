import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'

import LogCacheModal from './log-cache-modal.svelte'
import { writable } from 'svelte/store'

export const LogCacheStore = writable<Date | undefined>(undefined)

export const openLogCacheModal = (date: Date = new Date()) => {
  openModal({
    id: 'log-cache',
    position: 'fullscreen',
    component: LogCacheModal,
    componentProps: {},
  })
}
export const closeLogCacheModal = () => {
  closeModal('log-cache')
}
