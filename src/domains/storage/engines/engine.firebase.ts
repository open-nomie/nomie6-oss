import { firebaseAuth, firebaseDB, FirebaseStore } from '../../firebase/FirebaseStore'
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import NPaths from '../../../paths'
import { blueBox } from '../../encryption/EncryptionStore'
import type { IStorage } from '../storage'

const getBasePath = (): string => {
  return `${NPaths.firestoreRoot()}/${firebaseAuth?.currentUser?.uid}/profiles/main`
}

const formatPath = (path: string) => {
  return path
}

interface FirebaseIStorage extends IStorage {
  listeners: Array<Function>
  profile: any
  processLogin: Function
}

const FirebaseEngine: FirebaseIStorage = {
  ready: false,
  id: 'firebase',
  authRequired: true,

  listeners: [],

  profile: null,
  convertPath(path: string) {
    return path
  },
  basePath(): string {
    return getBasePath()
  },
  init() {
    const fireReady = () => {
      this.fireReady()
    }

    window['blueBox'] = blueBox

    /** Storage Init */
    return new Promise((resolve, reject) => {
      let initialized = false
      let initializing = false
      FirebaseStore.subscribe(async (s) => {
        if ((s || {}).user && !initialized && !initializing) {
          fireReady()
          initialized = true
          resolve(true)
        } else if (!s.user && initialized) {
          fireReady()
          window.location.reload()
        }
      })
    }) // end return promise
  },
  onReady(func) {
    if (this.ready) {
      func()
    } else {
      if (this.listeners.indexOf(func) == -1) {
        this.listeners.push(func)
      }
    }
  },
  fireReady() {
    this.ready = true
    this.listeners.forEach((func) => {
      func()
    })
    this.listeners = []
  },
  processLogin(func) {
    func()
  },
  async getProfile() {
    return undefined
  },
  async put(_path, content) {
    const path = `${getBasePath()}/${formatPath(_path)}`
    const finalDoc = doc(firebaseDB, path)
    const data = blueBox.encrypt(content)
    return setDoc(finalDoc, { data })
  },
  async get(_path: string): Promise<any | undefined> {
    const path = `${getBasePath()}/${formatPath(_path)}`
    try {
      const docRef = doc(firebaseDB, path)
      const snap = await getDoc(docRef)

      if (snap.exists() && snap.data()) {
        const encryptedData: any = snap.data().data
        const unencryptedData: string = blueBox.decrypt(encryptedData)
        return unencryptedData
      } else {
        return null
      }
    } catch (e) {
      console.error(`Error reading ${path}`)
      console.error(e)
    }
  },
  async list(): Promise<Array<string>> {
    let files = []
    const querySnap = await getDocs(collection(firebaseDB, getBasePath()))
    querySnap.forEach((doc) => {
      files.push(`${doc.id}`)
    })
    const bookSnap = await getDocs(collection(firebaseDB, `${getBasePath()}/data/books`))
    bookSnap.forEach((doc) => {
      files.push(`data/books/${doc.id}`)
    })
    return files
  },
  async delete(_path: string) {
    const path = `${getBasePath()}/${formatPath(_path)}`
    const docRef = doc(firebaseDB, path)
    return await deleteDoc(docRef)
  },
}

export default FirebaseEngine
