import appConfig from '../../config/appConfig'

/**
 * Local Settings
 * Some settings live in the browser's localStorage instead of the storage engine,
 * so a storage archive alone would not include them. This module copies an
 * allow-list of them into the backup and back again.
 *
 * Never included: PIN, storage type (device specific), AI API keys and any
 * server tokens. Restoring keeps this device's values for all of those.
 */

export const PREFERENCES_KEY = `${appConfig.data_root}/localDB/preferences`

// Settings that are safe to carry between devices
export const LOCAL_SETTING_KEYS = [PREFERENCES_KEY, '/goal-status', 'timeline-settings', 'fontSize', 'n4-lang']

// Preference fields that are device specific or secret
const DEVICE_ONLY_PREFS = ['usePin', 'storageType', 'lastBackup']

export type LocalSettings = { [key: string]: string }

const safeParse = (value: string | null): any => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch (e) {
    return null
  }
}

/**
 * Remove secrets and device specific fields from the preferences state
 */
export const sanitizePreferences = (prefs: any): any => {
  if (!prefs || typeof prefs !== 'object') return prefs
  const clean = { ...prefs }
  DEVICE_ONLY_PREFS.forEach((key) => delete clean[key])
  if (clean.ai && typeof clean.ai === 'object') {
    // Keep which provider is chosen, but never keys or their encryption flags
    const { services, ...aiWithoutServices } = clean.ai
    clean.ai = aiWithoutServices
  }
  return clean
}

/**
 * Collect the allow-listed settings from localStorage
 */
export const collectLocalSettings = (store: Storage = localStorage): LocalSettings => {
  const settings: LocalSettings = {}
  LOCAL_SETTING_KEYS.forEach((key) => {
    const value = store.getItem(key)
    if (value === null) return
    if (key === PREFERENCES_KEY) {
      const sideStore = safeParse(value)
      if (sideStore && sideStore.state) {
        settings[key] = JSON.stringify({ ...sideStore, state: sanitizePreferences(sideStore.state) })
      }
    } else {
      settings[key] = value
    }
  })
  return settings
}

/**
 * Write settings from a backup back into localStorage.
 * Preferences are merged so this device keeps its PIN, storage type and AI keys.
 */
export const restoreLocalSettings = (
  settings: LocalSettings | undefined,
  store: Storage = localStorage,
  keepExisting: boolean = false
): number => {
  if (!settings || typeof settings !== 'object') return 0
  let restored = 0
  Object.keys(settings).forEach((key) => {
    if (!LOCAL_SETTING_KEYS.includes(key)) return // ignore anything not on the allow-list
    if (keepExisting && store.getItem(key) !== null) return // this device already has its own value
    const value = settings[key]
    if (typeof value !== 'string') return
    if (key === PREFERENCES_KEY) {
      const incoming = safeParse(value)
      if (!incoming || !incoming.state) return
      const current = safeParse(store.getItem(key)) || {}
      const currentState = current.state || {}
      const incomingState = sanitizePreferences(incoming.state)
      const state = { ...currentState, ...incomingState }
      // Keep this device's secret and device-specific values
      DEVICE_ONLY_PREFS.forEach((k) => {
        if (k in currentState) state[k] = currentState[k]
        else delete state[k]
      })
      if (currentState.ai || incomingState.ai) {
        state.ai = { ...(incomingState.ai || {}), services: currentState.ai?.services }
        if (!state.ai.services) delete state.ai.services
      }
      store.setItem(key, JSON.stringify({ ...current, ...incoming, state }))
    } else {
      store.setItem(key, value)
    }
    restored++
  })
  return restored
}
