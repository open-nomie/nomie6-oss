import Storage from '../domains/storage/storage'
import { writable } from 'svelte/store'

type DocStorePropTypes = {
  label: string
  key: string
  itemInitializer?: Function
  itemSerializer?: Function
  initialized?: Function
}

export type KVStoreState = {
  [key: string]: any
}

export const kvToArray = (obj: KVStoreState) => {
  return Object.keys(obj).map((key) => {
    return obj[key]
  })
}

/**
 * Create a Key Value Store
 * // Like People
 * @param path
 * @param props
 * @returns
 */
export const createKVStore = (path: string, props: DocStorePropTypes) => {
  const baseState: KVStoreState = {}
  const { update, subscribe, set } = writable(baseState)
  let data: any = {}

  /**
   * Initialize the Store
   */
  const init = async (_data?:any): Promise<KVStoreState> => {
    // Get the Map From Storage
    const map = (await Storage.get(path)) || {}
    data = _data || {};
    // Loop over each time
    // initialize if there's an initializer
    Object.keys(map).forEach((key: string) => {
      if (props.itemInitializer) {
        map[key] = props.itemInitializer(map[key], key)
      }
    })
    update((s) => map)

    if(props.initialized) {
      props.initialized(map, data);
    }
    return map
  }

  /**
   * Write to Storage
   * @param state
   * @returns
   */
  const _write = async (state: KVStoreState): Promise<KVStoreState> => {
    // Clone State
    // const serverState = await _read();
    // Try pulling from server for anything not on this device
    const _state = state;

    // Loop over keys and serialize if serializer
    Object.keys(_state).map((key) => {
      const item = props.itemSerializer ? props.itemSerializer(_state[key]) : state[key]
      _state[key] = item
    })
    // Save to Storage
    await Storage.put(path, _state)
    return state
  }

  /**
   * Upsert and Item
   * @param item
   * @returns  Promise KVStore
   */
  const upsert = async (item: any): Promise<KVStoreState> => {
    let state
    update((s) => {
      const key = item[props.key]
      s[key] = props.itemInitializer ? props.itemInitializer(item) : item
      state = s
      return s
    })
    return await _write(state)
  }

  /**
   * Upsert Many Items
   * @param items
   * @returns Promise KVStore
   */
  const upsertMany = async (items: KVStoreState): Promise<KVStoreState> => {
    let state
    update((s) => {
      Object.keys(items).forEach((key) => {
        const item = items[key]
        s[key] = props.itemInitializer ? props.itemInitializer(item) : item
      })
      state = s
      return s
    })
    return await _write(state)
  }

  /**
   * Update Sync
   * Updates the state and writes to storage
   * @param kvItems
   * @returns promise KVStoreState
   */
  const updateSync = async (updateFunc: Function): Promise<KVStoreState> => {
    let state: KVStoreState
    update((s) => {
      state = updateFunc(s)
      return state
    })
    return await _write(state)
  }

  /**
   * Remove an Item
   * @param item
   * @returns
   */
  const remove = async (item: any): Promise<KVStoreState> => {
    let state
    update((s) => {
      let key = item[props.key]
      if (key && s[key]) {
        delete s[key]
      }
      state = s
      return s
    })

    return await _write(state)
  }

  /**
   * Get Raw State
   * @returns KVStoreState
   */
  const rawState = (): KVStoreState => {
    let state: KVStoreState
    update((s) => {
      state = s
      return s
    })
    return state
  }

  // Return base methods
  return {
    init,
    upsert,
    upsertMany,
    remove,
    update,
    updateSync,
    subscribe,
    set,
    rawState,
  }
}
