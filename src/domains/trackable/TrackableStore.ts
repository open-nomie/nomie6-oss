import type { IPeople, ITrackers } from '../../modules/import/import'
import { addTrackablesToBoard, getActiveBoardHeavy } from '../board/UniboardStore'
import { derived, writable } from 'svelte/store'

import type { ContextClass } from '../context/context-class'
import { ContextStore } from '../context/context-store'
import { Interact } from '../../store/interact'
import { Lang } from '../../store/lang'
import { PeopleStore } from '../people/PeopleStore'
import Person from '../people/Person.class'
import type { Trackable } from './Trackable.class'
import TrackerClass from '../../modules/tracker/TrackerClass'
import { TrackerStore } from '../tracker/TrackerStore'
import { showToast } from '../../components/toast/ToastStore'
import type { PermissionsState } from '../my-account/PermissionsStore'


type ITrackables = {
  [key: string]: Trackable
}
type TrackableStoreProps = {
  trackables: ITrackables
  ready: boolean
}

/**
 * Setup and Configure TrackableStore
 * Set Props
 * Set Base State
 * Create Writable Store
 */
const TrackableStoreState: TrackableStoreProps = {
  trackables: {},
  ready: false,
}

export const TrackableStore = writable(TrackableStoreState)

export const AllTrackables = derived(TrackableStore, ($TrackableStore) => {
  return $TrackableStore.trackables
})

export const AllTrackablesAsArray = derived(TrackableStore, ($TrackableStore) => {
  let all = $TrackableStore.trackables;
  return Object.keys(all).map(tag => {
    return all[tag];
  })
})

export const AllTrackerTrackables = derived(TrackableStore, ($TrackableStore) => {
  const all = Object.keys($TrackableStore.trackables).map((tag) => {
    return $TrackableStore.trackables[tag];
  }).filter(t => t);

  return all.filter(t => t.type == 'tracker');
})

export const AllPeopleTrackables = derived(TrackableStore, ($TrackableStore) => {
  const all = Object.keys($TrackableStore.trackables).map((tag) => $TrackableStore.trackables[tag]);
  return all.filter(t => t.type == 'person');
})

export const AllContextTrackables = derived(TrackableStore, ($TrackableStore) => {
  const all = Object.keys($TrackableStore.trackables).map((tag) => $TrackableStore.trackables[tag]);
  return all.filter(t => t.type == 'context');
})

export const MasterTrackables: ITrackables = {}

export const getTrackablesFromStorage = async (): Promise<ITrackables> => {
  // Get Poeple Trackers and Context
  const finished: Array<any> = await Promise.all([PeopleStore.init(), TrackerStore.init(), ContextStore.init()])

  const people: IPeople = finished[0] || {}
  const trackers: ITrackers = finished[1] || {}
  const ctxs: Array<ContextClass> = finished[2] || []

  // Convert into Arrays of the Real Things
  Object.keys(people || {}).map((username) => {
    const person = new Person(people[username])
    const trackable = person.toTrackable()
    MasterTrackables[trackable.tag] = trackable
  })

  // Trackables to
  Object.keys(trackers || {}).map((tag) => {
    const tracker = new TrackerClass(trackers[tag])
    if (tracker) {
      const trackable = tracker.toTrackable()
      MasterTrackables[trackable.tag] = trackable
    }
  })

  if (ctxs.length) {
    ctxs.forEach((ctx: ContextClass) => {
      const trackable = ctx.toTrackable()

      MasterTrackables[trackable.tag] = trackable
    })
  }

  return MasterTrackables
}

/**
 * Initialize the Trackable Store
 * This will hold all things that are trackable
 */
export const InitTrackableStore = async (): Promise<ITrackables> => {
  const trackables = await getTrackablesFromStorage()

  TrackableStore.update((s) => {
    delete trackables['#']
    s.trackables = trackables
    s.ready = true
    return s
  })

  return trackables
}

export type SaveTrackableProps = {
  trackable: Trackable
  known: ITrackables
  permissions: any
  prompt?: boolean
  saveToActiveBoard?: boolean
}

/**
 * Saves a Trackable
 * TODO:// Confirm this is being used
 * @param trackable
 * @returns
 */
export const saveTrackable = async ({
  trackable,
  known,
  permissions,
  prompt = true,
  saveToActiveBoard = true,
}: SaveTrackableProps) => {
  try {
    // if (permissions.canWrite && permissions.trackables <= Object.keys(known).length) {
    //   // Maxed out. lets see if it already exists
    //   if (!known[trackable.tag]) {
    //     throw new Error(
    //       `Sorry, you've hit your Trackable limit of ${permissions.trackables}. Please upgrade your plan to add more.`
    //     )
    //   }
    // }

    let complete: any = false
    if (trackable.type === 'tracker') {
      const tracker = trackable.tracker
      if (!tracker.tag) throw new Error('Tracker missing data')
      complete = await saveTrackersToStorage([trackable])
    } else if (trackable.type === 'person') {
      complete = await PeopleStore.upsert(trackable.person)
    } else if (trackable.type === 'context') {
      complete = await ContextStore.upsert(trackable.ctx)
    }
    if (saveToActiveBoard) {
      const activeBoard = getActiveBoardHeavy()
      if (activeBoard && !activeBoard.elements.find((tag) => tag == trackable.tag)) {
        if (prompt === true && activeBoard?.id?.substring(0, 1) !== '_') {
          const confirmed = await Interact.confirm(`Add ${trackable.tag} to ${activeBoard.label}?`)
          if (confirmed) {
            addTrackablesToBoard([trackable], activeBoard)
          }
        } else {
          addTrackablesToBoard([trackable], activeBoard)
        }
      }
    }
    return complete
  } catch (e) {
    Interact.alert(e.message)
    return false
  }
}

/**
 * Delete Trackable
 * @param trackable
 */
export const deleteTrackableFromNomie = async (trackable: Trackable, prompt: boolean) => {
  let allowed = prompt
    ? await Interact.confirm('Remove Official Trackable?', 'No tracked data will be deleted, only this trackable.')
    : true
  if (allowed) {
    if (trackable.type == 'tracker' && trackable.tracker) {
      await TrackerStore.remove(trackable.tracker)
    } else if (trackable.type == 'person' && trackable.person) {
      await PeopleStore.remove(trackable.person)
    } else if (trackable.type == 'context' && trackable.ctx) {
      await ContextStore.remove(trackable.ctx);
    }
    showToast({ message: Lang.t('general.removed', 'Removed') })
  }
}

/**
 * Save Tracker type Trackables to Storage
 * @param trackables
 */
export const saveTrackersToStorage = async (trackables: Array<Trackable>): Promise<boolean> => {
  try {
    // const existing: ITrackers = (await Storage.get(NPaths.storage.trackers())) || {}
    // const trackers: ITrackers = {}
    // trackables
    //   .filter((t) => t.type === 'tracker')
    //   .map((t) => {
    //     trackers[t.tracker.tag] = t.tracker
    //     return t.tracker
    //   })
    // let merged: ITrackers = { ...existing, ...trackers }
    // await Storage.put(NPaths.storage.trackers(), merged)

    const map: ITrackers = {}
    trackables
      .filter((t) => t.type === 'tracker')
      .map((t) => {
        map[t.tracker.tag] = t.tracker
      })

    await TrackerStore.updateSync((state) => {
      let merged: ITrackers = { ...state, ...map }

      return merged
    })

    InitTrackableStore()
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
