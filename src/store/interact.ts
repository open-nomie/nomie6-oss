/**
 * Interact Store: 2019
 * This is used to fire off global interactions with the user.
 * Anything thing that requires the users input that is used across
 * multiple pages, containers or components.
 *
 * For example: Alerts, Confirms, Prompts, Location Lookup, Location Showing, Editing Trackers
 *
 * Also - this thing has gotten completely out of control.
 * Going back, I don't think I'd do it this way again. Or at least
 * only for the general app interactions.. Not things like editing trackers
 * but maybe someday.
 *
 * UPDATE: Feb 2022
 * This thing did turn into a mad house, I'm not working on converting each of the intereactions
 * into their own little domain or components.
 *
 * We've also added a new openModal() globally accessible function that can open most of these things.
 *
 */

// Todo make this more type complete

import {
  addDividerToFirst,
  getDatePopButtons,
  getLogPopButtons,
} from '../modules/pop-buttons/pop-buttons'
// vendors
import type { Dayjs } from 'dayjs'

import AlertBox from '../components/alertbox/alertbox.svelte'
import type { ILocation } from '../domains/locations/LocationClass'

import { Lang } from './lang'
// Stores
import { LedgerStore } from '../domains/ledger/LedgerStore'

import NLocationModal from '../domains/map/location-modal.svelte'
import NLog from '../domains/nomie-log/nomie-log'
import type { PopMenuButton } from '../components/pop-menu/usePopmenu'
import Prompt from '../components/alertbox/prompt.svelte'
import type { Trackable } from '../domains/trackable/Trackable.class'
import { TrashOutline } from '../components/icon/nicons'

import { objectHash } from '../modules/object-hash/object-hash'
import { openLogEditor } from '../domains/nomie-log/LogEditorStore'
import { closeModal, openModal } from '../components/backdrop/BackdropStore2'
import { openPopMenu } from '../components/pop-menu/usePopmenu'
import { showToast } from '../components/toast/ToastStore'


import { wait } from '../utils/tick/tick'
// Svelte
import { writable } from 'svelte/store'
import dayjs from 'dayjs'

import blockerModalSvelte from '../components/backdrop/blocker-modal.svelte'

// utils

// modules

export interface IToastOptions {
  timeout?: number
  show?: boolean
  description?: string
  buttonLabel?: string
  buttonClick?: Function
  click?: Function
  perm?: boolean
}

type promptProps = {
  show?: boolean
  message?: string
  title?: string
  value?: any
  valueType?: 'textarea' | 'input'
  cancel?: any
  placeholder?: string
  onInteract?: Function
}

export interface ConfettiOptions {
  title?: string
  message?: string
  show?: boolean
  timeout?: number
}

export type IPopMenuOptions = {
  id: string
  show?: boolean
  buttons: Array<any>
  title?: string
  component?: any
  componentProps?: any
  description?: string
  trackable?: Trackable
  headerRightIcon?: any
  headerRightIconClick?: Function
  buttonView?: 'list' | 'grid'
}

const PopMenuInitialState = {
  show: false,
  title: null,
  description: null,
  buttons: [],
  divider: false,
  component: undefined,
  componentProps: undefined,
  buttonView: 'list',
  trackable: undefined as undefined | Trackable,
  headerRightIcon: undefined,
  headerRightIconClick: undefined,
}

interface StatsInteractConfig {
  activeTag: string | undefined
  date: Dayjs | undefined
  terms: Array<string>
  focused:
    | undefined
    | {
        date: Dayjs | undefined
      }
}

const stateStats: StatsInteractConfig = {
  activeTag: null,
  date: null,
  terms: [],
  focused: null,
}

export type AlertType = {
  title?: string
  message?: string
  ok?: string
  cancel?: string
  onInteract?: Function
  value?: any
  valueType?: 'value' | 'textarea' | 'number' | 'datetime'
  placeholder?: string
}

