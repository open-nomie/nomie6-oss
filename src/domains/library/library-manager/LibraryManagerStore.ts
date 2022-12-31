
import { writable } from 'svelte/store'
import type { ITracker } from '../../../modules/tracker/TrackerClass'
import type TrackerClass from '../../../modules/tracker/TrackerClass'

export type LibraryCategoryType = {
  id: string
  label: string
  emoji: string
}

export type LibraryTrackerType = {
  title: string
  trackers: Array<ITracker | TrackerClass>
  tags: Array<string>
  uid?: string
  _id?: string
}

type LibraryManagerStateType = {
  libraryTracker: undefined | LibraryTrackerType
}
const initialState: LibraryManagerStateType = {
  libraryTracker: undefined,
}
export const LibraryManagerStore = writable(initialState)

export const getLibraryCategories = async (): Promise<Array<LibraryCategoryType>> => {

  return []
}



export const saveLibraryTracker = async (props: LibraryTrackerType) => {

}

export const getAllLibraryTrackers = async () => {
  // const collection = getCollectionRef()
  // const q = query(collection)
  // const final: Array<LibraryTrackerType> = []
  // ;(await getDocs(q)).docs.forEach((doc) => {
  //   const data: LibraryTrackerType = doc.data() as LibraryTrackerType
  //   data._id = doc.id
  //   if (data.trackers?.length) {
  //     data.trackers = data.trackers.map((t) => new TrackerClass(t))
  //   } else {
  //     data.trackers = []
  //   }
  //   final.push(data)
  // })
  // return final
  return []
}

export const getLibraryTrackersByCategory = async (
  category: LibraryCategoryType
): Promise<Array<LibraryTrackerType>> => {
  // const collection = getCollectionRef()
  // const _where = where('tags', 'array-contains', category.id)
  // const q = query(collection, _where)
  // const final: Array<LibraryTrackerType> = []
  // ;(await getDocs(q)).docs.forEach((doc) => {
  //   const data: LibraryTrackerType = doc.data() as LibraryTrackerType
  //   data._id = doc.id
  //   if (data.trackers?.length) {
  //     data.trackers = data.trackers.map((t) => new TrackerClass(t))
  //   } else {
  //     data.trackers = []
  //   }
  //   final.push(data)
  // })

  // return final
  return []
}
