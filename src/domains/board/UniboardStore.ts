/**
 * Universal Board
 * This is an upgrade from Nomie 5 where people and trackers were seperate
 */

import { derived, writable } from 'svelte/store'

import type { ITrackables } from '../trackable/trackable-utils'
import NPaths from '../../paths'
import Storage from '../../domains/storage/storage'
import type { Trackable } from '../trackable/Trackable.class'
import { dedupArray } from '../../utils/array/array_utils'
import nid from '../../modules/nid/nid'
import { objectHash } from '../../modules/object-hash/object-hash'
import { toTrackableArray } from '../trackable/trackable-utils'

import { getRawPrefs, PreferencesStateType } from '../preferences/Preferences'

import AllBoardIcon from '../../n-icons/board-tab-icons/AllBoardIcon.svelte'
import PeopleBoardIcon from '../../n-icons/board-tab-icons/PeopleBoardIcon.svelte'
import ContextBoardIcon from '../../n-icons/board-tab-icons/ContextBoardIcon.svelte'
// Define the Prop Typese
export type UniboardType = {
  id: string
  elements: Array<string>
  icon?: any
  label: string
  sort?: 'a-z' | 'z-a' | 'custom'
  active?: boolean
}

type SavedBoards = Array<UniboardType>

type UniboardStoreProps = {
  activeId?: string
  boards: SavedBoards
  editMode: boolean
  loaded: boolean
  hash: string
  dynamicBoards: {
    all: UniboardType
    people: UniboardType
    context: UniboardType
    now: UniboardType
  }
}

/**
 * Sticky board id - Get / Set Board Id
 * Keep Last Board in LocalStorage as to avoid
 * conflict with multiple device users.
 */
const LAST_BOARD_KEY = 'last-known-board'
export const getLastBoardId = (): string => {
  return localStorage.getItem(LAST_BOARD_KEY) || 'main'
}
export const saveLastBoardId = (id: string) => {
  localStorage.setItem(LAST_BOARD_KEY, id)
}

export const deleteUniboard = async (board: UniboardType) => {
  let state: UniboardStoreProps
  UniboardStore.update((s) => {
    s.boards = s.boards.filter((b) => b.id !== board.id)
    s.hash = objectHash(s.boards)
    state = s
    return s
  })
  return await saveBoardsToStorage(state.boards)
}

/**
 * Create the Store and State
 */
const UniboardState: UniboardStoreProps = {
  activeId: getLastBoardId(),
  boards: [],
  editMode: false,
  hash: '',
  dynamicBoards: {
    all: undefined,
    people: undefined,
    now: undefined,
    context: undefined,
  },
  loaded: false,
}

// Create the Store
export const UniboardStore = writable(UniboardState)

export const enableBoardEditMode = () => {
  UniboardStore.update((s) => {
    s.editMode = true
    return s
  })
}

const getRawState = (): UniboardStoreProps => {
  let state: UniboardStoreProps
  UniboardStore.update((s) => {
    state = s
    return s
  })
  return state
}

export const getActiveBoardHeavy = (): UniboardType | undefined => {
  const $Prefs = getRawPrefs()
  const $Uniboard = getRawState()
  const combined = combineStoreBoards($Uniboard, $Prefs)
  return combined.find((b) => b?.id == $Uniboard.activeId)
}

export const toggleBoardEditMode = () => {
  UniboardStore.update((s) => {
    s.editMode = !s.editMode
    return s
  })
}

export const disableBoardEditMode = () => {
  UniboardStore.update((s) => {
    s.editMode = false
    return s
  })
}

/**
 * Get the Boards from Storage
 * Migrate older format if needed
 * @returns
 */
