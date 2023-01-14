import {
  AddIcon,
  AppsOutline,
  BarChart,
  BookOutline,
  CalendarOutline,
  CreateOutline,

  PeopleOutline,
  SettingsOutline,
  TabsOutline,
  TrashOutline,
} from '../../components/icon/nicons'
// import { selectTrackables } from '../selector/useSelectTrackables'
import { openTrackableLibrary } from '../library/tracker-library'
import {
  UniboardStore,
  addNewBoard,
  getBoardsFromStorage,
  getLastBoardId,
  saveBoardsToStorage,
  saveBoardsToStorageAndUpdate,
  toggleBoardEditMode,
} from './UniboardStore'

import type { Dayjs } from 'dayjs'
import { Device } from '../../store/device-store'
import FilterCircleOutline from '../../n-icons/FilterCircleOutline.svelte'
import RepeatOutline from '../../n-icons/RepeatOutline.svelte'
import type { IPopMenuOptions } from '../../store/interact'
import type { ITrackables } from '../trackable/trackable-utils'
import { Interact } from '../../store/interact'
import { Lang } from '../../store/lang'
import type NLog from '../nomie-log/nomie-log'
import Person from '../people/Person.class'
//@ts-ignore
import PlayBackCircle from '../../n-icons/PlayBackCircle.svelte'
import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'

//@ts-ignore
import StreakScroller from '../steak/screak-scroller.svelte'

import { Trackable } from '../trackable/Trackable.class'
import TrackerClass from '../../modules/tracker/TrackerClass'
import type { UniboardType } from './UniboardStore'
import { addTrackablesToBoard } from './UniboardStore'
import appConfig from '../../config/appConfig'
import { deleteTrackableFromNomie } from '../trackable/TrackableStore'
import { getDateFormats } from '../preferences/Preferences'
import { goBackInTime } from '../usage/today/TodayStore'
import { objectHash } from '../../modules/object-hash/object-hash'
import { openBoardSorter } from './useBoardSortModal'
import { openCalendarView } from '../calendar-view/CalendarViewStore'
import { openDropMenu } from '../../components/menu/useDropmenu'
import { openLogDisplay } from '../nomie-log/log-display-modal/LogDisplayStore'
import { openOnThisDayModal } from '../on-this-day/useOnThisDayModal'
import { openPopMenu } from '../../components/pop-menu/usePopmenu'

import { openStats2 } from '../stats2/Stats2Store'
import { openStreakModal } from '../steak/StreakModalStore'
import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'
import { openTrendingModal } from '../trending/TrendingModalStore'
import { selectTrackables } from '../trackable/trackable-selector/TrackableSelectorStore'
import { wait } from '../../utils/tick/tick'

import { getTrackableLastUsageHeavy } from '../usage/UsageStore'
import dayjs from 'dayjs'
import { md5 } from '../../modules/nid/nid'
import BookmarksOutline from '../../n-icons/BookmarksOutline.svelte'

import { openTimelineModal } from '../timeline/timeline-helpers'

/**
 * Create a New Board
 * Get prompted to create a board and save
 */
export const createNewBoard = async () => {
  let res: any = await Interact.prompt(
    `${Lang.t('board.add-a-board', 'Add New Tab')}`,
    `${Lang.t(
      'board.add-a-board-description',
      'Tabs help you organize your trackables into logical groups.'
    )}`,
    {
      placeholder: `${Lang.t('board.board-input-placeholder', 'Tab name or Emoji 👍')}`,
    }
  )
  if (res) {
    let label = res.trim()
    if (label.toLowerCase() !== 'all') {
      addNewBoard(label)
    } else {
      Interact.error("Sorry, 'All' is a reserved word")
    }
  }
}

// /**
//  * Edit a Board
//  * @param board
//  */
// const editBoard = async (board: UniboardType) => {
//   navigate(NPaths.routes.board(board.id))
// }

export const getAddContextButton = (board: UniboardType) => {
  return {
    title: Lang.t('general.new-context', ' Add New +Context'),
    icon: BookmarksOutline,
    async click() {
      await 200
      await openTrackableEditor(
        new Trackable({
          type: 'context',
        })
      )
    },
  }
}

/**
 * Button: Get Add Tracker
 * @param board
 * @returns
 */
