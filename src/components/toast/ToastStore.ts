import { writable } from 'svelte/store'

export type ToastType = {
  message: string
  buttonLabel?: string
  buttonClick?: Function
  timeout?: number
  type?: 'success' | 'failure'
}

export const ToastStore = writable<Array<ToastType>>([])

export const removeToast = (toast: ToastType) => {
  ToastStore.update((s) => {
    return s.filter((t) => t !== toast)
  })
}

export const showToast = (toast: ToastType) => {
  ToastStore.update((s) => {
    s.push(toast)
    return s
  })
  setTimeout(() => {
    ToastStore.update((s) => {
      return s.filter((t) => t !== toast)
    })
  }, toast.timeout || 2000)
}
