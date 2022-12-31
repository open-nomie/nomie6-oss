import { writable } from 'svelte/store'

type DocStorePropTypes = {
  label?: string
  itemInitializer?: Function
  itemSerializer?: Function
  default?: any
}

export type LSStoreState = {
  [key: string]: any
}

/**
 * Create a Key Value Store
 * // Like People
 * @param path
 * @param props
 * @returns
 */
export const createLSStore = (path: string, props: DocStorePropTypes = {}) => {
  const baseState: LSStoreState = JSON.parse(localStorage.getItem(path) || JSON.stringify(props.default || {}))
  const { update, subscribe, set } = writable(baseState)

  /**
   * Write to Storage
   * @param state
   * @returns
   */
  const _write = (state: LSStoreState): LSStoreState => {
    // Clone State
    const _state = { ...state }

    // Loop over keys and serialize if serializer
    Object.keys(state).map((key) => {
      const item = props.itemSerializer ? props.itemSerializer(state[key]) : state[key]
      _state[key] = item
    })

    // Save to Storage
    localStorage.setItem(path, JSON.stringify(_state))
    return _state
  }

  /**
   * Upsert and Item
   * @param item
   * @returns  Promise KVStore
   */
  const setItem = (key: string, item: any): LSStoreState => {
    let state
    update((s) => {
      s[key] = props.itemInitializer ? props.itemInitializer(item) : item
      state = s
      return s
    })
    return _write(state)
  }

  /**
   * Update Sync
   * Updates the state and writes to storage
   * @param kvItems
   * @returns promise LSStoreState
   */
  const updateSync = (updateFunc: Function): LSStoreState => {
    let state: LSStoreState
    update((s) => {
      state = updateFunc(s)
      return state
    })
    return _write(state)
  }

  /**
   * Remove an Item
   * @param item
   * @returns
   */
  const removeItem = (key: string): LSStoreState => {
    let state
    update((s) => {
      if (s[key]) {
        delete s[key]
      }
      state = s
      return s
    })
    return _write(state)
  }

  /**
   * Get Raw State
   * @returns LSStoreState
   */
  const rawState = (): LSStoreState => {
    let state: LSStoreState
    update((s) => {
      state = s
      return s
    })
    return state
  }

  // Return base methods
  return {
    removeItem,
    setItem,
    update,
    updateSync,
    subscribe,
    set,
    rawState,
  }
}