export const getAddTrackerButton = (board: UniboardType) => {
  return {
    title: `${Lang.t('general.new-tracker', 'Add New #Tracker')}`,
    icon: AddIcon,
    async click() {
      openTrackableEditor(new Trackable({ type: 'tracker', tracker: new TrackerClass({}) }))
    },
  }
}

/**
 * Remove a Tracker from Nomie
 * @param trackable
 */
export const removeTrackableFromNomie = async (trackable: Trackable) => {
  const confirmed = await Interact.confirm(
    `${Lang.t('general.remove-official', 'Remove Official Trackable')}`,
    `${Lang.t(
      'tracker.delete-description',
      'No tracked data will be deleted, and you can always recreate this tracker'
    )}`
  )
  if (confirmed) {
    Interact.blocker('Deleting...')
    await deleteTrackableFromNomie(trackable, false)
    Interact.stopBlocker();
    Device.reload();
  }
}

/**
 * Remove a Trackable from the active Board
 * @param trackable
 */
export const removeTrackableFromBoard = async (trackable: Trackable, boardId?: string) => {
  const currentBoardId = boardId || getLastBoardId()
  const confirmed = await Interact.confirm(`Remove ${trackable.tag} from this board?`, 'You can always re-add it later')
  if (confirmed) {
    const boards = await getBoardsFromStorage()
    const workingBoard = boards.find((b) => b.id === currentBoardId)
    if (workingBoard) {
      workingBoard.elements = workingBoard.elements.filter((e) => e !== trackable.tag)
    }
    await saveBoardsToStorage(boards)
    UniboardStore.update((s) => {
      s.boards = boards
      s.hash = objectHash(boards)
      return s
    })
  }
}

/**
 * Upsert a Board
 * @param board
 * @returns
 */
export const saveBoard = async (board: UniboardType) => {
  const boards = await getBoardsFromStorage()
  const foundIndex = boards.findIndex((b) => b.id == board.id)
  if (foundIndex > -1) {
    boards[foundIndex] = board
  } else {
    boards.push(board)
  }

  return saveBoardsToStorageAndUpdate(boards)
}

export const browseLibrary = async () => {}

/**
 * Remove Board From Nomie
 * @param board
 * @returns
 */
export const removeBoard = async (board: UniboardType): Promise<any> => {
  const boards = await getBoardsFromStorage()
  return saveBoardsToStorage(
    (boards || []).filter((b) => {
      return b.id !== board.id
    })
  )
}

/**
 * Remove a Trackable
 * @param trackable
 * @returns
 */
export const removeTrackable = async (trackable: Trackable) => {
  const currentBoardId = getLastBoardId()

  const buttons = [
    {
      title: `Remove from Current Tab`,
      click() {
        removeTrackableFromBoard(trackable, currentBoardId)
      },
    },
    {
      title: 'Remove official Trackable',
      click() {
        removeTrackableFromNomie(trackable)
      },
    },
  ]

  await wait(300)
  Interact.popmenu({
    id: `delete-${trackable.tag}`,
    trackable: trackable,
    title: `Delete ${trackable.label}`,
    buttons,
  })

  // if (currentBoardId === '_all' || currentBoardId === '_people') {
  //   return removeTrackableFromNomie(trackable)
  // } else {
  //   return removeTrackableFromBoard(trackable, currentBoardId)
  // }
}

export const showLogTrackablePopmenu = (log: NLog, trackable: Trackable) => {
  const buttons: Array<PopMenuButton> = [
    {
      title: 'View Full Note',
      click() {
        openLogDisplay(log)
      },
    },
    {
      title: `View all ${log.endDayjs().format(getDateFormats().mmm_d_yyyy)}`,
      click() {
        openOnThisDayModal(log.end)
      },
    },
    {
      title: `View Trending on ${log.endDayjs().format(getDateFormats().mmm_d_yyyy)}`,
      click() {
        openTrendingModal(log.end, 'day')
      },
    },
  ]
  Interact.popmenu({
    id: `calendar-mode-${log._id}`,
    title: 'What would you like to do?',
    buttons,
  })
}

/**
 * Show Trackable More Popmenu
 * @param trackable
 * @param options
 * @returns
 */
