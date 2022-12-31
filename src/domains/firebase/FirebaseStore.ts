import { writable } from 'svelte/store'

// Firebase Includes
// import { getStorage } from 'firebase/storage'
import { initializeApp } from 'firebase/app'
import { getFunctions } from 'firebase/functions'
import {
  getFirestore,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  collection,
  enableMultiTabIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
  // enableMultiTabIndexedDbPersistence,
  // disableNetwork,
  // enableNetwork,
} from 'firebase/firestore'

import type { DocumentSnapshot, DocumentData } from 'firebase/firestore'

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'

//@ts-ignore
import { createCheckoutSession, getStripePayments, Price } from '@stripe/firestore-stripe-payments'

import type { Product, Subscription } from '@stripe/firestore-stripe-payments'
import NPaths from '../../paths'
import { wait } from '../../utils/tick/tick'
import {  EncryptionStoreInit, getKeyBackup } from '../encryption/EncryptionStore'

import { Interact } from '../../store/interact'
import { encStorage } from '../encryption/encryption'


import { Env } from '../../env'
import { getRawPrefs } from '../preferences/Preferences'
import { deleteAllFromCache } from '../ledger/ledger-cache'
import { httpsCallable } from 'firebase/functions'
import { injectSubscriptionPermissions, PermissionsState, PermissionsStore, resetPermissionStore } from '../my-account/PermissionsStore'
import { showToast } from '../../components/toast/ToastStore'
import { closeModal } from '../../components/backdrop/BackdropStore2'
import { openPasscodeModal } from './useEncryptionModal'
import { setStorage } from '../storage/storage'
import { md5 } from '../../modules/nid/nid'

