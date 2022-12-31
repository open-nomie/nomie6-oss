import { writable } from 'svelte/store'
import type { NormalizedSubscriptionType } from '../firebase/FirebaseStore'


export type PermissionsState = {
  canRead: boolean
  canWrite: boolean
  canAPI: boolean,
  subscriptions: Array<NormalizedSubscriptionType>,
  ready: boolean,
  loggedIn: boolean
}

type MetaDataType = {
  [key: string]: any
}


const baseState: PermissionsState = {
  canRead: false,
  canWrite: false,
  canAPI: false,
  subscriptions: [],
  ready: false,
  loggedIn: false
}

/* Creating a writable store that can be updated by the functions below. */
export const PermissionsStore = writable<PermissionsState>(baseState)

/**
 * It gets the current state of the permissions store and returns it
 * @returns The current state of the PermissionsStore
 */
export const getRawPermissions = (): PermissionsState => {
  let state: PermissionsState
  PermissionsStore.update((s) => {
    state = s
    return s
  })
  return state
}




/**
 * It resets the PermissionsStore to its base state
 */
export const resetPermissionStore = () => {
  PermissionsStore.update((s) => baseState)
}


/**
 * It takes a meta object, and updates the PermissionsStore with it
 * @param meta - { canRead: boolean; canWrite: boolean; canAPI: boolean }
 */
export const injectSubscriptionPermissions = (meta: PermissionsState) => {
  PermissionsStore.update((ps)=>{
    return {
      ...ps,
      ...meta
    }
  })

}

export const cleanSubscriptionMeta = (meta: MetaDataType): Array<{ key: string; value: any }> => {
  let keys: Array<{ key: string; value: any }> = []

  Object.keys(meta).forEach((key) => {
    let value = meta[key]
    let numVal = parseFloat(value)
    if (value === 'true') {
      meta[key] = true
    } else if (value === 'false') {
      meta[key] = false
    } else if (!isNaN(numVal)) {
      meta[key] = numVal
    }
    keys.push({ key: key, value: meta[key] })
  })
  return keys
}

