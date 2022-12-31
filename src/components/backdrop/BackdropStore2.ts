import { derived, writable } from 'svelte/store'

export type BackdropItemType = {
  id: string
  position?: 'top' | 'bottom' | 'center' | 'fullscreen' | 'real-fullscreen'
  component: any
  componentProps?: any
  tappable?: Boolean
  transparent?: Boolean
  onClose?: Function
}

export const BackdropStore2 = writable<Array<BackdropItemType>>([])

export const ActiveBackdropId = derived(BackdropStore2, ($BackdropStore2) => {
  let last = $BackdropStore2[$BackdropStore2.length - 1]
  if (last) {
    return last.id
  } else {
    return undefined
  }
})

/**
 * Open a Modal
 * @param options BackdropItemTyp
 */
export const openModal = (options: BackdropItemType) => {
  BackdropStore2.update((s) => {
    const foundIndex = s.findIndex((modal) => modal.id === options.id)
    const foundModal = s[foundIndex]
    if (foundIndex > -1) {
      s = s.filter((modal, index) => index !== foundIndex)
      s.push(foundModal)
    } else {
      s.push(options)
    }

    // Device.tempURL(`/modal/${options.id}`, options.id)

    return s
  })
}

/**
 * Close a Modal
 * @param identifier ID
 */
export const closeModal = (identifier: string | BackdropItemType) => {
  const id = typeof identifier === 'string' ? identifier : identifier.id
  // Device.restoreURL()
  BackdropStore2.update((s) => {
    // Find the Index and Modal
    const modalIndex = s.findIndex((m) => m.id === id)
    const modal = modalIndex > -1 ? s[modalIndex] : undefined

    // If it has an OnClose call back - call that
    if (modal && modal.onClose) {
      modal.onClose()
    }
    // return to the store a filtered list without this modal id
    return s.filter((m) => m !== modal)
  })
}
