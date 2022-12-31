import { Interact } from './interact'
import { Lang } from './lang'
import { LedgerStore } from '../domains/ledger/LedgerStore'
import NLog from '../domains/nomie-log/nomie-log'
// utils
import NStorage from '../domains/storage/storage'
import config from '../config/appConfig'
import { showToast } from '../components/toast/ToastStore'
import tick from '../utils/tick/tick'
import { writable } from 'svelte/store'

/**
 * Offline Queue Store
 * In the event the users is using blockstack
 * and their internet dies, or blockstack
 * is not available, this will store the results
 * and allow the user to save them layer.
 */

export interface IOfflineQueueState {
  logs: Array<NLog>
  lastSync?: Date
  status: 'idle' | 'syncing'
}

const InitOfflineQueueStore = () => {
  // Define State
  const { update, subscribe, set } = writable({
    logs: [],
    lastSync: undefined,
    status: 'idle',
  })

  const methods = {
    async init(): Promise<void> {
      // Get the offline queu from the local engine
      let fromStore = (await NStorage.engines.local.get(`${config.data_root}/offline-queue`)) || {
        logs: [],
        lastSync: undefined,
      }
      fromStore.logs = (fromStore.logs || [])
        .map((log) => {
          return new NLog(log)
        })
        .sort((a, b) => {
          return a.end < b.end ? 1 : -1
        })
      methods.state(fromStore)
    },
    // Sync Items in the Offline Queue
    async sync(): Promise<Array<NLog>> {
      // Promise to handle the callback
      let state = methods.state({ status: 'syncing' })
      let logs: Array<NLog> = []
      // Loop over logs in the state
      for (let i = 0; i < state.logs.length; i++) {
        // Assign log for use later
        const log: NLog = state.logs[i]
        // Save it to ledger and wait 500ms
        let saved = await LedgerStore._saveLog(log)
        await tick(500)
        // If saved - push to log
        if (saved) {
          logs.push(log)
        }
      }
      // If we have the same log count, we did them all
      if (state.logs.length == logs.length) {
        // Update state to idle and update.
        saveState({ status: 'idle', logs: [] })
      } else {
        // We missed something.
        Interact.alert('Error', 'Some logs did not save, check the console for more information')
        console.error({
          logs,
          stateLogs: state.logs,
        })
      }
      return logs
    },
    state(s: any = {}): IOfflineQueueState {
      let _state
      update((state) => {
        _state = { ...state, ...s }
        return _state
      })
      return _state
    },
    async record(log: NLog): Promise<boolean> {
      let state: IOfflineQueueState = methods.state()
      state.logs.push(log)
      saveState(state)
      return true
    },
  }

  async function removeLog(log: NLog) {
    try {
      const confirmed = confirm(Lang.t('board.delete-log-from-offline-queue', 'Delete this note from offline queue?'))
      if (confirmed) {
        const _state = methods.state()
        _state.logs = _state.logs.filter((loopLog: NLog) => {
          return loopLog !== log
        })
        await saveState(_state)
      }
      return true
    } catch (e) {
      alert(e.message)
    }
  }

  async function clear() {
    const confirmed = await Interact.confirm(
      Lang.t('board.empty-offline-title', 'Delete logs in offline queue?'),
      `This cannot be undone`
    )
    if (confirmed) {
      await saveState({ status: 'idle', logs: [] })
      showToast({ message: 'Offline Queue cleared' })
    }

    return true
  }

  function saveState(state: IOfflineQueueState) {
    update((s: any) => {
      s = { ...s, ...state }
      NStorage.engines.local.put(`${config.data_root}/offline-queue`, s)
      return s
    })
  }

  return {
    update,
    subscribe,
    set,
    ...methods,
    clear,
    removeLog,
  }
}

export const OfflineQueue = InitOfflineQueueStore()
declare let window: any
window.OQ = OfflineQueue
