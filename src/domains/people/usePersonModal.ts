import { writable } from 'svelte/store'
import type Person from './Person.class'

type PersonModalType = {
  person?: Person
  date?: Date
}

export const PersonModalStore = writable<PersonModalType | undefined>(undefined)

export const openPersonModal = (person: Person, options?: { date: Date }) => {
  PersonModalStore.update((s) => {
    s = s || {}
    s.person = person
    s.date = options?.date
    return s
  })
}
export const closePersonModal = () => {
  PersonModalStore.update((s) => undefined)
}
