import type NLog from '../nomie-log/nomie-log'
import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'
import type { Trackable } from '../trackable/Trackable.class'
import UnisearchModal from './unisearch-modal.svelte'
import { getTrackablesFromStorage } from '../trackable/TrackableStore'
import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'
import { toTrackableArray } from '../trackable/trackable-utils'
import { unisearchCommands } from './unisearch-commands'
import { writable } from 'svelte/store'
import { trackEvent } from '../usage/stat-ping'

export type UnisearchResultsType = {
  trackables: Array<Trackable>
  logs: Array<NLog>
  commands: Array<PopMenuButton>
  exactTrackable: Trackable | undefined
}
type UnisearchStoreType = {
  visible: boolean
  term: string | undefined
}
const initState: UnisearchStoreType = { term: undefined, visible: false }
export const UnisearchResultsStore = writable<UnisearchResultsType | undefined>(undefined)
export const UnisearchStore = writable<UnisearchStoreType>(initState)

/**
 * It closes the UniSearch component
 */
export const closeUnisearch = () => {
  closeModal('unisearch')
  UnisearchStore.update((s) => {
    return {
      term: undefined,
      visible: false,
    }
  })
}

/**
 * It opens a modal with the UnisearchModal component, and passes the searchTerm prop to it
 * @param {string} [term] - The search term to pre-fill the search bar with.
 */
export const openUnisearch = (term?: string) => {
  trackEvent('open_unisearch');
  openModal({
    id: 'unisearch',
    component: UnisearchModal,
    componentProps: {
      searchTerm: term,
    },
    tappable: true,
    position: 'center',
  })
}

/**
 * It takes a search term and returns a list of commands, trackables, and logs that match the search
 * term
 * @param {string} term - The search term
 * @returns An object with the following properties:
 * commands: an array of commands
 * trackables: an array of trackables
 * logs: an array of logs
 * exactTrackable: an exact trackable
 */
export const getUnisearchResults = async (term: string): Promise<UnisearchResultsType> => {
  let exactTrackable = undefined
  if (!term) return { commands: [], trackables: [], logs: [], exactTrackable: undefined }
  const commands = unisearchCommands.filter((b) => {
    return JSON.stringify(b).toLowerCase().search(term.toLowerCase()) > -1
  })
  const known = await getTrackablesFromStorage()
  const trackables = toTrackableArray(known).filter((t) => {
    return JSON.stringify(t).toLowerCase().search(term.toLowerCase()) > -1
  })
  if (known[term]) {
    exactTrackable = known[term]
  } else if (known[`#${term}`]) {
    exactTrackable = known[`#${term}`]
  } else if (known[`@${term}`]) {
    exactTrackable = known[`@${term}`]
  }
  const logs = []

  return {
    commands,
    trackables,
    logs,
    exactTrackable,
  }
}
