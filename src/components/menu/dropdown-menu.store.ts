import { writable } from 'svelte/store'

import type { PopMenuButton } from '../pop-menu/usePopmenu'

interface DropdownState {
  visible: boolean
  caller?: Element
  buttons: Array<PopMenuButton>
  onClick?: Function
  onCancel?: Function
  title?: string
  emoji?: string
}

function createDropdownMenu() {
  let state: DropdownState = {
    visible: false,
    buttons: [],
    caller: undefined,
  }
  const { subscribe, set, update } = writable(state)

  async function present(buttons: Array<PopMenuButton>, caller?: Element) {
    update((state) => {
      state.buttons = buttons
      state.caller = caller
      state.visible = true
      return state
    })
  }

  // function ok() {
  //   update((state) => {
  //     if (state.onClick) {
  //       state.onClick()
  //     }
  //     state.visible = false
  //     state.onClick = undefined
  //     return state
  //   })
  // }

  function cancel() {
    update((state) => {
      if (state.onCancel) {
        state.onCancel()
      }
      state.visible = false
      state.onClick = undefined
      state.onCancel = undefined
      return state
    })
  }

  function close() {
    update((state) => {
      state.visible = false
      state.title = undefined
      state.buttons = []
      state.emoji = undefined
      state.onCancel = undefined
      state.onClick = undefined
      return state
    })
  }

  return {
    subscribe,
    update,
    set,
    cancel,
    present,
    close,
  }
}

export const DropdownMenuStore = createDropdownMenu()
