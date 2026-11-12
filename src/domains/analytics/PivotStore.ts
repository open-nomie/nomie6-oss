
import { PivotClass } from './pivot-class'
import PivotEditorModal from './pivot-editor-modal.svelte'
import NPaths from '../../paths'
import { createArrayStore } from '../../store/ArrayStore'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import Storage from '../storage/storage'

export const PivotStore = createArrayStore(NPaths.storage.pivots(), {
  label: 'Pivots',
  key: 'id',
  itemInitializer: (item) => {
    return new PivotClass(item)
  },
  itemSerializer: (pivot: PivotClass) => {
    return pivot
  },
})

/**
 * Create a Store for the Modals
 */
export const PivotModalStore = writable({
  editor: undefined as PivotClass | undefined,
})

/**
 * Init Pivots
 * get the pivots from storage and update
 */

let masterPivots: Array<PivotClass> = []



/**
 * Open Editor Modal
 * @param pivot
 */
export const openPivotEditor = (pivot?: PivotClass) => {
  openModal({
    id: `pivot-${pivot.id}-editor`,
    position: 'fullscreen',
    componentProps: {
      pivot,
    },
    component: PivotEditorModal,
  })
}

/**
 * Register change listeners for pivots to enable real-time sync
 * When pivots are updated on other devices via CouchDB,
 * this function ensures the app detects and handles those changes.
 */
export const registerPivotListeners = async () => {
  try {
    const pivotsPath = NPaths.storage.pivots()

    console.log('[PivotStore] Registering change listener for pivots')

    // Register listener for pivot changes from CouchDB sync
    Storage.get(pivotsPath, async (changedPivots: any) => {
      console.log('[PivotStore] Pivot update detected from CouchDB sync')
      console.log('[PivotStore] Updated pivots count:', (changedPivots || []).length)

      // Reload pivots from storage to update the store
      try {
        const freshPivots = await Storage.get(pivotsPath)
        if (freshPivots && Array.isArray(freshPivots)) {
          PivotStore.set(freshPivots.map((p) => new PivotClass(p)))
          console.log('[PivotStore] Pivots reloaded successfully from CouchDB sync')
        }
      } catch (e) {
        console.error('[PivotStore] Error reloading pivots:', e)
      }
    })

    console.log('[PivotStore] Pivot listener initialized')
  } catch (e) {
    console.error('[PivotStore] Error registering pivot listener:', e)
  }
}

