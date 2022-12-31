// import type { LastUsedItem, LastUsedItems } from './last-used-utils'

// import { Interact } from '../../store/interact'
// import { Lang } from '../../store/lang'
// import { LedgerStore } from './LedgerStore'
// import type NLog from '../nomie-log/nomie-log'
// import NPaths from '../../paths'
// // utils
// import NStorage from '../../domains/storage/storage'
// import type { Token } from '../../modules/tokenizer/lite'
// import { adjustLastUsedStreak } from './last-used-utils'
// import dayjs from 'dayjs'
// import { getBookIdFromDate } from './ledger-books-to-get'
// import { getTrackablesFromStorage } from '../trackable/TrackableStore'
// import logsToTrackableUsage from '../usage/usage-utils'
// import { showToast } from '../../components/toast/ToastStore'
// import { trackableUsageToStreak } from '../steak/streak-helper'
// import { writable } from 'svelte/store'

// /**
//  * Last Used Store
//  * Used for reading and writing the last time a tracker was used
//  * this way we don't have to go through all of the books
//  * to find the last instance
//  */
// const LastUsedStore = () => {
//   const state: LastUsedItems = {}
//   const { update, subscribe, set } = writable(state)

//   const methods = {
//     /**
//      * Init the Last Use Store
//      */
//     async init() {
//       // Get from storage
//       let fromStore = (await NStorage.get(NPaths.storage.lastUsage())) || {}
//       // Update state
//       console.log("Last Used INitialized")
//       update((state: LastUsedItems) => {
//         state = fromStore
//         return state
//       })
//     },
//     /**
//      * Get Last Used for a specific item
//      * @param tag Tracker Tag
//      * @param type
//      */
//     // async get(tag: string, type?: Token) {
//     //   let found
//     //   // Find if it exists in the last used
//     //   update((state) => {
//     //     if (state.hasOwnProperty(tag)) {
//     //       found = state[tag]
//     //     }
//     //     return state
//     //   })
//     //   // If found - return the date
//     //   if (found) {
//     //     return new Date(found.date)
//     //   } else {
//     //     // Not found? Lets query the ledger for the last 6 months
//     //     let logs = await LedgerStore.queryTag(tag, dayjs().subtract(6, 'month').toDate(), new Date())
//     //     if (logs) {
//     //       // await recordLastUsed(logs[0])
//     //       return new Date(logs[0].end)
//     //     }
//     //     return null
//     //   }
//     // },
//     /**
//      * Force Update All Last Used
//      * this will look for the last 6 months
//      * and then put the most recent items as the last
//      * used date
//      */
//     async updateAll(): Promise<any> {
//       // Ate you sure?
//       const confirmed = await Interact.confirm(
//         `${Lang.t('tracker.update-all-tracker-last-used', 'Update last used dates on all trackers?')}`
//       )
//       if (confirmed) {
//         // Block user
//         Interact.blocker(`${Lang.t('general.loading', 'Loading...')}`)
//         // Get all trackers
//         let trackables = await getTrackablesFromStorage()
//         // Get logs for last 1 year
//         let logs = await LedgerStore.query({
//           start: dayjs().subtract(2, 'year'),
//         })
//         // Loop over logs expand and filter
//         logs = (logs || [])
//           .map((log) => log.expand())
//           .sort((l1, l2) => {
//             // Sort by oldest first
//             return l2.end < l1.end ? 1 : -1
//           })

//         // init final holder
//         let final: LastUsedItems = {}
//         const usages = logsToTrackableUsage(logs, { trackables })
//         Object.keys(usages).forEach((tag) => {
//           const tu = usages[tag]
//           const streakDetails = trackableUsageToStreak(tu)
//           const lastLog = tu.logs[tu.logs.length - 1]

//           if (!lastLog) {
//             console.error(`${tu.trackable.label} has no lastlog value`)
//             // If we have a log, and it's an official trackable
//           } else if (trackables[tag]) {
//             final[tag] = {
//               date: tu.dates[tu.dates.length - 1].toDate(),
//               book: tu.logs[tu.logs.length - 1].bookId,
//               log: tu.logs[tu.logs.length - 1]._id,
//               value: lastLog.getTrackerValue(tag),
//               streak: streakDetails.streak,
//               streakStart: streakDetails.streakStart,
//               pastStreaks: streakDetails.pastStreaks,
//             }
//           }
//         })

//         // Save to storage

//         await NStorage.put(NPaths.storage.lastUsage(), final)

//         // Update Store
//         update((state) => {
//           state = final
//           return state
//         })

//         // Interact with User
//         Interact.stopBlocker()
//         showToast({ message: `${Lang.t('general.update-complete', 'Update complete')}` })
//       }
//     },
//     data() {
//       let data
//       update((d) => {
//         data = d
//         return d
//       })
//       return data
//     },
//     /**
//      * Save the Last Updated on array of trackers
//      * LastUsed.record(['tag1','tag2','tag4']);
//      */
//   }

//   return {
//     update,
//     subscribe,
//     set,
//     ...methods,
//   }
// }

// export const LastUsed = LastUsedStore()

// /**
//  * Record the last use of this Log
//  * @param log
//  */
// // export const recordLastUsed = async (log: NLog) => {
// //   // Get tracker tags as array
// //   let trackables = log.getTrackables({})

// //   // Load up the Last Records to keep everything up-to-date.
// //   let fromStore: LastUsedItems = (await NStorage.get(NPaths.storage.lastUsage())) || {}
// //   console.log({fromStore});
// //   let updatedForStore = { ...fromStore }
// //   let logDate = log.end

// //   // Loop over trackables
// //   trackables.forEach((trackable) => {
// //     // Get last one from storage
// //     // Check if we have an older id if its null
// //     let previous: LastUsedItem = fromStore[trackable.tag]
// //     let oldId: string = trackable.tag.replace(/(\#|\@|\+)/gi, '')
// //     if (!previous && fromStore[oldId]) {
// //       previous = fromStore[oldId]
// //     }

// //     // Set the new updated by adjusting the streak
// //     const updated = adjustLastUsedStreak({
// //       previous,
// //       updated: {
// //         book: getBookIdFromDate(logDate),
// //         value: trackable.value,
// //         log: log._id,
// //         date: logDate,
// //       },
// //     })

// //     if (updated.streak > (previous?.streak || 1)) {
// //       setTimeout(() => {
// //         showToast({ message: `${trackable.label} Streak: Day ${updated.streak}` })
// //       }, 3000)
// //     }

// //     // Check for old format - then delete it
// //     if (updatedForStore[oldId]) {
// //       delete updatedForStore[oldId]
// //     }
// //     updatedForStore[trackable.tag] = updated
// //   })
// //   LastUsed.update((s) => updatedForStore)
// //   return await NStorage.put(NPaths.storage.lastUsage(), updatedForStore)
// // }
