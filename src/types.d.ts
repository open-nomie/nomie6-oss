/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module '*.svelte' {
  export const value
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'canvas-confetti'
declare module 'rangeslider-pure'

declare let snarkdown: any

declare module 'virtual:pwa-register/svelte' {
  // @ts-ignore ignore when svelte is not installed
  import { Writable } from 'svelte/store'

  export type RegisterSWOptions = {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: Writable<boolean>
    offlineReady: Writable<boolean>
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}
