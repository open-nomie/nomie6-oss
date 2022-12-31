import { SideStore } from '../../domains/storage/side-storage'
import type { StorageTypes } from '../../domains/storage/storage'
import { writable } from 'svelte/store'

import { showToast } from '../../components/toast/ToastStore'

export type ThemeTypes = 'dark' | 'light' | 'auto'
export type PrefsWeekStartTypes = 'sunday' | 'monday'

export type PreferencesStateType = {
  use24hour?: boolean
  useMetric?: boolean
  usePin?: string
  storageType?: StorageTypes
  betaFeatures?: boolean
  peopleBoard?: boolean
  contextBoard?: boolean
  allBoard?: boolean
  nowBoard?: boolean
  theme?: 'dark' | 'light' | 'auto'
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  language?: string
  weekStarts?: PrefsWeekStartTypes
  compactTrackers?: boolean
  hideBackupMessage?: boolean
  backupDays: number
  hideMessages?: boolean
  allowFileEdit?: boolean
  lastBackup?: string
  alwaysLocate?: boolean
  onboarded?: boolean
  startPage?: 'track' | 'timeline' | 'history' | 'goals' | 'dashboard'
}

const sideStorage = new SideStore('preferences')
const InitialState: PreferencesStateType = sideStorage.get('state') || {
  use24hour: false,
  useMetric: false,
  usePin: undefined,
  storageType: undefined,
  betaFeatures: false,
  peopleBoard: false,
  contextBoard: false,
  allBoard: false,
  nowBoard: false,
  startPage: 'track',
  theme: 'auto',
  fontSize: 'md',
  language: 'en-us',
  weekStarts: 'sunday',
  compactTrackers: false,
  lastBackup: undefined,
  backupDays: 7,
  hideBackupMessage: false,
  hideMessages: false,
  allowFileEdit: false,
  alwaysLocate: true,
}

export const Prefs = writable(InitialState)
let localPrefs = InitialState

Prefs.subscribe((s: PreferencesStateType) => {
  localPrefs = s
  sideStorage.put('state', s)
})

export const getRawPrefs = (): PreferencesStateType => {
  return sideStorage.get('state')
}

export const enabledBetaFeatures = async (): Promise<void> => {
  Prefs.update((p) => {
    p.betaFeatures = true
    return p
  })
  showToast({ message: 'Beta Features Enabled', type: 'success' })
}

/**
 * Sets the Theme of the Browser
 * Does this by applying .mode-dark .mode-light to the Body
 * It will also check for auto
 * @param theme
 */
export const setDocumentTheme = (theme: ThemeTypes) => {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  let themeToSet = theme
  if (theme === 'auto') {
    themeToSet = isDarkMode ? 'dark' : 'light'
  }
  document.documentElement.className = ''
  document.documentElement.classList.add(`mode-${themeToSet}`)
  document.documentElement.classList.add(`${themeToSet}`)
}

export const getDateFormats = (): {
  time: string
  date: string
  dateDay: string
  shortDate: string
  tinyDate: string
  hour: string
  mmm_d_yyyy: string
  hourCompact: string
  tinyNumber: string
  monthYear: string
} => {
  let format: {
    time: string
    date: string
    dateDay: string,
    shortDate: string
    tinyDate: string
    mmm_d_yyyy: string
    hourCompact: string
    hour: string
    tinyNumber: string
    monthYear: string
  } = {
    time: 'h:mm A',
    hour: 'h A',
    hourCompact: 'ha',
    date: 'MMM Do YYYY',
    dateDay: 'ddd MMM Do YYYY',
    shortDate: 'M/D/YYYY',
    tinyDate: 'MMM D',
    mmm_d_yyyy: 'MMM D, YYYY',
    tinyNumber: 'M/D',
    monthYear: 'MMM YYYY'
  }
  if (localPrefs.use24hour) {
    format = {
      time: 'HH:mm',
      hour: 'HH00',
      date: 'Do MMM YYYY',
      dateDay: 'ddd Do MMM YYYY',
      hourCompact: 'HH',
      shortDate: 'D MM YYYY',
      tinyDate: 'D MMM',
      mmm_d_yyyy: 'D MMM, YYYY',
      tinyNumber: 'D/M',
      monthYear: 'MMM YYYY'
    }
  }
  return format
}

export const getStorageType = (): StorageTypes => {
  return localPrefs.storageType
}

export const saveStorageType = (type: StorageTypes) => {
  Prefs.update((s) => {
    s.storageType = type
    return s
  })
}
