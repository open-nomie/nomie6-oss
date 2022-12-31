import { writable } from 'svelte/store'
import { getElementPosition } from '../../modules/html-elements/position'
import nid from '../../modules/nid/nid'
import { DropdownMenuStore } from './dropdown-menu.store'
import type { PopMenuButton } from '../pop-menu/usePopmenu'

type DropMenuType = {
  id: string
  buttons: Array<PopMenuButton>
  left: number
  top: number
  opener: HTMLElement
}
type DropmenuStateType = {
  menus: Array<DropMenuType>
}

export const MenuBlockerStore = writable(false)
export const showMenuBlocker = () => {
  MenuBlockerStore.update((b) => true)
}
export const hideMenuBlocker = () => {
  MenuBlockerStore.update((b) => false)
}
const dropmenuInitialState: DropmenuStateType = {
  menus: [],
}
export const DropmenuStore = writable(dropmenuInitialState)

export const openDropMenu = (opener: HTMLElement, buttons: Array<PopMenuButton>): any => {
  const menuId = nid()
  DropdownMenuStore.present(buttons, opener)

  // const position = getElementPosition(opener)
  // DropmenuStore.update((s) => {
  //   if (!s.menus.find((m) => m.opener === opener)) {
  //     const menu = {
  //       id: menuId,
  //       top: position.top + position.eleHeight,
  //       left: position.left,
  //       buttons: buttons,
  //       opener,
  //     }

  //     s.menus.push(menu)
  //   }
  //   return s
  // })
  // return () => {
  //   DropmenuStore.update((s) => {
  //     s.menus = s.menus.filter((m) => m.id === menuId)
  //     return s
  //   })
  // }
}

export const closeDropMenu = (id: string) => {
  DropmenuStore.update((s) => {
    s.menus = s.menus.filter((m) => m.id !== id)
    return s
  })
}
