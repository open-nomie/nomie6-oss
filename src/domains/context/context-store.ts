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
import { createArrayStore } from '../../store/ArrayStore'
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

// Nomie API Store

// const ContextInit = () => {
//   const ContextState: Array<ContextClass> = []
//   const { update, subscribe, set } = writable(ContextState)

//   const methods = {
//     async init() {
//       let context = await methods.get()
//       update((d) => context)
//       return context
//     },
//     async get(): Promise<Array<ContextClass>> {
//       let context = await Storage.get(NPaths.storage.context())
//       const ctxs = (context || [])
//         .map((c) => {
//           if (typeof c === 'string' || Object.keys(c).length > 0) return new ContextClass(c)
//           return undefined
//         })
//         .filter((s) => s)
//       return ctxs
//     },
//     // Search for Context
//     async searchForContext() {
//       // Get Context from search function
//       let contexts = await searchForContext()
//       // If we have results
//       if (contexts.length) {
//         // Confirm the user wants to import them
//         const confirmed = await Interact.confirm(`${contexts.length} context found`, 'Add them to your list?')
//         if (confirmed) {
//           // We have confirmed.
//           try {
//             // Get Existing
//             let existing = await methods.get()
//             // Create final array - make it unique
//             let final: Array<any> = array_utils.unique([...existing, ...contexts])
//             // Write this to storage
//             update((state) => {
//               state = final
//               return state
//             })
//             await methods.write(final)
//             Interact.alert('👍 Context list updated!')
//           } catch (e) {
//             console.error(e)
//             Interact.alert('Error', e.message)
//           }
//         }
//       } else {
//         Interact.alert(`Sorry, no context found in the last 6 months`)
//       }
//     },
//     async upsertContext(context: ContextClass) {
//       update((ctxs) => {
//         let updatedCtxs = [...ctxs]
//         let foundIndex = updatedCtxs.findIndex((c) => c.tag === context.tag)
//         if (foundIndex > -1) {
//           updatedCtxs[foundIndex] = context
//         } else {
//           updatedCtxs.push(context)
//         }
//         methods.write(updatedCtxs)
//         return updatedCtxs
//       })
//     },
//     async saveContextArray(contextArray: Array<ContextClass>) {
//       update((s) => contextArray)
//       return methods.write(contextArray)
//     },

//     // async save(contextArray: Array<Token>) {
//     //   update((context: Array<string>) => {
//     //     let changed = false
//     //     contextArray.forEach((contextElement) => {
//     //       if (context.indexOf(`${contextElement.id}`) == -1) {
//     //         changed = true
//     //         context.push(`${contextElement.id}`)
//     //       }
//     //     })
//     //     if (changed) {
//     //       this.write(context)
//     //     }
//     //     return context
//     //   })
//     // },
//     async write(payload: Array<ContextClass>) {
//       return Storage.put(
//         NPaths.storage.context(),
//         payload.map((ctxClass) => {
//           return ctxClass.asObject
//         })
//       )
//     },
//   }

//   return {
//     update,
//     subscribe,
//     set,
//     ...methods,
//   }
// }

export const ContextStore = createArrayStore(NPaths.storage.context(), {
  key: 'tag',
  label: 'Context',
  itemInitializer: (item) => {
    return new ContextClass(item)
  },
  itemSerializer: (item: ContextClass) => {
    return item.asObject
  },
})
