import BoardSorter from './board-sort.svelte'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'
export const showBoardSorter = writable(false)

export const openBoardSorter = () => {
  openModal({
    id: 'board-sorter',
    component: BoardSorter,
    componentProps: {},
  })
}

export const useBoardSortModal = () => {
  return [
    () => {
      showBoardSorter.update((s) => true)
    },
    () => {
      showBoardSorter.update((s) => false)
    },
  ]
}
