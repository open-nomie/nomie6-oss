import { Device } from './store/device-store'
import { GoalStore } from './domains/goals/GoalStore'
import { InitTrackableStore } from './domains/trackable/TrackableStore'
import { Interact } from './store/interact'
import { LedgerStore } from './domains/ledger/LedgerStore'
import { LocationStore } from './domains/locations/LocationStore'
import type { PreferencesStateType } from './domains/preferences/Preferences'
import { SearchStore } from './domains/search/search-store'
import Storage from './domains/storage/storage'
import { UsageStore } from './domains/usage/UsageStore'
import { closeModal } from './components/backdrop/BackdropStore2'
import { initAwardStore } from './domains/awards/AwardsStore'


import { initUniboardStore } from './domains/board/UniboardStore'
import { loadToday } from './domains/usage/today/TodayStore'
import { openPinLock } from './domains/pin-lock/pin-helper'
import { writable } from 'svelte/store'
import type { ITrackables } from './domains/trackable/trackable-utils'
import { WritingPromptStore } from './domains/writing-prompts/useWritingPrompts'

export const BootLog = writable<Array<{ message: string; date: Date }>>([])

// const pushLog = (message: string, date: Date = new Date()) => {
//   BootLog.update((s) => {
//     s.push({ message, date })
//     console.log(`🥾 BootStore: ${message}`)
//     return s
//   })
// }

const presentLockScreen = async ($Prefs): Promise<boolean> => {
  return new Promise((resolve) => {
    openPinLock({
      canClose: false,
      title: 'Pin to Unlock',
      isMatch(pin) {
        return pin === $Prefs.usePin
      },
    }).then((pin) => {
      if (pin === $Prefs.usePin) {
        closeModal('pin-lock')
        resolve(true)
      } else {
        Interact.error('Invalid Pin Code.')
        presentLockScreen($Prefs)
      }
    })
  })
}

export const bootCoreComponents = async (trackables: ITrackables) => {
  loadToday({ knownTrackables: trackables, date: new Date() })
  initUniboardStore(trackables)

  LocationStore.init()
  Device.init()
  UsageStore.init()
  GoalStore.init()
  SearchStore.init()
  WritingPromptStore.init();


  // initAwardStore()


  return true
}

export const bootNomie = async ($Prefs: PreferencesStateType) => {
  let locked = $Prefs.usePin ? true : false

  return new Promise((resolve) => {
    try {
      Storage.onReady(async () => {
        if (locked && $Prefs.usePin) {
          await presentLockScreen($Prefs)
        }
        await LedgerStore.init()
        const trackables = await InitTrackableStore()

        bootCoreComponents(trackables)
        // If not ready, we don't have an account firing 
        // the ready state - we will manually do it here.

        setTimeout(() => {

          // MessageStore.loadMessages()
        }, 2000)

        resolve(true)
      })
    } catch (e) {
      console.error(e);
    }
  })
}
