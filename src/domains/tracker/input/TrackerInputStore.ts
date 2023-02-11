import { ActiveLogStore } from '../../capture-log/CaptureLogStore'
import type { ITrackables } from '../../ledger/ledger-tools'
import { Lang } from '../../../store/lang'
import type { Trackable } from '../../trackable/Trackable.class'
import type TrackerClass from '../../../modules/tracker/TrackerClass'
import TrackerInputModal from './input-modal.svelte'
import type { TrackerInputResponseType } from './tracker-input-utils'
import type { Writable } from 'svelte/store'
import is from '../../../utils/is/is'
import { objectHash } from '../../../modules/object-hash/object-hash'
import { openModal } from '../../../components/backdrop/BackdropStore2'
import { saveLog } from '../../ledger/LedgerStore'
import { writable } from 'svelte/store'

export type TrackerInputProps = {
  tracker?: TrackerClass
  trackables?: ITrackables
  onComplete?: Function
  showModal?: boolean
  onClose?: Function
  allowSave?: boolean
  nextLabel?: string
  value?: any
  expandNote?: boolean
  raw?: string
  suffix?: string
  action?: string
  retrospective?: boolean
}

const initialState = {
  tracker: undefined,
}
export const TrackerInputStore: Writable<TrackerInputProps> = writable(initialState)

/**
 * When a user taps a Tracker
 * @param tracker
 * @param trackers
 * @returns
 */
export const onTrackerTap = async (tracker: TrackerClass, trackables: ITrackables): Promise<any> => {
  let note = await getTrackerInputAsString({
    tracker,
    trackables: trackables,
    value: tracker.default,
    allowSave: true,
    expandNote: true,
  })
  if (note?.raw.length) {
    /**
     * You wanted to move this but you can't
     * the active log store is used to hold the users
     * current set time and location.
     * So we need to add the note, here, then get
     * it as a log for saving.
     */
    ActiveLogStore.addElement(note.raw)
    if (note.action === 'save' || tracker.one_tap) {
      await saveLog(ActiveLogStore.asLog())
      ActiveLogStore.clear()
      return note
    }
  }
  // timer.done();
  return note
}

export const clearTrackerInputStore = () => {
  TrackerInputStore.update((s: TrackerInputProps) => {
    s = { ...initialState }
    return s
  })
}

export const dismissTrackerInputModal = () => {
  clearTrackerInputStore()
}

export type TrackableValueResponseType = {
  trackable: Trackable
  value: number
  tag: string
}

/**
 * Get a Trackable Input Value 
 * This is used for getting values, but not for generating 
 * raw strings in the notes. 
 * 
 * @param trackable 
 * @param knownTrackables 
 * @param nextLabel 
 * @param props 
 * @returns 
 */
export const getTrackableInputValue = async (
  trackable: Trackable,
  knownTrackables: ITrackables,
  nextLabel: string = Lang.t('general.next', 'Next'),
  props: TrackerInputProps = {}
): Promise<TrackableValueResponseType | undefined> => {
  const note: Array<string> = []

  // TODO: Ask user if they want to add a note.
  props.tracker = trackable.tracker

  return new Promise((resolve, reject) => {

    /**
     * If its not a tracker - or it's a tracker and a tick
     * Then go ahead and return the value
     */

    if (trackable.type !== 'tracker' || (trackable.type == 'tracker' && trackable.tracker.type == 'tick')) {
      note.push(trackable.tag)
      resolve({
        trackable: trackable,
        value: undefined,
        tag: trackable.tag,
      })
    } else if (trackable.type == 'tracker' && trackable.tracker.type !== 'tick') {
      props.trackables = knownTrackables
      props.tracker = trackable.tracker
      props.allowSave = false
      props.nextLabel = nextLabel
      const onCompleteCall = props.onComplete ? props.onComplete.bind({}) : undefined
      props.onClose = () => {
        // closeTrackerInputModal()
      }
      const defaultOnComplete = (res) => {
        if ((res.suffix || '').length) {
          note.push(res.suffix)
        }

        // If Tracker has an include prop - and its expanded
        // Push the included to the note
        // if (props.tracker.include && props.expandNote) {
        //   note.push(props.tracker.getIncluded(res.value))
        // }

        const results = {
          trackable,
          value: res.value,
          tag: trackable.getNoteValue(res.value),
        }
        closeTrackerInputModal()
        if (onCompleteCall) onCompleteCall(results)
        resolve(results)
      }

      props.onComplete = defaultOnComplete
      openTrackerInputModal(props)
    }
  })
}