export const getBoardsFromStorage = async (): Promise<Array<UniboardType>> => {
  let uniboards: SavedBoards = (await Storage.get(NPaths.storage.boards())) || []
  if (!uniboards.length) {
    const mainBoard: UniboardType = {
      id: 'main',
      label: 'Main',
      elements: [],
    }
    uniboards.push(mainBoard)
  }
  uniboards = uniboards
    .filter((b) => b)
    .filter((b) => {
      return b.id !== 'all'
    })
    .map((b: UniboardType) => {
      const oldBoard: any = b
      if (oldBoard.trackers) {
        b.elements = b.elements || []
        b.elements = [...b.elements, ...oldBoard.trackers.map((t) => `#${t}`.replace('##', '#'))]
        //@ts-ignore
        delete b.trackers
      }
      b.elements = b.elements || []
      return b
    })
    .filter((d) => d)

  return uniboards
}

/**
 * Combine all the Boards
 * This will take the user boards
 * and merge them with all, people and context
 * if the user has requested the
 * @param $Uniboard
 * @param $Prefs
 * @returns
 */
const combineStoreBoards = ($Uniboard, $Prefs: PreferencesStateType): Array<UniboardType> => {
  const peopleBoard = $Uniboard.dynamicBoards.people
  const contextBoard = $Uniboard.dynamicBoards.context
  const allBoard = $Uniboard.dynamicBoards.all

  let boards = []
  if ($Prefs.allBoard) {
    if (allBoard?.elements?.length) boards = [...boards, ...[allBoard]]
  }
  if ($Prefs.peopleBoard) {
    if (peopleBoard?.elements?.length) boards = [...boards, ...[peopleBoard]]
  }
  if ($Prefs.contextBoard) {
    if (contextBoard?.elements?.length) boards = [...boards, ...[contextBoard]]
  }

  boards = [...boards, ...$Uniboard.boards]

  return dedupArray(
    boards.filter((t) => t),
    'id'
  )
  // return $Uniboard.boards
}
export const CombinedBoards = derived(UniboardStore, ($Uniboard) => {
  const prefs = getRawPrefs()
  const combined = combineStoreBoards($Uniboard, prefs)
  return combined.map((board) => {
    if ($Uniboard.activeId == board.id) {
      board.active = true
    } else {
      board.active = false
    }
    return board
  })
})

export const ActiveBoard = derived(CombinedBoards, ($CombinedBoards) => {
  const activeBoard = $CombinedBoards.find((b) => b?.active)
  return activeBoard
})

/**
 * Initialize the
 */
export const initUniboardStore = async (knownTrackables: ITrackables) => {
  let boards = await getBoardsFromStorage()
  const trackables = toTrackableArray(knownTrackables)
  // TODO: Handle Sorting
  UniboardStore.update((s) => {
    s.boards = boards
    s.hash = objectHash(boards)

    s.dynamicBoards.people = {
      label: 'People',
      icon: PeopleBoardIcon,
      id: '_people',
      elements: trackables.filter((t) => t.person).map((t) => t.tag),
    }
    s.dynamicBoards.context = {
      label: 'Context',
      icon: ContextBoardIcon,
      id: '_context',
      elements: trackables.filter((t) => t.type === 'context').map((t) => t.tag),
    }
    s.dynamicBoards.all = {
      label: 'All',
      icon: AllBoardIcon,
      id: '_all',
      elements: trackables.filter((t) => t.type === 'tracker').map((t) => t.tag),
    }

    if (s.boards.find((b) => b.id == getLastBoardId())) {
      s.activeId = getLastBoardId()
    } else {
      s.activeId = boards.length ? boards[0].id : undefined
    }
    s.loaded = true

    return s
  })
}

/**
 * Save Board Payload to Storage
 * @param boards
 */
export const saveBoardsToStorage = async (boards: Array<UniboardType>) => {
  return await Storage.put(NPaths.storage.boards(), boards).catch((e) => {
    console.error(e.message)
  })
}

