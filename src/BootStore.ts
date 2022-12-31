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


/**
 * It opens a modal with a pin lock, and if the pin is correct, it closes the modal and resolves the
 * promise with true
 * @param  - The Prefs object.
 * @returns A promise that resolves to a boolean.
 */
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

/**
 * It initializes the core components of the app
 * @param {ITrackables} trackables - ITrackables
 * @returns True
 */
export const bootCoreComponents = async (trackables: ITrackables) => {
  loadToday({ knownTrackables: trackables, date: new Date() })
  initUniboardStore(trackables)

  LocationStore.init()
  Device.init()
  UsageStore.init()
  GoalStore.init()
  SearchStore.init()
  WritingPromptStore.init();
  initAwardStore()
  return true
}

/**
 * > Boot Nomie, if the user has a pin, present the lock screen, then initialize the LedgerStore and
 * TrackableStore, then boot the core components
 * @param {PreferencesStateType}  - PreferencesStateType
 * @returns A promise that resolves to true.
 */
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

        resolve(true)
      })
    } catch (e) {
      console.error(e);
    }
  })
}