const interactInit = () => {
  const { update, subscribe, set } = writable({
    stats: stateStats,
    alert: {
      show: false,
      title: null,
      message: null,
      ok: 'Ok',
      cancel: null,
      onInteract: null,
    } as AlertType,
    blocker: {
      show: false,
      message: undefined,
      percent: undefined,
    },

    confetti: {
      show: false,
      title: undefined,
      message: undefined,
      timeout: undefined,
    },

    trackerInput: {
      show: false,
      tracker: null,
      onInteract: null,
      value: null,
      allowSave: true,
    },
    logEditor: {
      show: false,
      log: null,
      onInteract: null,
      tag: null,
      value: null,
    },
    toast: {
      show: false,
      message: null,
      detail: null,
      buttonLabel: undefined,
      buttonClick: undefined as undefined | Function,
      click: undefined,
      description: undefined,
    },
    popmenu: { ...PopMenuInitialState },
    locationFinder: {
      show: false,
      onInteract: null,
      location: null,
    },
    locationViewer: {
      show: false,
      locations: null,
    },
    prompt: {
      show: false,
      placeholder: undefined,
      message: undefined,
      title: undefined,
      value: undefined,
      valueType: undefined,
      cancel: undefined,
      onInteract: undefined,
    },
  })

  const methods = {
    alert(title: string, message?: string, ok?: string) {
      return new Promise((resolve) => {
        openModal({
          id: `alert-${objectHash([title, message, ok])}`,
          component: AlertBox,
          position: 'center',
          componentProps: {
            payload: {
              show: true,
              title: title,
              message: message,
              cancel: null,
              ok: ok || 'Ok',
              onInteract: resolve,
            },
          },
        })
        // update((s) => {
        //   s.alert.show = true
        //   s.alert.title = title
        //   s.alert.message = message
        //   s.alert.cancel = null
        //   s.alert.ok = ok || 'Ok'
        //   s.alert.onInteract = resolve
        //   return s
        // })
      })
    },
    confetti(options: ConfettiOptions = {}) {
      update((state) => {
        state.confetti.show = options.show === false ? false : true
        // state.confetti.title = options.title;
        // state.confetti.message = options.message;
        if (options.title) {
          methods.alert(options.title, options.message)
        }
        if (options.timeout) {
          setTimeout(() => {
            methods.confetti({
              show: false,
              title: undefined,
              message: undefined,
              timeout: undefined,
            })
          }, options.timeout)
        }
        return state
      })
    },
    blocker(message, percent?: number) {
      openModal({
        id: 'blocker',
        position: 'center',
        transparent: true,
        component: blockerModalSvelte
      })
      update((state) => {
        state.blocker.show = true
        state.blocker.message = message
        state.blocker.percent = percent
        return state
      })
    },
    stopBlocker() {
      closeModal('blocker');
      update((state) => {
        state.blocker.show = false
        state.blocker.message = undefined
        state.blocker.percent = undefined
        return state
      })
    },

    toggleFocusedEditor() {
      openLogEditor(new NLog({}))
    },

    loading(message) {
      let cancel = () => {
        update((state) => {
          state.toast.show = false
          state.toast.message = null
          state.toast.detail = null
          state.toast.buttonClick = undefined
          state.toast.buttonLabel = undefined
          return state
        })
      }
      update((state) => {
        state.toast.show = true
        state.toast.message = message
        return state
      })
      return cancel
    },

    /**
     * Tracker Input Action
     * This is an important Interaction - used to get values
     * from a specfic tracker
     * @param tracker
     * @param options
     */
    async trackerInput(tracker, options: any = {}) {
      // let value = options.value || null
      // let allowSave = options.allowSave === false ? false : true
      // return new Promise((resolve, reject) => {
      //   return update((s) => {
      //     s.trackerInput.show = true
      //     s.trackerInput.tracker = tracker
      //     s.trackerInput.allowSave = allowSave
      //     s.trackerInput.value = value
      //     s.trackerInput.onInteract = (payload, action: string = 'unknown') => {
      //       if (action !== 'cancelled') {
      //         payload.action = action
      //         resolve(payload)
      //       }
      //     }
      //     return s
      //   })
      // })
    },
    dismissTrackerInput() {
      update((d) => {
        d.trackerInput.show = false
        d.trackerInput.tracker = null
        d.trackerInput.onInteract = null
        return d
      })
    },

    focusDate(selectedPoint: undefined | { date: Dayjs | undefined }) {
      update((state) => {
        state.stats.focused = selectedPoint
        return state
      })
    },

    closeStats() {
      update((d) => {
        d.stats.terms = []
        return d
      })
    },

    async selectDate(starterDate: Date = new Date()) {
      let selectedDate: any = await Interact.prompt('Date / Time', null, {
        valueType: 'datetime',
        value: starterDate,
      })
      return selectedDate.getTime()
    },

    logOptions(log, options: any = {}) {
      log = new NLog(log)
      if (!log.trackers) {
        log.expanded()
      }
      return new Promise((resolve, reject) => {
        const deleteButton = {
          title: `${Lang.t('general.delete-this-note', 'Delete this note...')}`,
          click: async () => {
            await wait(300)
            let confirmed = await methods.confirm('Delete this note?', 'Are you sure? Deleting a log cannot be undone.')
            if (confirmed) {
              try {
                await LedgerStore.deleteLogs([log])
                showToast({ message: Lang.t('general.note-deleted','Note Deleted') })
              } catch (e) {
                methods.error(e.message)
              }
              return { action: 'deleted' }
            } else {
              return null
            }
          },
          icon: TrashOutline,
          divider: true,
        }

        let trackableButton: Array<PopMenuButton> = []
        // const trackables = log.elements
        //   .map((token) => {
        //     return tokenToTrackable(token, MasterTrackables)
        //   })
        //   .filter((s) => s)

        // if (trackables.length === 1) {
        //   trackableButton = getTrackableDetailPopButton(trackables[0])
        // }

        methods.popmenu({
          title: dayjs(log.end).fromNow(),
          description: log.note,
          id: `log-options-${log._id}`,
          buttons: [
            ...getLogPopButtons(log, false),
            ...trackableButton,
            ...addDividerToFirst(getDatePopButtons(log.end)),
            ...[deleteButton],
          ],
        })
      }) // end return promise
    },
    showLocations(locations) {
      update((s) => {
        s.locationViewer.locations = locations
        s.locationViewer.show = true
        return s
      })
    },
    dismissLocations() {
      update((s) => {
        s.locationViewer.locations = null
        s.locationViewer.show = false
        return s
      })
    },
    async error(message) {
      return methods.alert(`${Lang.t('general.error', 'Error')}`, message)
    },
    confirm(title: string, message?: string, ok?: string, cancel?: string): Promise<boolean> {
      return new Promise((resolve) => {
        const id = `alert-${objectHash([title, message, ok])}`
        openModal({
          id: id,
          component: AlertBox,
          position: 'center',
          componentProps: {
            payload: {
              title: title,
              message: message,
              cancel: cancel || `${Lang.t('general.cancel', 'Cancel')}`,
              ok: ok || 'Ok',
              onInteract: (res) => {
                if (res.value === false) {
                  resolve(false)
                } else {
                  resolve(res.value || true)
                }
                closeModal(id)
              },
            },
          },
        })
      })
    },
    reload() {
      document.location.reload()
    },
    closePopMenu() {
      update((s) => {
        s.popmenu = PopMenuInitialState
        return s
      })
    },
    popmenu(options: IPopMenuOptions) {
      openPopMenu(options)
    },
    pickLocation(location?: ILocation | undefined) {
      return new Promise((resolve, reject) => {
        openModal({
          id: `pickLocation`,
          component: NLocationModal,
          componentProps: {
            location,
            onSelect: (location) => {
              resolve(location)
            },
          },
        })
      })
    },

    prompt(title: string, msg?: string, options: promptProps = {}): Promise<any> {
      return new Promise((resolve, reject) => {
        openModal({
          id: `prompt-${objectHash([title, msg, options])}`,
          position: 'center',
          component: Prompt,
          componentProps: {
            payload: {
              show: true,
              message: msg,
              title: title,
              ok: 'Next',
              value: options.value || null,
              valueType: options.valueType || 'text',
              cancel: `${Lang.t('general.cancel', 'Cancel')}`,
              placeholder: options.placeholder || '',
              onInteract: (res: AlertType) => {
                if (res) resolve(res.value)
              },
            },
          },
        })
      })
    },
    dismiss() {
      update((s) => {
        s.popmenu.show = false
        s.prompt.show = false
        s.popmenu.component = undefined
        s.popmenu.componentProps = undefined
        return s
      })
    },
  }

  window['interact'] = methods

  return {
    update,
    subscribe,
    set,
    ...methods,
  }
}

export const Interact = interactInit()

export const closePopMenu = () => {
  Interact.closePopMenu()
}
