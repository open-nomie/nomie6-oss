import { writable } from 'svelte/store'

function createBackdropStore() {
  const state: Array<string> = []
  const { subscribe, update, set } = writable(state)

  function getId(): string {
    let id: string
    update((state) => {
      id = `bd-${state.length}`
      state.push(id)
      return state
    })
    return id
  }

  function add(id: string) {
    update((state) => {
      if (state.indexOf(id) === -1) {
        state.push(id)
      }
      return state
    })
  }

  function read(): Array<string> {
    let _state: Array<string>
    update((state) => {
      _state = state
      return state
    })
    return _state
  }

  function remove(id: string) {
    update((state) => {
      return state.filter((_id) => _id !== id)
    })
  }

  async function refresh() {
    const _state = read().filter((id) => {
      const childId = `child-${id}`
      return document.getElementById(childId) ? true : false
    })

    update((state) => {
      state = _state

      return state
    })
  }

  function clearAll() {
    update((state) => [])
  }

  return {
    clearAll,
    remove,
    getId,
    add,
    subscribe,
    update,
    set,
    refresh,
  }
}

export const BackdropStore = createBackdropStore()
