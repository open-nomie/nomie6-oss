import { destroyDoc, firebaseAuth, firebaseFunctions, getCollectionDocs, saveDoc } from '../firebase/FirebaseStore'

import { Interact } from '../../store/interact'
import { Lang } from '../../store/lang'
import NLog from '../nomie-log/nomie-log'
import NPaths from '../../paths'

import { blueBox } from '../encryption/EncryptionStore'
import { decryptString } from '../encryption/encryption'
import { httpsCallable } from 'firebase/functions'
import { saveLog } from '../ledger/LedgerStore'
import { showToast } from '../../components/toast/ToastStore'
import { wait } from '../../utils/tick/tick'
import { writable } from 'svelte/store'

type ViewTypes = 'setup' | 'fresh' | 'imported'

type CloudAPIStateType = {
  view: ViewTypes
  fresh: Array<ApiLogType>
  imported: Array<any>
  
  keys: Array<CloudAPIKeyFile>
  notImportable: Array<ApiLogType>
  autoImport: boolean
}

type ApiLogType = {
  encrypted: boolean
  encryptedStr?: string
  log: {
    note: string
    created?: string
    end?: any
    start?: any
    lat: any
    lng: any
    score: any
    source: any
    location: any
  }
  id: string
}

export type CloudAPIKeyFile = { key: string; created: string }

const CloudAPIStateBase: CloudAPIStateType = {
  view: 'setup',
  fresh: [],

  imported: [],
  notImportable: [],
  keys: [],
  autoImport: localStorage.getItem('auto-import-api') ? true : false,
}

export const CloudAPIStore = writable(CloudAPIStateBase)

/**
 * It toggles the auto-import setting in the store
 * @param {ViewTypes} view - ViewTypes
 */
export const setView = (view: ViewTypes) => {
  CloudAPIStore.update((s) => {
    s.view = view
    return s
  })
}

/**
 * It toggles the auto-import setting in the store
 */
export const toggleAutoImport = () => {
  const current = localStorage.getItem('auto-import-api')
  CloudAPIStore.update((s) => {
    if (current) {
      localStorage.removeItem('auto-import-api')
      s.autoImport = false
    } else {
      localStorage.setItem('auto-import-api', '1')
      s.autoImport = true
    }
    return s
  })
}

/**
 * It calls the `generateAPIKey` function in the Firebase Functions backend, which generates a new API
 * key and stores it in the database
 */
export const registerKey = async () => {
  Interact.blocker('Generating new API Key...')
  const generateKey = httpsCallable(firebaseFunctions, 'generateAPIKey')
  await generateKey()
  Interact.stopBlocker()
  loadAPIKeys()
}

/**
 * It deletes a key from the database
 * @param {CloudAPIKeyFile} keyFile - The key file object that you want to delete.
 * @returns A boolean value.
 */
export const deleteKey = async (keyFile: CloudAPIKeyFile) => {
  Interact.blocker('Removing Key...')
  const uid = firebaseAuth.currentUser.uid
  const keypath = `keys/${keyFile.key}`
  const userKeyPath = NPaths.firestoreUserKey(uid, keyFile.key)

  try {
    await destroyDoc(userKeyPath)
  } catch (e) {
    Interact.error(e.message)
  }
  try {
    await destroyDoc(keypath)
  } catch (e) {
    Interact.error(e.message)
  }
  Interact.stopBlocker()
  loadAPIKeys()
  return true
}

/**
 * It loads the API keys from Firestore and stores them in the CloudAPIStore
 */
export const loadAPIKeys = async () => {
  const uid = firebaseAuth.currentUser.uid
  const docs: Array<any> = await getCollectionDocs(NPaths.firestoreUserKeys(uid))
  CloudAPIStore.update((s) => {
    s.keys = docs
    return s
  })
}



/**
 * It loads the logs from the server, and then every 5 minutes it loads the logs from the server
 */
export const initCloudAPIStore = async () => {
  await loadFreshLogs()
  setInterval(() => {
    loadFreshLogs()
  }, 1000 * 60 * 5)
}

/**
 * Decrypt an API Log
 * @param doc
 * @returns
 */
const decryptLog = (doc: ApiLogType): ApiLogType => {
  if (doc.encrypted) {
    const encryptedLog: string | any = doc.log
    try {
      const decrypted = decryptString(encryptedLog, blueBox.keyPair.secretKey)
      doc.log = JSON.parse(decrypted)
      doc.encryptedStr = encryptedLog
      doc.encrypted = false
    } catch (e) {}

    // doc.log = new NLog()
  }
  return doc
}

