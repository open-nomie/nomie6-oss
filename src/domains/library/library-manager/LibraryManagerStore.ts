import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import isArray from 'lodash/isArguments'

import { writable } from 'svelte/store'
import type { ITracker } from '../../../modules/tracker/TrackerClass'
import TrackerClass from '../../../modules/tracker/TrackerClass'
import NPaths from '../../../paths'
import { firebaseAuth, firebaseDB, getDocSnap } from '../../firebase/FirebaseStore'

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
  const snap = await getDocSnap(`trackable-library/configuration`)
  if (snap.exists()) {
    const categories: Array<LibraryCategoryType> = snap.data().categories as Array<LibraryCategoryType>
    return categories
  }
  return []
}

const getCollectionRef = () => {
  return collection(firebaseDB, NPaths.approvedTrackers())
}

export const addTrackerToLibrary = async (
  title: string,
  tracker: TrackerClass | Array<TrackerClass>,
  category: LibraryCategoryType
) => {
  const payload: LibraryTrackerType = {
    title: title,
    trackers: isArray(tracker) ? tracker : [tracker],
    tags: [category.id],
    uid: firebaseAuth.currentUser?.uid,
  }
  return await saveLibraryTracker(payload)
}

export const saveLibraryTracker = async (props: LibraryTrackerType) => {
  if (props._id) {
    const docPath = `${NPaths.approvedTrackers()}/${props._id}`
    const docRef = doc(firebaseDB, docPath)
    return await updateDoc(docRef, props)
  } else {
    // It's a create
    delete props._id
    return await addDoc(getCollectionRef(), props)
  }
}

export const getAllLibraryTrackers = async () => {
  const collection = getCollectionRef()
  const q = query(collection)
  const final: Array<LibraryTrackerType> = []
  ;(await getDocs(q)).docs.forEach((doc) => {
    const data: LibraryTrackerType = doc.data() as LibraryTrackerType
    data._id = doc.id
    if (data.trackers?.length) {
      data.trackers = data.trackers.map((t) => new TrackerClass(t))
    } else {
      data.trackers = []
    }
    final.push(data)
  })
  return final
}

export const getLibraryTrackersByCategory = async (
  category: LibraryCategoryType
): Promise<Array<LibraryTrackerType>> => {
  const collection = getCollectionRef()
  const _where = where('tags', 'array-contains', category.id)
  const q = query(collection, _where)
  const final: Array<LibraryTrackerType> = []
  ;(await getDocs(q)).docs.forEach((doc) => {
    const data: LibraryTrackerType = doc.data() as LibraryTrackerType
    data._id = doc.id
    if (data.trackers?.length) {
      data.trackers = data.trackers.map((t) => new TrackerClass(t))
    } else {
      data.trackers = []
    }
    final.push(data)
  })

  return final
}
