/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.
 * Nomie 2 supported all sorts of wacky shit
 */

import { Interact } from './interact'
// utils
import Logger from '../utils/log/log'
import clipboard from '../utils/clipboard/clipboard'
import { showToast } from '../components/toast/ToastStore'
// Svelte
import { writable } from 'svelte/store'

// Vendors
const console = new Logger('📲 Device Store')

declare let window: any

export type DeviceSizeType = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const sizes = {
  xs: -1,
  sm: 0,
  md: 350,
  lg: 767,
  xl: 1280,
  '2xl': 1536,
}

// Nomie API Store

const DeviceInfo = {
  appName: navigator.appName,
  appCodeName: navigator.appCodeName,
  appVersion: navigator.appVersion,
  userAgent: navigator.userAgent,
  product: navigator.product,
}
const DeviceInfoString = JSON.stringify(DeviceInfo).toLowerCase()

const getDeviceSize = function (width: number) {
  if (width > sizes.xs && width < sizes.sm) {
    return 'xs'
  } else if (width > sizes.sm && width < sizes.md) {
    return 'sm'
  } else if (width > sizes.md && width < sizes.lg) {
    return 'md'
  } else if (width > sizes.lg && width < sizes.xl) {
    return 'lg'
  } else if (width > sizes.xl) {
    return 'xl'
  }
}

const fontSizes = {
  xs: '0.94em',
  sm: '0.98em',
  md: '1.15em',
  lg: '1.25em',
  xl: '1.4em',
}

const DeviceStoreInit = () => {
  let deviceMatches = DeviceInfoString.match(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i)
  let device = deviceMatches ? deviceMatches[0] : 'browser'

  const baseState = {
    lastUrl: '',
    width: window.innerWidth,
    height: window.innerHeight,
    platform: navigator.platform,
    device: device,
    offline: !navigator.onLine,
    pwa: window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches,
    info: DeviceInfo,
    size: getDeviceSize(window.innerWidth),
    fontSize: localStorage.getItem('fontSize') || 'md',
  }

  const { update, subscribe, set } = writable(baseState)

  ;(document.documentElement.style.fontSize = fontSizes[baseState.fontSize] || '16px'),
    function state(s: any) {
      let _state
      update((state) => {
        _state = { ...state, ...s }
        return _state
      })
      return _state
    }

  const state = (updatedState: any) => {
    update((s: any) => {
      return { ...s, ...updatedState }
    })
  }

  const methods = {
    copy(key: string, message?: string) {
      clipboard(key)
      showToast({ message: message || 'Copied' })
    },
    tempURL(path: string, title: string = '') {
      update((s) => {
        s.lastUrl = document.location.pathname
        return s
      })
      window.history.pushState({}, title, path)
    },
    restoreURL() {
      update((s) => {
        let last = s.lastUrl
        window.history.pushState({}, 'Nomie', last)
        s.lastUrl = undefined
        return s
      })
    },
    isDesktop() {
      return document.body.scrollWidth >= 900
    },
    iOS() {

      if (/iPad|iPhone|iPod/.test(navigator.platform)) {
        return true;
      } else {
        return navigator.maxTouchPoints &&
          navigator.maxTouchPoints > 2 &&
          /MacIntel/.test(navigator.platform);
      }

    },
    scrollToTop() {
      document.body.scrollTop = document.documentElement.scrollTop = 0
    },
    open(url) {
      window.open(`${url}`, '_blank')
    },
    isSmallerThan(size: DeviceSizeType) {
      return window.innerWidth < sizes[size]
    },
    isLargerThan(size: DeviceSizeType) {
      return window.innerWidth > sizes[size]
    },
    reload() {
      window.location.reload()
    },
    is(regex: string | RegExp) {
      if (typeof regex === 'string') {
        regex = new RegExp(regex, 'gi')
      }
      return DeviceInfoString.match(regex)
    },
    init() {
      const fireChange = () => {
        if (navigator.onLine) {
          document.body.classList.remove('is-offline')
          window.offline = false
          state({
            offline: false,
            width: window.innerWidth,
            size: getDeviceSize(window.innerWidth),
            height: window.innerHeight,
          })
        } else {
          document.body.classList.add('is-offline')
          window.offline = true
          state({
            offline: true,
            width: window.innerWidth,
            size: getDeviceSize(window.innerWidth),
            height: window.innerHeight,
          })
        }
      }
      window.addEventListener('online', fireChange)
      window.addEventListener('offline', fireChange)
      window.addEventListener('resize', fireChange)
      fireChange()
    },
  }

  return {
    subscribe,
    update,
    set,
    ...methods,
    info: DeviceInfo,
  }
}

export const Device = DeviceStoreInit()

export const setFontSize = (size: 'sm' | 'md' | 'lg' | 'xl' | 'xs' | string) => {
  const pixels = fontSizes[size] || '16px'
  localStorage.setItem('fontSize', size)
  document.documentElement.style.fontSize = pixels
  Device.update((s) => {
    s.fontSize = size
    return s
  })
}
