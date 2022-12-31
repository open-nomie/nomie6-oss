// This is a stupidly confusing name...
// Consider renaming to something about software-update or something
import Logger from '../utils/log/log'
import { writable } from 'svelte/store'

// Vendors
import Storage from '../domains/storage/storage'
import whatsNew from '../config/whatsNew'
import { Interact } from './interact'

// Stores

const console = new Logger('🗺 $AppStore')
// Nomie API Store

const AppStoreState: any = {
  whatsNew: null,
}

const AppStoreInit = () => {
  const { update, subscribe, set } = writable(AppStoreState)

  const checkForUpdate = () => {
    let lastVersion = Storage.local.get('last-version')

    if (lastVersion !== whatsNew.version) {
      Storage.local.put('last-version', whatsNew.version)
    }
    // If they're not a brand new user - meaning they have a last Version already stored.
    if (lastVersion && lastVersion !== whatsNew.version) {
      Interact.confetti({ timeout: 3200 })
      update((state) => {
        state.whatsNew = whatsNew
        return state
      })
    }
  }

  const reveal = () => {
    update((state) => {
      state.whatsNew = whatsNew
      return state
    })
  }

  const closeUpdate = () => {
    update((state) => {
      state.whatsNew = null
      return state
    })
  }

  return {
    checkForUpdate,
    closeUpdate,
    update,
    subscribe,
    set,
    reveal,
  }
}

export const AppStore = AppStoreInit()
