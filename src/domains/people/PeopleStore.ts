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

export const PeopleStoreAsArray = derived(PeopleStore, ($PeopleStore) => {
  return Object.keys($PeopleStore).map((key) => {
    return $PeopleStore[key]
  })
})
