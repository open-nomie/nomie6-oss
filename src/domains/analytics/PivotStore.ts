
import { PivotClass } from './pivot-class'
import PivotEditorModal from './pivot-editor-modal.svelte'
import NPaths from '../../paths'
import { createArrayStore } from '../../store/ArrayStore'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import { trackEvent } from '../usage/stat-ping'

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
  trackEvent('open_pivot_editor');
  openModal({
    id: `pivot-${pivot.id}-editor`,
    position: 'fullscreen',
    componentProps: {
      pivot,
    },
    component: PivotEditorModal,
  })
}