export const showTrackablePopmenu = async (
  trackable: Trackable,
  options?: {
    title?: string
    buttons?: Array<any>
    description?: string
    click?: Function
    component?: any
    componentProps?: any
    trackable?: Trackable
    date?: Dayjs
  }
) => {
  options = options || {}
  options.component = options.component || StreakScroller
  options.componentProps = options.componentProps || { trackable: trackable }
  options.title = options.title || trackable.tag

  const usage = getTrackableLastUsageHeavy(trackable)
  const streakValue = usage ? usage[trackable.tag]?.streak?.v : 0

  const description = []
  if (usage && usage.last) {
    description.push(`(${trackable.formatValue(usage.last.v)})`)
    description.push(dayjs(usage.last.d).fromNow())
  }
  options.description = description.length ? description.join(' ') : undefined
  options.trackable = options.trackable || trackable

  const click = () => {
    if (options.click) {
      options.click()
    }
  }
  let buttons = [
    {
      title: `${Lang.t('tracker.stats', 'Stats')} `,
      icon: BarChart,
      skipClosing: true,
      click() {
        // Interact.openStats(`${trackable.tag}`)

        openStats2(trackable, { known: {}, date: new Date() })
        click()
      },
    },
    {
      title: `${Lang.t('tracker.streak', 'Streak')}`,
      icon: RepeatOutline,
      right: streakValue,
      skipClosing: true,
      click() {
        openStreakModal(trackable)
        // click()
      },
    },
    {
      title: Lang.t('general.entries','Entries'),
      icon: CreateOutline,
      skipClosing: true,
      click() {
        
        openTimelineModal({
          search: trackable.tag,
          notes: true
        })
        // SearchStore.view('history', trackable.tag)
      }
    }, 
    // {
    //   title: Lang.t('tracker.related', 'Related'),
    //   icon: RelatedOutline,
    //   skipClosing: true,
    //   click() {
    //     openRelated(options.trackable)
    //     // openStreakModal(trackable)
    //     // click()
    //   },
    // },
    {
      title: `Calendar`,
      icon: CalendarOutline,
      skipClosing: true,
      click() {
        openCalendarView({ trackable: options.trackable })
        // SearchStore.search(trackable.tag)
        // click()
      },
    },
    {
      title: `${Lang.t('general.configure', 'Configure')}`,
      icon: SettingsOutline,
      skipClosing: true,
      click() {
        if (trackable.type === 'tracker') openTrackableEditor(trackable)
        if (trackable.type === 'person') openTrackableEditor(trackable)
        if (trackable.type === 'context') openTrackableEditor(trackable)
        click()
      },
    },
    {
      title: `${Lang.t('general.remove', 'Remove')}`,
      icon: TrashOutline,

      click() {
        removeTrackable(trackable)
        click()
      },
    },
  ]
  const trackerPopMenu: IPopMenuOptions = {
    id: `trackable-options-${md5(options.trackable.tag)}`,
    title: options.title || 'Tracker Options',
    component: options.component,
    componentProps: options.componentProps,
    description: options.description || undefined,
    buttons: options.buttons ? [...buttons, ...options.buttons] : buttons,
    trackable: options.trackable,
    buttonView: 'grid',
    // headerRightIcon: CalendarOutline,
    // headerRightIconClick() {
    //   openCalendarView({ trackable: options.trackable })
    //   Interact.dismiss()
    // },
  }
  return await openPopMenu(trackerPopMenu)
}

/**
 * Button: Add Person Button
 * @param board
 * @returns
 */
export const getAddPersonButton = (board?: UniboardType) => {
  return {
    title: `${Lang.t('general.new-person', 'Add New @Person')}`,
    icon: PeopleOutline,
    async click() {
      await wait(300)
      addNewPerson()
    },
  }
}

export const addNewPerson = async (name?: string) => {
  try {
    const person = new Person({})
    openTrackableEditor(person.toTrackable())
  } catch (e) {
    Interact.error(e.message)
  }
}

/**
 * Generates a PopMenu Button for Adding Existing Trackables
 * @param board
 * @returns
 */
export const getAddExistingButton = (board: UniboardType, disabled: boolean) => {
  return {
    title: `${Lang.t('general.pick-from-existing-trackables', 'Pick From Existing')}`,
    icon: AppsOutline,
    disabled,
    divider: true,
    async click() {
      await wait(300)
      const trackables = await selectTrackables()
      if (trackables.length) {
        await addTrackablesToBoard(trackables, board)
      }
    },
  }
}

/**
 * Button: Browse Library Button
 */
