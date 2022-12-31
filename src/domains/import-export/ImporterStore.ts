import ImporterModal from './importer.svelte'
import csvImportView from '../import/csv/csv-import-view.svelte'
import { closeModal, openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'

const initialState = {
  show: false,
}

export const ImporterStore = writable(initialState)

export const showImportModal = (archive?: any) => {
  openModal({
    id: 'importer',
    component: ImporterModal,
    componentProps: {
      fileData: archive,
    },
    position: 'bottom',
  })
  // ImporterStore.update((s) => {
  //   s.show = true
  //   return s
  // })
}

export const hideImportModal = () => {
  closeModal('importer')
}

export const showCSVImportModal = (archive?: any) => {
  openModal({
    id: 'csv-importer',
    component: csvImportView,
    componentProps: {
      fileUpload: archive,
    },
    // position: 'bottom',
  })
  // ImporterStore.update((s) => {
  //   s.show = true
  //   return s
  // })
}