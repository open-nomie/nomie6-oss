/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// utils
import Logger from '../../utils/log/log'
import NPaths from '../../paths'
import SearchModal from './search-modal.svelte'
import { SideStore } from '../../domains/storage/side-storage'
import { openModal } from '../../components/backdrop/BackdropStore2'
// Svelte
import { writable } from 'svelte/store'

// Vendors

// Stores

const console = new Logger('🕵️‍♂️ $Search Store')

export class SearchTerm {
  term: string
  date: Date
  type: SearchModes
  constructor(item) {
    if (typeof item == 'string') {
      this.term = item
    } else {
      item = item || {}
      this.term = item.term
      this.date = new Date()
    }
    this.type = item.type || 'history'
  }
}

// Nomie API Store

let SearchStorage: SideStore
export type SearchModes = 'trackers' | 'history' | 'people'
interface ISearchStoreState {
  saved: Array<SearchTerm>
  active: SearchTerm
  view: SearchModes
  show: boolean
}

const SearchStoreInit = () => {
  let _state: ISearchStoreState = { saved: [], active: null, show: false, view: 'history' }

  const { update, subscribe, set } = writable(_state)

  function saveTerm(state: ISearchStoreState, searchTerm: SearchTerm): ISearchStoreState {
    let match = state.saved.find(
      (st: SearchTerm) => (st.term || '').toLowerCase().trim() == (searchTerm.term || '').toLowerCase().trim()
    )
    if (!match) {
      state.saved.push(searchTerm)
    }
    SearchStorage.put(NPaths.storage.search(), state.saved)
    return state
  }
  // Search Methods
  const methods = {
    init() {
      SearchStorage = new SideStore('search')
      update((state) => {
        state.saved = SearchStorage.get(NPaths.storage.search()) || []
        state.saved = state.saved
          .filter((d) => d)
          .map((term: SearchTerm) => {
            return new SearchTerm(term)
          })
        return state
      })
    },
    view(view: SearchModes, term?: string) {
      update((state) => {
        state.view = view
        state.active = {
          term: term,
          date: new Date(),
          type: view,
        }
        state.show = true
        return state
      })
      openModal({
        id: `search-${term}`,
        position: 'fullscreen',
        tappable: true,
        component: SearchModal,
        componentProps: {
          searchTerm: term,
        },
      })
    },
    clear() {
      update((state) => {
        state.active = undefined
        return state
      })
    },
    hide() {
      update((state) => {
        state.show = false
        return state
      })
    },
    search(term: string, view: SearchModes = 'history') {
      methods.view('history', term)
    },
    setActiveTerm(searchTerm?: SearchTerm) {
      update((state) => {
        state = saveTerm(state, searchTerm)
        state.active = searchTerm
        return state
      })
    },
    save(searchTerm?: SearchTerm) {
      update((state) => {
        state = saveTerm(state, searchTerm)
        return state
      })
    },
    close() {
      update((state) => {
        state.active = undefined
        state.show = false
        return state
      })
    },
    remove(searchTerm: SearchTerm) {
      update((state) => {
        state.saved = state.saved.filter((st: SearchTerm) => {
          return (st.term || '').toLowerCase().trim() != (searchTerm.term || '').toLowerCase().trim()
        })
        SearchStorage.put(NPaths.storage.search(), state.saved)
        return state
      })
    },
  }
  return {
    update,
    subscribe,
    set,
    ...methods,
  }
}

export const SearchStore = SearchStoreInit()
