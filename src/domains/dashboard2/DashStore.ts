/**
 * DashStore
 *
 * Dec 23 2021 - Brandon
 * This is the store for the dashboard, this is the 3rd rewrite of the whole damn thing.
 * Now it's fairly clean using TrackableUsage for all of the stats opposed to N5
 * and how it manged stats with Widgets
 */

import {
  AddCircleOutline,
  DuplicateOutline,
  PencilOutline,
  SwapOutline,
  TrashOutline,
} from '../../components/icon/nicons'

import { DashboardClass } from './dashboard-class'
import type { DashboardPayload } from './dashboard-class'
import { Interact } from '../../store/interact'
import { Lang } from '../../store/lang'
import NPaths from '../../paths'
import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'
import Storage from '../../domains/storage/storage'
import { WidgetClass } from './widget/widget-class'
import nid from '../../modules/nid/nid'
import { objectHash } from '../../modules/object-hash/object-hash'
import { openWidgetEditor } from './widget/widget-editor/useWidgetEditorModal'
import { wait } from '../../utils/tick/tick'
import { writable } from 'svelte/store'
import { dedupArray } from '../../utils/array/array_utils'

type InitialState = {
  dashboards: Array<DashboardClass>
  activeDashboard: undefined | DashboardClass
  activeIndex: undefined | number
  editMode?: boolean
  dashboardHash: string | undefined
}

const getLastSelectedIndex = () => {
  return parseInt(localStorage.getItem('last-dash-index') || '0')
}
const setLastSelectedIndex = (index) => {
  localStorage.setItem('last-dash-index', index)
}

const dashboardInitialState: InitialState = {
  dashboards: [],
  dashboardHash: undefined,
  editMode: false,
  activeDashboard: undefined,
  activeIndex: getLastSelectedIndex(),
}

export const DashStore = writable(dashboardInitialState)

/**
 * Initialize the DashStore
 * Get from storage and update store
 * @returns
 */
export const initializeDashStore = async (): Promise<InitialState> => {
  const storedState = await getDashboardDataFromStorage()
  let finalState: InitialState
  DashStore.update((s: InitialState) => {
    s = { ...storedState }
    s.activeIndex = getLastSelectedIndex()

    try {
      s.activeDashboard = s.dashboards[s.activeIndex]
    } catch (e) {
      s.activeIndex = 0
      s.activeDashboard = s.dashboards[0]
      console.error('Error finding dashboard, default to 0')
    }
    finalState = s
    return s
  })

  return finalState
}

/**
 * Get Dashboard Data from Storage
 * @returns
 */
const getDashboardDataFromStorage = async (): Promise<InitialState> => {
  const rawDashboards: Array<DashboardClass> = ((await getDashboards()) || []);
  const dashboards = rawDashboards.map(dash=>{
    dash.widgets = dedupArray(dash.widgets, 'id');
    return dash;
  })
  const active: DashboardClass = dashboards[0]
  return {
    activeIndex: getLastSelectedIndex(),
    dashboards,
    dashboardHash: objectHash(dashboards),
    activeDashboard: active,
  }
}

const removeDuplicateWidgets = (items:Array<any>, key:string) => {
  
}

export const toggleDashboardEditMode = () => {
  DashStore.update((s) => {
    s.editMode = !s.editMode
    return s
  })
}

/**
 * Get Dashboards from Storage
 * @returns Array dashboards
 */
export const getDashboards = async (): Promise<Array<DashboardClass>> => {
  let dashboards: Array<DashboardClass> = ((await Storage.get(NPaths.storage.dashboards())) || []).map(
    (dashboard: any) => new DashboardClass(dashboard)
  )
  // If no boards - lets add one
  if (dashboards.length === 0) {
    const firstDasboard = new DashboardClass({ id: 'mystats-first-board', label: 'My Stats', widgets: [] })
    dashboards = [firstDasboard]
    setLastSelectedIndex(0);
    
  }
  return dashboards
}

export const deleteDashboard = async (dashboard:DashboardClass)=>{
  const exist = await getDashboards();
  let final:Array<DashboardClass> = [];
  DashStore.update((state: InitialState) => {
    // Loop over existing, replace with new boards if exist
    final = exist.filter((dash) => {
      return dash.id !== dashboard.id;
    })
    state.dashboards = final;
    return state;
  });
  
  return await writeDashboardsToStorage(final);
}

/**
 * Save Dashboards
 * This will take an array of dashboards and try to merge it with the
 * existing state and then save those to storage
 * @param dashboards
 */
export const saveDashboards = async (dashboards: Array<DashboardClass>) => {
  const existing = await getDashboards()

  DashStore.update((state: InitialState) => {
    // Loop over existing, replace with new boards if exist
    const final = existing.map((dash) => {
      const found = dashboards.find((d) => d.id == dash.id)
      if (found) return found
      return dash
    })

    // Loop over new boards
    // if not found, then push it
    dashboards.forEach((dash) => {
      const found = final.find((d) => d.id == dash.id)
      if (!found) final.push(dash)
    })

    state.dashboards = final
    state.dashboardHash = objectHash(state.dashboards)

    // Set the active Dashbaord
    // this way we see changes right away
    if (state.activeDashboard) {
      state.activeDashboard = final.find((d) => d.id == state.activeDashboard.id) || state.activeDashboard
    }

    writeDashboardsToStorage(final)
    return state
  })
}

/**
 * Save a Dashboard
 * Saves it as an array to saveDashboards
 * @param dashboard
 * @returns
 */
export const saveDashboard = async (dashboard: DashboardClass) => {
  return saveDashboards([dashboard])
}

