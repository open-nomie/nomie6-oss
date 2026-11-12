import NPaths from '../../paths'
import Person from './Person.class'
import { createKVStore } from '../../store/KVStore'
import { derived } from 'svelte/store'

export const PeopleStore = createKVStore(NPaths.storage.people(), {
  label: 'People',
  key: 'username',
  itemInitializer(item: any) {
    return new Person(item)
  },
  itemSerializer(item: Person) {
    return JSON.parse(JSON.stringify(item))
  },
})

/**
 * Normalise Keys
 * The rename bug stored people under their typed name instead of their username.
 * Move each one onto its username key, unless that key is already taken.
 */
export const normalizePersonKeys = async (people: Record<string, any>): Promise<Record<string, any>> => {
  const movable = (map: Record<string, any>, key: string) =>
    !!map[key]?.username && key !== map[key].username && !map[map[key].username]
  if (!Object.keys(people).some((key) => movable(people, key))) return people
  return await PeopleStore.updateSync((s) => {
    Object.keys(s).forEach((key) => {
      if (movable(s, key)) {
        s[s[key].username] = s[key]
        delete s[key]
      }
    })
    return s
  })
}

export const PeopleStoreAsArray = derived(PeopleStore, ($PeopleStore) => {
  return Object.keys($PeopleStore).map((key) => {
    return $PeopleStore[key]
  })
})
