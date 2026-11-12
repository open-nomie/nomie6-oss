/**
 * Context Store
  Context are like categories, or "soft tags", things that help you group
  posts and content. 
 */

import { ContextClass } from './context-class'
// Stores
import { Interact } from '../../store/interact'
import { LedgerStore } from '../ledger/LedgerStore'
// utils
import Logger from '../../utils/log/log'
import NPaths from '../../paths'
// Vendors
import Storage from '../../domains/storage/storage'
import array_utils from '../../utils/array/array_utils'
import { createKVStore } from '../../store/KVStore'
import dayjs from 'dayjs'
// Svelte
import { writable } from 'svelte/store'

// Get Config

const console = new Logger('🗺 $ContextStore')

const searchForContext = async () => {
  let contexts: Array<string> = []
  Interact.blocker('Finding context...')
  try {
    const logs = await LedgerStore.query({
      start: dayjs().subtract(6, 'month'),
    })
    logs.forEach((log) => {
      log.getMeta().context.forEach((context) => {
        contexts.push(context.id)
      })
    })
  } catch (e) {
    console.error(e)
    Interact.alert('Error', e.message)
  }
  Interact.stopBlocker()
  return array_utils.unique(contexts)
}



export const ContextStore = createKVStore(NPaths.storage.context(), {
  key: 'tag',
  label: 'Context',
  itemInitializer: (item: any) => {
    return new ContextClass(item)
  },
  itemSerializer: (item: ContextClass) => {
    return item.asObject
  },
})
