import Storage from '../domains/storage/storage'
import { writable } from 'svelte/store'

type DocStorePropTypes = {
  label: string
  key: string
  itemInitializer?: Function
  itemSerializer?: Function,
  onInitalized?(items:Array<any>, data?:any):void
}

export type ArrayStoreState = Array<any>

/**
 * Create a Key Value Store
 * // Like People
 * @param path
 * @param props
 * @returns
 */
export const createArrayStore = (path: string, props: DocStorePropTypes) => {
  const baseState: ArrayStoreState = []
  const { update, subscribe, set } = writable(baseState)
  let data: any = {};
  /**
   * Initialize the Store
   */
  const init = async (_data?:any): Promise<ArrayStoreState> => {
    // If any data passed, save it for later
    data = _data
    // Get the Map From Storage
    const items = ((await Storage.get(path)) || []).map((item: any) => {
      if (props.itemInitializer) return props.itemInitializer(item)
      return item
    })

    update((s) => items)
    if(props.onInitalized) props.onInitalized(items, data);
    return items   
  }

  /**
   * Write to Storage
   * @param state
   * @returns
   */
  const _write = async (state: ArrayStoreState): Promise<ArrayStoreState> => {
    // Clone State
    // const fromStorage = await init();
    const stateToWrite = state.map((item) => {
      const i = props.itemSerializer ? props.itemSerializer(item) : item
      return i
    })
    await Storage.put(path, stateToWrite)
    return state
  }

  /**
   * Upsert and Item
   * @param item
   * @returns  Promise KVStore
   */
  const upsert = async (item: any): Promise<ArrayStoreState> => {
    let state: ArrayStoreState
    update((s) => {
      state = [...upsertArrayItem(s, item, props.key)]

      return state
    })
    return await _write(state)
  }

  const upsertArrayItem = (arr: Array<any>, item: any, keyName: string): ArrayStoreState => {
    let found: boolean = false
    let newArray = arr.map((loopItem) => {
      let loopKey = loopItem[keyName]
      let itemKey = item[keyName]
      if (loopKey == itemKey) {
        found = true
        return item
      } else {
        return loopItem
      }
    })
    if (!found) {
      newArray.push(item)
    }
    return newArray
  }

  /**
   * Upsert Many Items
   * @param items
   * @returns Promise KVStore
   */
  const upsertMany = async (items: ArrayStoreState): Promise<ArrayStoreState> => {
    let state
    update((s) => {
      state = s
      items.forEach((item) => {
        state = upsertArrayItem(state, item, props.key)
      })
      return [...state]
    })
    return await _write(state)
  }

  /**
   * Update Sync
   * Updates the state and writes to storage
   * @param kvItems
   * @returns promise ArrayStoreState
   */
  const updateSync = async (updateFunc: Function): Promise<ArrayStoreState> => {
    let state: ArrayStoreState
    update((s) => {
      state = updateFunc(s)
      return [...state]
    })
    return await _write(state)
  }

  /**
   * Remove an Item
   * @param item
   * @returns
   */
  const remove = async (item: any): Promise<ArrayStoreState> => {
    let state
    update((s) => {
      state = s.filter((s) => {
        return s[props.key] !== item[props.key]
      })
      return [...state]
    })
    return await _write(state)
  }

  /**
   * Get Raw State
   * @returns ArrayStoreState
   */
  const rawState = (): ArrayStoreState => {
    let state: ArrayStoreState
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