/**
 * It opens a modal with a component called `TrackerInputModal` and passes it a prop called `payload`
 * which is the `props` object that was passed into the function
 * @param {TrackerInputProps} props - TrackerInputProps = {}
 * @returns A promise that resolves to a TrackerInputResponseType
 */
export const openTrackerInputModal = (props: TrackerInputProps = {}): Promise<TrackerInputResponseType> => {
  return new Promise((resolve, reject) => {
    const onComplete = props.onComplete
    const finished = (res) => {
      resolve(res)
    }
    props.onComplete = (res) => {
      if (onComplete) onComplete(res)
      finished(res)
    }

    openModal({
      id: `tracker-input-${objectHash(props)}`,
      componentProps: {
        payload: props,
      },
      component: TrackerInputModal,
      position: window.document.body.clientWidth > 500 ? 'center' : 'bottom',
    })
  })
  // TrackerInputStore.update((s: TrackerInputProps) => {
  //   s = props
  //   s.showModal = true
  //   return s
  // })
}

export const closeTrackerInputModal = () => {
  TrackerInputStore.update((s: TrackerInputProps) => {
    s = { ...initialState }
    return s
  })
}

/**
 * Tracker Input Modal
 * React Style hook for opening and closing the tracker inputer
 * while passing the pramas needed to the Input modal
 * @returns [openFunc, closeFunc]
 */
export const useTrackerInputModal = () => {
  return [
    async (props: TrackerInputProps) => {
      return new Promise((resolve, reject) => {
        const onComplete = (results: TrackerInputProps) => {
          if (props.onComplete) {
            props.onComplete(results)
          }
          resolve(results)
        }
        TrackerInputStore.update((s) => {
          // if (props.tracker) s.tracker = props.tracker;
          // if (props.trackers) s.trackers = props.trackers;
          s = { ...s, ...props }
          s.onComplete = onComplete
          return s
        })
      })
    },
    () => {
      clearTrackerInputStore()
    },
  ]
}

/**
 * Open the
 * @param props TrackerInputProps
 * @returns
 */
export const getTrackerInputAsString = async (props: TrackerInputProps): Promise<TrackerInputProps | undefined> => {
  // Close the modal

  return new Promise(async (resolve) => {
    let response: TrackerInputProps

    const closeModal = async () => {
      // close({})
      // await wait(10)
      // clearTrackerInputStore()
      // await wait(10)
      // await wait(10)
      // resolve(undefined)
    }

    // We don't need to have a UI for the "tick types"
    if (props.tracker.type === 'tick') {
      response = {
        tracker: props.tracker,
        value: props.tracker.default,
      }
    } else {
      response = await openTrackerInputModal({
        tracker: props.tracker,
        trackables: props.trackables,
        value: props.value,
        allowSave: props.allowSave,
        expandNote: props.expandNote,
        nextLabel: props.nextLabel,
        retrospective: props.retrospective,
        onClose: closeModal,
      })
    }

    /**
     * Process the Response
     * Convert it to a note
     */
    if (response && response.tracker) {
      const note: Array<string> = []
      const tracker = response.tracker
      // if(tracker.type === 'tick' ) {
      //   // Add Default value to Tick if set
      //   note.push(`#${response.tracker.tag}${ is.truthy(response.value) ? `(${tracker.default})` : ''}`)
      // } else 
      
      if (tracker.type === 'note' || tracker.type === 'picker') {
        note.push(`#${response.tracker.tag}`)
      } else {
        if (is.truthy(response.value)) {
          note.push(`#${response.tracker.tag}(${response.value})`)
        } else {
          note.push(`#${response.tracker.tag}`)
        }
      }

      if ((response.suffix || '').length) {
        note.push(response.suffix)
      }

      // If Tracker has an include prop - and its expanded
      // Push the included to the note
      if (props.tracker.include && props.expandNote) {
        note.push(props.tracker.getIncluded(response.value))
      }

      resolve({
        raw: note.join(' '),
        action: response.action,
        tracker: response.tracker,
        value: response.value,
        expandNote: props.expandNote,
      })
    } else {
      resolve(undefined)
    }

    closeModal()
  })
}