/**
 * Load Fresh Logs
 * Setups up the state with the
 * latest logs from the API
 * it will also auto import if the user has
 * specified as much
 */
export const loadFreshLogs = async (cancelAutoImport:boolean = false) => {
  let autoImport: boolean = localStorage.getItem('auto-import-api') ? true : false;
  if(cancelAutoImport === true) autoImport = false;
  const docs: Array<ApiLogType> = await getCollectionDocs(`customers/${firebaseAuth.currentUser.uid}/api-fresh`)
  CloudAPIStore.update((s) => {
    s.fresh = []
    return s
  })
  
  if (docs.length && !autoImport) {
    CloudAPIStore.update((s) => {
      s.fresh = (docs || []).map((doc) => {
        return decryptLog(doc)
      })
      return s
    })
  } else if (docs.length && autoImport) {
    importMultipleFreshLogs(docs)
  }
}


/**
 * It takes an array of encrypted logs, decrypts them, and then imports them into the database
 * @param logs - Array<ApiLogType>
 */
export const importMultipleFreshLogs = async (logs: Array<ApiLogType>) => {
  Interact.blocker(`Importing ${logs.length}...`)
  // let finished = 0
  for (let i = 0; i < logs.length; i++) {
    await importFreshLog(decryptLog(logs[i]))
    // finished++
  }
  Interact.stopBlocker()
  
}

/**
 * It takes an ApiLogType and returns an NLog
 * @param {ApiLogType} apiLogPayload - This is the payload that is sent to the API.
 * @returns A function that takes an ApiLogType and returns an NLog
 */
export const apiLogToNLog = (apiLogPayload: ApiLogType): NLog => {
  const log = apiLogPayload.log
  const finalLog = new NLog(log)
  finalLog.end = log.end || log.created ? new Date(log.end || log.created) : new Date()
  finalLog.start = log.start ? new Date(log.start) : finalLog.end
  finalLog.source = log.source ? log.source.substr(0, 40) : 'api'
  return finalLog
}

/**
 * Import a Fresh Log from the
 * @param apiLog
 * @returns
 */
export const importFreshLog = async (apiLog: ApiLogType): Promise<Boolean> => {
  try {
    // Convert to a real Nomie Log
    const finalLog = apiLogToNLog(apiLog)

    // Save the Log
    await saveLog(finalLog).catch((e) => {
      throw e
    })

    const uid = firebaseAuth.currentUser.uid

    // Archive this - but make sure it's encrypted
    // Disabled for now.
    // const updatedLog: any = { ...apiLog, ...{ imported: new Date().toJSON() } }
    // if (updatedLog.encryptedStr) {
    //   updatedLog.log = `${updatedLog.encryptedStr}`
    //   updatedLog.encrypted = true
    //   delete updatedLog.encryptedStr
    // }
    // const shortId = `${apiLog.id.substr(0, 10)}`
    // Don't save it to imported
    // await saveDoc(`customers/${uid}/api-imported/${new Date().getTime()}-${shortId}`, updatedLog)

    await destroyDoc(`customers/${uid}/api-fresh/${apiLog.id}`)
    await wait(1000)
    await loadFreshLogs(true)
    return true
  } catch (e) {
    Interact.error(e.message)
    return false
  }
}

/**
 * It deletes a log from the database
 * @param {ApiLogType} log - ApiLogType - this is the type of the log that is being deleted.
 */
export const deleteFreshLog = async (log: ApiLogType) => {
  const confirmed = await Interact.confirm('Are you sure?', 'This cannot be undone')
  if (confirmed) {
    await destroyDoc(`customers/${firebaseAuth.currentUser.uid}/api-fresh/${log.id}`)
    showToast({ message: Lang.t('general.deleted', 'Deleted') })
    await wait(100)
    await loadFreshLogs()
  }
}

/**
 * Get Archived Logs
 * Get logs from the past
 */
// export const loadArchivedLogs = async (): Promise<void> => {
//   const archivedDocs: Array<ApiLogType> = await getCollectionDocs(
//     `customers/${firebaseAuth.currentUser.uid}/api-imported`
//   )

//   if (archivedDocs.length) {
//     CloudAPIStore.update((s) => {
//       const docs: Array<NLog> = (archivedDocs || [])
//         .map((doc) => {
//           return decryptLog(doc)
//         })
//         .filter((n) => n)
//         .filter((n) => isNaN(n.log.end))
//         .sort((a, b) => (a.log.end > b.log.end ? -1 : 1))
//       s.imported = docs
//       return s
//     })
//   }
// }
