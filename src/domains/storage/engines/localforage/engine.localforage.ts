import localforage from 'localforage'
import type { IStorage } from '../../storage'

let listeners = []

export const LocalForageEngine: IStorage = {
  onReady(func) {
    // No need to setup just call the function
    if (listeners.indexOf(func) == -1) {
      listeners.push(func)
    }
  },
  basePath(path) {
    return path
  },
  fireReady() {
    listeners.forEach((func) => {
      func()
    })
    listeners = []
  },
  async init() {
    /**
     * Request the browser persist the data
     */
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        await navigator.storage.persist();
      }
    }
    return this.fireReady()
  },
  async getProfile() {
    return {
      username: 'Local User',
    }
  },
  async put(path, content) {
    return localforage.setItem(path, JSON.stringify(content))
  },
  async get(path) {
    return localforage.getItem(path).then((content: any) => {
      return content ? JSON.parse(content) : null
    })
  },
  async list() {
    return localforage.keys().then((keys) => {
      return keys
    })
  },
  async delete(path) {
    return localforage.removeItem(path)
  },
}
