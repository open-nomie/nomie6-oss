import LogEditorModal from './log-editor/log-editor-modal.svelte'
import type NLog from './nomie-log'
import type { NomieLogType } from './nomie-log'
import { objectHash } from '../../modules/object-hash/object-hash'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import { trackEvent } from '../usage/stat-ping'
export const LogEditorStore = writable<undefined | NLog>(undefined)

export const openLogEditor = (log: NomieLogType) => {
  trackEvent('open_log_editor');
  openModal({
    id: `log-editor-${objectHash(log)}`,
    position: 'fullscreen',
    component: LogEditorModal,
    componentProps: {
      log,
    },
  })
  // LogEditorStore.update((s) => log)
}
export const closeLogEditor = () => {
  // LogEditorStore.update((s) => undefined)
}