export const browseLibraryButton = {
  title: `${Lang.t('general.browse-library', 'Browse Library...')}`,
  icon: BookOutline,
  async click() {
    openTrackableLibrary()
  },
}


/* Creating a new tab button. */
export const newTabButton = {
  title: `${Lang.t('general.new-tab', 'Add New Tab')}`,
  icon: TabsOutline,
  divider: true,
  async click() {
    createNewBoard()
  },
}


/**
 * It returns an array of buttons that are used to add new trackables to a board
 * @param {UniboardType} board - The board that the user is currently viewing.
 * @param {ITrackables} knownTrackables - ITrackables = {}
 * @returns An array of PopMenuButton objects.
 */
export const getBoardAddOptions = (board: UniboardType, knownTrackables: ITrackables = {}): Array<PopMenuButton> => {
  const hasTrackables = Object.keys(knownTrackables).length > 0

  return [
    getAddTrackerButton(board),
    getAddPersonButton(board),
    getAddContextButton(board),
    getAddExistingButton(board, !hasTrackables), // disable if no trackables
    browseLibraryButton,
    newTabButton,
  ]
}

/**
 * It takes a board and a list of known trackables, and returns a list of buttons that can be used to
 * add new trackables to the board
 * @param {UniboardType} board - UniboardType
 * @param {ITrackables} knownTrackables - ITrackables = {}
 */
export const showBoardAddOptions = async (board: UniboardType, knownTrackables: ITrackables = {}) => {
  const buttons = getBoardAddOptions(board, knownTrackables)
  Interact.popmenu({
    id: 'things-to-track',
    // title: 'Add things to Track',
    buttons,
  })
}

/**
 * Show Board + Options
 * @param board
 */
// export const showBoardAddMenu = async (caller: HTMLElement, board: UniboardType, knownTrackables:ITrackables) => {
//   const buttons = [
//     getAddTrackerButton(board),
//     getAddPersonButton(board),
//     getAddContextButton(board),
//     getAddExistingButton(board, Object.keys(knownTrackables).length==0), // if no trackables diable it
//     browseLibraryButton,
//     newTabButton,
//   ]
//   openDropMenu(caller, buttons)
// }

/**
 * Show Board Options
 * Will show popmenu options for the provided board
 * @param board
 */

/**
 * It returns an array of buttons that will be displayed in the board menu
 * @param {UniboardType} [board] - The board object
 * @returns An array of objects with the following properties:
 *   title: string
 *   icon: React.Component
 *   click: function
 *   divider: boolean
 */
export const getBoardMenu = (board?: UniboardType): Array<PopMenuButton> => {
  let buttons = []

  buttons.push({
    title: `${Lang.t('general.go-back-in-time', 'Go Back in Time')}`,
    icon: PlayBackCircle,
    async click() {
      await wait(300)
      goBackInTime()
    },
  })

  buttons.push({
    title: 'Edit',
    divider: true,
    icon: FilterCircleOutline,
    click() {
      toggleBoardEditMode()
    },
  })

  return buttons
}

/**
 * It returns a PopMenuButton object that has a title, icon, divider, and click function
 * @returns A PopMenuButton object
 */
export const getEditDeleteTabsButton = (): PopMenuButton => {
  return {
    title: `${Lang.t('board.edit-tabs', 'Edit / Delete Tabs')}`,
    icon: SettingsOutline,
    divider: false,
    async click() {
      openBoardSorter()
    },
  }
}

/**
 * It opens a drop menu with the options for a board
 * @param {UniboardType} [board] - The board object.
 * @param {any} [evt] - The event that triggered the function.
 */
export const showBoardOptions = async (board?: UniboardType, evt?: any) => {
  openDropMenu(evt.detail.target, getBoardMenu(board))
}

/**
 * It takes a current score and a callback function, and returns an array of PopMenuButton objects
 * @param {number} [currentScore=0] - number = 0
 * @param {Function} [onSelect] - A callback function that will be called when the user clicks on a
 * button.
 * @returns An array of PopMenuButton objects
 */
export const getPositivityButtons = (currentScore: number = 0, onSelect?: Function): Array<PopMenuButton> => {
  return appConfig.positivity
    .sort((a, b) => (a.score < b.score ? 1 : -1))
    .map((pos) => {
      return {
        title: `${pos.label}`,
        emoji: pos.emoji,
        checked: currentScore == pos.score,
        click() {
          if (onSelect) onSelect(pos)
        },
      }
    })
}