/**
 * Write Dashboard data to storage
 * @param dashboards
 * @returns
 */
export const writeDashboardsToStorage = async (dashboards: Array<DashboardClass>): Promise<void> => {
  return Storage.put(NPaths.storage.dashboards(), dashboards)
}

/**
 * Get Board by Widget
 * @param widget
 * @returns
 */
export const getBoardByWidget = async (widget: WidgetClass): Promise<DashboardClass | undefined> => {
  const dashboards = await getDashboards()
  const found: DashboardClass | undefined = dashboards.find((d) => {
    return d.widgets.find((w) => w.id == widget.id)
  })
  return found
}

/**
 * Delete a Widget
 * @param widget
 * @returns
 */
export const deleteWidget = async (widget: WidgetClass) => {
  const board: DashboardClass = await getBoardByWidget(widget)
  if (board) {
    board.widgets = board.widgets.filter((w) => w.id !== widget.id)
    return saveDashboard(board)
  } else {
    alert('ERROR: Unable to find that Widget')
  }
}

/**
 * Duplicates a widget to the active stores
 * @param widget
 * @returns
 */
export const duplicateWidget = async (widget: WidgetClass) => {
  let baseWidget: WidgetClass = new WidgetClass(widget)
  baseWidget.id = nid()
  const board = await getBoardByWidget(widget)
  board.widgets.push(baseWidget)
  await wait(100)
  return await saveDashboard(board)
  // await DashboardStore.saveWidget(baseWidget)
}

/**
 * Fuse with the Store State
 * @param addOn
 * @returns
 */
const fuse = (addOn: any = {}) => {
  let state: InitialState
  DashStore.update((s) => {
    state = { ...s, ...addOn }
    return state
  })
  return state
}

/**
 * Create a new Dashboard
 */
export const createNewDashboard = async () => {
  let name = await Interact.prompt('Create new Dashboard', null, {
    placeholder: 'Dashboard Label',
  })
  if (name) {
    let dashboard = new DashboardClass({ id: nid(), label: name, widgets: [] })
    saveDashboard(dashboard)
  }
}

/**
 * Upsert a Widget
 * Will update or create a widget
 * @param widget
 * @returns
 */
export const upsertWidget = async (widget: WidgetClass) => {
  const board: DashboardClass = await getBoardByWidget(widget)
  if (board) {
    board.widgets = board.widgets.map((w) => {
      if (w.id == widget.id) {
        return widget
      } else {
        return w
      }
    })
    return await saveDashboard(board)
  } else {
    const state = fuse()
    if (state.activeDashboard) {
      state.activeDashboard.widgets.push(widget)
    }
    saveDashboard(state.activeDashboard)
  }
}

/**
 * Select a Dashboard by Index
 * @param index
 */
export const selectDashboardByIndex = async (index: number) => {
  const dashboards = await getDashboards()
  const active = dashboards[index]
  setLastSelectedIndex(index)
  DashStore.update((s) => {
    s.activeDashboard = active
    s.activeIndex = index
    return s
  })
}

/**
 * Import Dashboards
 * @param rawDashboards
 * @returns
 */
export const importDashboards = (rawDashboards: Array<DashboardPayload>) => {
  const dashboards = rawDashboards.map((raw) => new DashboardClass(raw))
  return saveDashboards(dashboards)
}

/**
 * Move a Widget
 * @param widget
 */
export const moveWidget = async (widget: WidgetClass) => {
  const rawDashboards = await getDashboards()

  const moveToDashboard = (dashboard) => {
    let dashboards = rawDashboards.map((loopDashboard: DashboardClass) => {
      loopDashboard.widgets = loopDashboard.widgets.filter((loopWidget: WidgetClass) => {
        return loopWidget.id !== widget.id
      })
      if (loopDashboard.id == dashboard.id) {
        loopDashboard.widgets.push(widget)
      }
      return loopDashboard
    })
    saveDashboards(dashboards)
  }

  const buttons = rawDashboards.map((dashboard: DashboardClass) => {
    return {
      title: dashboard.label,
      click() {
        try {
          moveToDashboard(dashboard)
        } catch (e) {
          Interact.alert('Error', e.message)
        }
      },
    }
  })

  Interact.popmenu({
    id: 'widget-move',
    buttons,
    title: `${Lang.t('dashboard.select-dashboard-to-move-widget', 'Move widget to which dashboard?')}`,
  })
}

/**
 * Show Widget Popmenu
 * @param widget
 */
export const showWidgetPopmenu = (widget: WidgetClass) => {
  const buttons: Array<PopMenuButton> = [
    {
      title: 'Edit Widget',
      icon: PencilOutline,
      async click() {
        await wait(300)

        openWidgetEditor({
          widget: widget,
          onSave(evt) {},
        })
      },
    },
    {
      title: 'Move Widget',
      icon: SwapOutline,
      divider: true,
      async click() {
        await wait(200)
        moveWidget(widget)
      },
    },
    {
      title: 'Duplicate',
      icon: DuplicateOutline,
      async click() {
        await wait(200)
        duplicateWidget(widget)
      },
    },
    {
      title: 'Delete Widget',
      icon: TrashOutline,
      async click() {
        await wait(300)
        let confirmed = await Interact.confirm(Lang.t('general.delete', 'Delete?'), 'You can always recreate it later.')
        if (confirmed) deleteWidget(widget)
      },
    },
  ]
  Interact.popmenu({
    id: `widget-options`,
    title: Lang.t('widgets.widget-options', 'Widget Options'),
    buttons,
  })
}