export const saveBoardsToStorageAndUpdate = async (boards: Array<UniboardType>): Promise<boolean> => {
  try {
    await saveBoardsToStorage(boards)
    UniboardStore.update((s) => {
      s.boards = boards
      s.hash = objectHash(boards)
      return s
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const saveSortedBoards = async (boards: Array<UniboardType>) => {
  const existing = await getBoardsFromStorage()
  const updated: Array<UniboardType> = boards.filter((b) => {
    return b.id !== '_all'
  })
  const missing = existing.filter((eb) => {
    return !updated.find((ub) => ub.id === eb.id)
  })
  if (!missing.length) {
    const updatedKey = updated.map((b) => b.id).join(',')
    const existingKey = existing.map((b) => b.id).join(',')
    if (updatedKey != existingKey) {
      await saveBoardsToStorageAndUpdate(updated)
    }
  } else {
    console.error('Cannot save the boards, we have missing data')
    console.table(missing)
  }
  return false
}

/**
 * Add a New Board Tab
 * @param name
 * @returns
 */
export const addNewBoard = async (name: string) => {
  const id = nid(new Date().getTime() + name).substring(0, 10)
  let boardStub: UniboardType = {
    id: id,
    label: name,
    elements: [],
  }
  return new Promise((resolve, reject) => {
    UniboardStore.update((s) => {
      s.boards.push(boardStub)
      s.hash = objectHash(s.boards)
      s.activeId = boardStub.id
      saveLastBoardId(boardStub.id)
      Storage.put(NPaths.storage.boards(), s.boards)
        .then(() => {
          resolve(boardStub)
        })
        .catch(reject)
      return s
    })
  })
}

/**
 * Add Trackables to a Board
 * @param trackables
 * @param _board
 */
export const addTrackablesToBoard = async (trackables: Array<Trackable>, _board: UniboardType) => {
  let trackableTags = trackables.map((t) => t.tag)
  const savedBoards = await getBoardsFromStorage()

  // Get the boards with updated elements
  const boards: Array<UniboardType> = savedBoards
    .filter((b) => b)
    .map((board: UniboardType) => {
      if (board.id == _board?.id) {
        trackableTags.map((tag) => {
          if (board.elements.indexOf(tag) === -1) {
            board.elements.push(tag)
          }
          return tag
        })
      }
      return board
    })

  // Save to Storage
  if (boards && boards.length) {
    await saveBoardsToStorage(boards)

    UniboardStore.update((s) => {
      s.boards = boards
      s.hash = objectHash(boards)
      return s
    })
  }
}

/**
 * Set the Stores active board
 * @param board
 */

let activeBoardTimeout
export const setActiveBoard = (board: UniboardType | string) => {
  const id = typeof board === 'string' ? board : board?.id
  clearTimeout(activeBoardTimeout)

  activeBoardTimeout = setTimeout(() => {
    if (board) {
      saveLastBoardId(id)
      UniboardStore.update((bs) => {
        bs.activeId = id
        bs.boards = [...bs.boards]
        bs.hash = objectHash(bs.boards)
        return bs
      })
    }
  }, 60)
}

export const exportBoard = (board: UniboardType) => {}

/**
 * Hop between Boards
 * Move next previous
 * @param dir
 */
export const nextPrevBoard = (dir: 'next' | 'previous') => {
  UniboardStore.update((state) => {
    let index = state.boards.findIndex((b) => b?.id == state.activeId)
    let nextIndex
    if (dir == 'next') {
      nextIndex = index < state.boards.length - 1 ? index + 1 : 0
    } else {
      nextIndex = index > 0 ? index - 1 : state.boards.length - 1
    }
    let board = state.boards[nextIndex]
    if (board) {
      setActiveBoard(board)
    }
    return state
  })
}

/**
 * Go to Next Board
 */
export const nextBoard = () => {
  nextPrevBoard('next')
}

/**
 * Go to Previous Board
 */
export const previousBoard = () => {
  nextPrevBoard('previous')
}
