import PopMenu2 from './pop-menu2.svelte'
import type { Trackable } from '../../domains/trackable/Trackable.class'
import { getDatePopButtons } from '../../modules/pop-buttons/pop-buttons'
import { openModal } from '../backdrop/BackdropStore2'
import { writable } from 'svelte/store'
import type { SvelteComponentDev } from 'svelte/internal'

export type PopMenuButton = {
  id?: string
  title?: string
  description?: string
  emoji?: string
  icon?: any
  checked?: boolean
  disabled?: boolean
  right?: string
  click?: Function
  divider?: boolean
  skipClosing?: boolean
  awardRequired?: string,
  component?: SvelteComponentDev
}

export type IPopMenuOptions = {
  id: string
  show?: boolean
  buttons: Array<any>
  title?: string
  component?: any
  componentProps?: any
  description?: string
  trackable?: Trackable
  headerRightIcon?: any
  headerRightIconClick?: Function
  buttonView?: 'list' | 'grid'
}

const PopMenuInitialState: IPopMenuOptions = {
  id: 'unknown',
  show: false,
  title: null,
  description: null,
  buttons: [],
  component: undefined,
  componentProps: undefined,
  buttonView: 'list',
  trackable: undefined as undefined | Trackable,
  headerRightIcon: undefined,
  headerRightIconClick: undefined,
}

export const PopMenuStore = writable<Array<IPopMenuOptions>>([])
export const openPopMenu = (options: IPopMenuOptions) => {
  openModal({
    id: `popmenu-${options.id}`,
    component: PopMenu2,
    tappable: true,
    componentProps: {
      menu: options,
    },
    position: 'bottom',
  })

  // PopMenuStore.update((s) => {
  //   s.push(options)
  //   return s
  // })
}

export const closePopMenu = (menu: IPopMenuOptions) => {
  PopMenuStore.update((s) => {
    if (menu) s = s.filter((pm) => pm !== menu)
    if (!menu) s.pop()
    return s
  })
}

export const closeAllPopMenus = () => {

  PopMenuStore.update((s) => undefined)
}

export const openDateOptionPopMenu = (date: Date, extraButtons:Array<PopMenuButton>=[]) => {
  const buttons = getDatePopButtons(date)
  openPopMenu({
    id: `date-options-${date.toDateString()}`,
    title: `Date Options`,
    buttons: [...buttons, ...extraButtons ],
  })
}