// Get Config
const firebaseConfig = {
  apiKey: `${Env.apiKey}`,
  authDomain: `${Env.authDomain}`,
  projectId: `${Env.projectId}`,
  storageBucket: `${Env.storageBucket}`,
  messagingSenderId: `${Env.messagingSenderId}`,
  appId: `${Env.appId}`,
  measurementId: `${Env.measurementId}`,
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const firebaseDB = getFirestore(firebaseApp)
// export const storage = getStorage(firebaseApp)
export const firebaseFunctions = getFunctions(firebaseApp)

/**
 * Setup Stripe Payment Connectors
 */
const payments = getStripePayments(firebaseApp, {
  productsCollection: 'products',
  customersCollection: 'customers',
})

export const getCustomerPortal = async () => {
  const portalLinkCaller = httpsCallable(firebaseFunctions, 'ext-firestore-stripe-payments-createPortalLink')
  return await portalLinkCaller({
    returnUrl: window.location.origin,
  })
  // Interact.stopBlocker()
}
/**
 * Setup Offline IndexDb caching
 * TODO:// make this an option
 */
enableMultiTabIndexedDbPersistence(firebaseDB).catch((e) => {
  console.error(e)
  if (e.code === 'failed-precondition') {
    showToast({ message: '⚠️ Multple tabs are open! Please close one' })
  } else if (e.code === 'unimplemented') {
    showToast({ message: '⚠️ This browser does not support full offline mode.' })
  }
})

export const initFirebaseStore = async () => {
  
  onAuthStateChanged(firebaseAuth, async (user) => {
    // fbUser = user;
    if (user) {
      try {
        FirebaseStore.update((s) => {
          s.hasAccount = true
          return s
        })
        await EncryptionStoreInit()
        onUserLoginValidateAccount(user).then((allMeta) => {
        
        })
      } catch (e) {
        alert(e)
      }
    } else {
      /**
       * If they are not logged in,
       * then trigger the permissions store to be
       * ready, this way it fires off the 
       * other items in the app that need it. 
       */
      PermissionsStore.update(s=>{
        s.ready = true;
        return s;
      })
      FirebaseStore.update((s) => {
        s.user = undefined
        s.ready = true
        // s.jwt = undefined;
        s.showLogin = true
        return s
      })
    }
  })
  window.addEventListener('online', async () => {
    if (window.navigator.onLine) {
      enableNetwork(firebaseDB)
    }
  })
  window.addEventListener('offline', async () => {
    if (!window.navigator.onLine) {
      disableNetwork(firebaseDB)
    }
  })
  return true
} // end init firebase store

/**
 * Create the Firebase Store
 */

type NomieFeatureType = {
  id: string
  name: string
  description: string
}

type FirebaseStoreProps = {
  features: Array<NomieFeatureType>
  user: any
  hasAccount: boolean
  showSignIn: boolean
  showRegister: boolean
  jwt?: string
  plan?: Subscription
  products: Array<Product>
  planName?: string
  planId?: string
  ready: boolean
  showLogin: boolean
  showPlan: boolean
  passCodeProps?: usePasscodeModalType
  subscriptions: Array<NormalizedSubscriptionType>
  activeSubscription?: Subscription
}

/**
 * Create Firebase Store
 * @returns
 */
function createFirebaseStore() {
  const firebaseStateBase: FirebaseStoreProps = {
    user: undefined,
    features: [],
    hasAccount: localStorage.getItem('has-nomiecloud') ? true : false,
    showSignIn: false,
    showRegister: false,
    products: [],
    plan: undefined,
    planName: undefined,
    planId: undefined,
    showLogin: false,
    passCodeProps: undefined,
    ready: false,
    showPlan: false,
    subscriptions: [],
    activeSubscription: undefined,
  }
  const { subscribe, update, set } = writable(firebaseStateBase)

  return {
    subscribe,
    update,
    set
  }
}

/**
 * Export FirebaseStore
 */
export const FirebaseStore = createFirebaseStore()

/**
 * Get a Document Snapshot
 * @param docPath
 * @returns
 */
export const getDocSnap = async (docPath: string): Promise<DocumentSnapshot<DocumentData>> => {
  const docRef = doc(firebaseDB, docPath)
  return await getDoc(docRef)
}

/**
 * Reset a password
 * @param email
 * @returns
 */
export const sendPasswordReset = async (email: string) => {
  return sendPasswordResetEmail(firebaseAuth, email)
}

/**
 * Save a Doc
 * @param path
 * @param data
 * @param merge
 * @returns
 */
export const saveDoc = async (path: string, data: any, merge: boolean = false) => {
  const ref = doc(firebaseDB, path)
  return setDoc(ref, data, { merge })
}

/**
 * Destroy a Doc
 * @param path
 * @returns
 */
export const destroyDoc = async (path: string) => {
  const ref = doc(firebaseDB, path)
  return deleteDoc(ref)
}

/**
 * Create an Account
 * @param email
 * @param password
 * @returns
 */
export const createAccount = async (email, password) => {
  return await createUserWithEmailAndPassword(firebaseAuth, email, password).catch((e) => {
    let message = e.message

    if (e.message.match('invalid-email')) {
      message = 'Invalid Email'
    } else if (e.message.match('user-not-found')) {
      message = 'Invalid Account'
    } else if (e.message.match('email-already-in-use')) {
      message = 'Email Already in Use. Do you already have an account?'
    } else {
      message = 'Unknown error has occured. Sorry 🤨'
    }
    throw new Error(message)
  })
}

export const uiCreateAccount = async (email: string, password: string): Promise<Boolean> => {
  Interact.blocker('Creating account...')
  return await createAccount(email, password)
    .catch((e) => {
      Interact.stopBlocker()
      Interact.error(e.message)
      console.error(e)
    })
    .then(async () => {
      Interact.stopBlocker()
      showToast({ message: 'Account Created' })
      await wait(1000);
      window.location.reload();
      return true
    })
}

/**
 * Sign In
 * @param email
 * @param password
 * @returns
 */
export const signIn = async (email, password) => {
  // TODO:// See why the library pops up when we login -
  // saveStorageType('firebase') -- stopping this
  return await signInWithEmailAndPassword(firebaseAuth, email, password).catch((e) => {
    let message = e.message
    if (e.message.match('invalid-email')) message = 'Invalid Email'
    if (e.message.match('user-not-found')) message = 'Invalid Account'
    if (e.message.match('wrong-password')) message = 'Wrong Password'
    throw new Error(message)
  })
}

export const uiSignIn = async (email: string, password: string): Promise<Boolean> => {
  Interact.blocker('...')
  try {
    const signedIn = await signIn(email, password);
    
    if(signedIn) {
      Interact.stopBlocker()
      showToast({ message: 'Logged In', timeout: 500 })
      return true
    } 
    return false;
  } catch(e) {
    Interact.stopBlocker()
      Interact.error(e.message)
      console.error(e)
  }
}

/**
 * Full Logout
 * This will remove the keyPair stored locally
 * Use this with a lot of warnings
 */
export const _fullLogout = async () => {
  try {
    await encStorage.removeItem('keyPair')
  } catch (e) {
    console.error(e.message)
  }
  await deleteAllFromCache()
  signOut(firebaseAuth)
  await wait(1000)
  window.location.reload()
}

/**
 * Sign Out
 */
export const signOutOfNomieCloud = async (force = false) => {
  // Check if they have a backup.
  const prefs = getRawPrefs()
  const backup = await getKeyBackup()
  let confirmed = false
  if (!backup && !force && prefs.storageType == 'firebase') {
    const createIt = await Interact.confirm(
      'Warning! No Security Phrase Found',
      'Logging out would mean you could lose access to your data. Are you'
    )

    if (createIt) {
      // const keys: KeyPairType = await encStorage.getItem('keyPair')
      // await backupKeys(keys, true)
    // } else {
      await wait(400)
      confirmed = await Interact.confirm('Still want to Logout?')
    }
  } else {
    await wait(400)
    confirmed = await Interact.confirm('Logout of Nomie Cloud?', 'You can always log back in later')
  }

  if (confirmed) {
    resetPermissionStore()
    setStorage('local')
    return _fullLogout()
  }
}

export const useLoginModal = () => {
  return [
    () => {
      FirebaseStore.update((s) => {
        s.showLogin = true
        return s
      })
    },
    () => {
      FirebaseStore.update((s) => {
        s.showLogin = false
        return s
      })
    },
  ]
}

type usePasscodeModalType = {
  onChange: Function
  isFirst: boolean
  onCancel?: Function
}

export const usePasscodeModal = (props: usePasscodeModalType) => {
  return [
    () => {
      FirebaseStore.update((s) => {
        s.passCodeProps = props
        return s
      })
    },
    () => {
      FirebaseStore.update((s) => {
        s.passCodeProps = undefined
        return s
      })
    },
  ]
}

export const getUserPasscode = (isFirst: boolean = false, canCancel: boolean = false): Promise<string> => {
  return new Promise((resolve) => {
    openPasscodeModal({
      isFirst,
      canCancel,
      onCancel: (): void => {
        closeModal('passcode')
      },
      onChange: (value: string): void => {
        resolve(value)
        closeModal('passcode')
      },
    })
  })
}

export const getCollectionDocs = async (path: string): Promise<Array<any>> => {
  const col = collection(firebaseDB, path)
  const querySnap = await getDocs(col)
  const docs = []
  querySnap.forEach((doc: any) => {
    const _doc = doc.data()
    docs.push(_doc)
  })
  return docs || []
}

export type LocalSubscription = {
  id: string,
  name: string,
  created: string | null,
  canceled_at: string | null,
  cancel_at: string | null,
  tags: Array<string>
}

export const getUserSubscriptions = async (uid: string): Promise<Array<Subscription>> => {
  return await getCollectionDocs(NPaths.firestoreUserSubscriptions(uid))
}

export const getUserNormalizedSubscriptions = async (uid:string): Promise<Array<NormalizedSubscriptionType>> => {
  const stripeSubs = ((await getUserSubscriptions(uid)) || []).map((sub)=>{
    return stripeSubscriptionToNormalized(sub);
  });
  // TODO:// make this work with iOS purchases
  const localSubs:Array<NormalizedSubscriptionType> = (await getCollectionDocs(NPaths.localSubscriptions(uid)) || []).map((localSub:LocalSubscription)=>{
    return {
      source: "local",
      id: localSub.id || md5(localSub.tags.join(",")),
      active: !localSub.canceled_at,
      priceId: '',
      metadata: {},
      interval: 'month',
      name: localSub.name,
      apiAccess: localSub.tags.indexOf('api-access') > -1,
      storageWrite: localSub.tags.indexOf('cloud-storage') > -1,
      storageRead: localSub.tags.indexOf('cloud-storage') > -1,
      amount: 0
    }
  });

  return [...stripeSubs, ...localSubs]
}

export const purchasePlan = async (productPrice: Price) => {
  Interact.blocker('Connecting to Stripe...')

  const priceId = productPrice.id
  const session: any = await createCheckoutSession(
    payments,
    {
      price: priceId,
      allow_promotion_codes: true,
      //@ts-ignore
      billing_address_collection: "auto",
    }
  ).catch((e) => {})
  window.location.assign(session.url)
}

export type NormalizedSubscriptionType = {
  source: string;
  id: string
  active: boolean
  priceId: string
  name: string
  amount: number
  interval: 'month' | 'year'
  metadata: {
    [key: string]: string | object | undefined
  }
  apiAccess: boolean
  storageWrite: boolean
  storageRead: boolean
}

/**
 * It takes a Stripe Subscription object and returns a normalized subscription object
 * @param {Subscription} stripeSub - Subscription - this is the subscription object from Stripe
 * @returns A function that takes a subscription and returns a normalized subscription.
 */
const stripeSubscriptionToNormalized = (stripeSub: Subscription) => {
  const item = stripeSub.items[0]
  const metadata = item.price?.product?.metadata || {}

  const canWrite = metadata.iap_key === 'cloud-storage' && !stripeSub.cancel_at
  const canRead = metadata.iap_key === 'cloud-storage'
  const canAPI = metadata.iap_key === 'api-access'


  if (item) {
    const normal: NormalizedSubscriptionType = {
      source: "stripe",
      id: item.id,
      active: !stripeSub.cancel_at,
      priceId: item.price.id,
      name: item.price.product.name,
      amount: item.plan.amount,
      interval: item.plan.interval,
      metadata: metadata,
      apiAccess: canAPI,
      storageRead: canRead,
      storageWrite: canWrite,
    }
    return normal
  } else {
    throw new Error('unable to find stripeSub.items[0]')
  }
}

/**
 * On User Login - Validate their Account
 * This will allow users to create an account, but not
 * proceed until they have purchased a plan.
 * @param user Firebase User
 */
const onUserLoginValidateAccount = async (user) => {
  // Get Subscriptions

  if (user) {
    closeModal('login-form')
    // Get User Subscriptions
    const mySubscriptions: Array<NormalizedSubscriptionType> = await getUserNormalizedSubscriptions(user.uid)
    // Get Available Subscriptions
    const activeSubscriptions = mySubscriptions.filter((p) => p.active)
    
    // Can they Read, write and API?
    const allMeta:PermissionsState = {
      canAPI: mySubscriptions.find((s) => s.apiAccess) ? true : false,
      canRead: mySubscriptions.find((s) => s.storageRead) ? true : false,
      canWrite: mySubscriptions.find((s) => s.storageWrite) ? true : false,
      subscriptions: activeSubscriptions,
      loggedIn: true,
      ready: true
    }

    injectSubscriptionPermissions(allMeta)
    // Update Subscriptions

    FirebaseStore.update((s) => {
      s.user = user
      s.subscriptions = mySubscriptions
      return s
    })

    return allMeta

  }
}
