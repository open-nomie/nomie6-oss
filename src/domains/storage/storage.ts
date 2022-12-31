/**
 * Nomie's someone generic data storage
 * this was used originally to communicate with sqlite
 * then pouchdb, now it's blockstack and localforage.
 */

// Vendors

import { getStorageType, saveStorageType } from '../../domains/preferences/Preferences'
import { Interact } from '../../store/interact'
import { switchToLocal } from '../settings/settings-functions'

// import DumbStorage from './engines/storage.dumb'

import { LocalForageEngine } from './engines/engine.localforage'
import { PouchDBEngine } from './engines/engine.pouchdb'
import { SideStore } from './side-storage'
// import { S3Engine } from "./engines/engine.s3";

const STORAGE_TYPE_PATH = 'n6/storage-type'

export type StorageTypes = 'local' | 'firebase' | 'dumb' | 'pouchdb' | any

export function setStorage(type: StorageTypes) {
  localStorage.setItem(STORAGE_TYPE_PATH, type)
}

export type StorageEngineType = {
  id: string
  name: string
  shortName: string
  description: string
  price?: string
  accountRequired?: boolean
  multipleDevices?: boolean
  engine: IStorage | Storage
  advanced?: boolean
}
export const StorageEngines: Array<StorageEngineType> = [
  {
    id: 'local',
    name: 'Local Only',
    shortName: 'Local',
    description: 'Data is stored on this device only.',
    price: 'FREE',
    multipleDevices: false,
    engine: LocalForageEngine,
  },
  {
    id: 'pouchdb',
    name: 'CouchDB',
    shortName: 'CouchDB',
    description: 'Sync to your own CouchDB server',
    price: 'FREE',
    multipleDevices: false,
    engine: PouchDBEngine,
    advanced: true
  },
  // {
  //   id: 's3',
  //   name: 'S3 Compliant Storage',
  //   shortName: 'S3 Storage',
  //   description: '(Coming Soon) Sync to any S3 Compliant Storage engine',
  //   price: 'FREE',
  //   multipleDevices: true,
  //   engine: S3Engine,
  //   advanced: true
  // },
  // {
  //   id: 'firebase',
  //   name: 'Encrypted Cloud',
  //   shortName: 'Encrypted Cloud',
  //   description: `(Coming soon) Multiple devices with end-to-end encryption in the cloud.`,
  //   multipleDevices: true,
  //   price: 'PAID Upgrade',
  //   engine: FirebaseEngine,
  // },
]

export const getStorageEngineDetails = (id: string): StorageEngineType => {
  return StorageEngines.find((se) => se.id == id)
}

export interface IStorage {
  id?: StorageTypes
  ready?: boolean
  authRequired?: boolean
  engines?: {
    [key: string]: IStorage
    // blockstack: BlockStackEngine;
    // local: typeof LocalForageEngine
    // firebase: typeof FirebaseEngine
    // pouchdb: typeof PouchDBEngine
    // dumb: typeof DumbStorage
  }
  onReady?(func: Function): any
  fireReady?(func: Function): any
  engine?: StorageTypes
  storageType?(): string
  _storageType?(): string
  getEngine?(): IStorage
  get(path: string): Promise<any>
  put(path: string, content: any): Promise<any>
  delete(path: string): Promise<any>
  convertPath?(path: string): string
  basePath?(path: string): string
  setType?(type: StorageEngineType): string
  list(): Promise<any>
  init?(): Promise<any>
  getProfile?(): Promise<any>
  local?: {
    get(path: string): any
    put(path: string, content: any): any
    remove(path: string): void
  }
}

const engines = {};
StorageEngines.map((e) => {
  engines[e.id] = e.engine;
})

const Storage: IStorage = {
  engines: engines,
  engine: getStorageType(),
  // Get user storage type
  storageType(): string {
    return this.engine || this._storageType() || 'local'
    // return "pouchdb";
  },
  convertPath(path: string) {
    const engine = this.getEngine()
    if (engine.convertPath) {
      return engine.convertPath(path)
    } else {
      return path
    }
  },
  _storageType() {
    return getStorageType()
  },
  setType(type: StorageTypes) {
    saveStorageType(type)
  },
  getEngine() {
    try {
      return this.engines[this.storageType()]
    } catch (e) {
      console.error('Error getting Engine')
      console.error('e', e.message)
      return null
    }
  },
  getProfile() {
    const engine = this.getEngine()
    return engine.getProfile()
  },
  onReady(func) {
    return this.getEngine().onReady(func)
  },
  async init() {
    try {
      let engineProfile = this.getEngine().init()
      return engineProfile
    } catch (e) {
      const loadLocal = await Interact.confirm('Error loading this storage engine', `${e}.\n Restart with Local Storage?`);
      if (loadLocal) {
        switchToLocal();
      }
    }
  },
  // Get a file
  async get(path, onChange = null) {
    return await this.getEngine().get(path, onChange)
  },
  // Put a file
  async put(path, content) {
    return await this.getEngine()
      .put(path, content)
      .catch((e) => {
        throw e
      })
  },
  async putBinary(path, content) {
    return await this.getEngine().putBinary(path, content)
  },

  // Delete a file
  async delete(path) {
    return await this.getEngine().delete(path)
  },
  async list() {
    return await this.getEngine().list()
  },
  local: {
    get(path) {
      return JSON.parse(localStorage.getItem(`storage/${path}`) || 'null')
    },
    put(path, value) {
      return localStorage.setItem(`storage/${path}`, JSON.stringify(value))
    },
    remove(path) {
      return localStorage.removeItem(`storage/${path}`)
    },
  },
  SideStore: SideStore,
}

export default Storage

window['NStorage'] = Storage
