import {
  decryptWithPassword,
  encryptWithPassword,
  getNewKeyPair,
  getStoredKeys,
  keyToString,
  restoreFromBackup,
  stringToKey,
} from './encryption'
import { firebaseAuth, getDocSnap, getUserPasscode, saveDoc } from '../firebase/FirebaseStore'

import { BlueBox } from './BlueBox'
import { Interact } from '../../store/interact'
import type { KeyPairType } from './encryption'
import { Lang } from '../../store/lang'
import NPaths from '../../paths'
import { showToast } from '../../components/toast/ToastStore'
import { wait } from '../../utils/tick/tick'
import { writable } from 'svelte/store'
import { getRawPrefs } from '../preferences/Preferences'
import { closePasscodeModal } from '../firebase/useEncryptionModal'

const encryptionStoreState: {
  keyPair: KeyPairType | undefined
  privateKeyBackupStatus: 'unknown' | 'saved' | 'not-saved'
  blueBox: BlueBox
  readyToEncrypt: boolean
} = {
  keyPair: undefined,
  privateKeyBackupStatus: 'unknown',
  blueBox: new BlueBox(),
  readyToEncrypt: false,
}

export const EncryptionStore = writable(encryptionStoreState)
export const blueBox = new BlueBox()

const askToBackupKey = async () => {
  const yesSetup = await Interact.confirm(
    Lang.t('encryption.account-security-needed', '🔒 Set your Security Phrase'),
    Lang.t(
      'encryption.encryption-phrase-description',
      `This will allow you to decrypt Nomie Cloud data on this device.`
    ),
    'Set',
    'Later'
  )

  if (yesSetup) {
    /**
     * Backup the users Keys to Firebase
     * We will ask the user to provide their passphrase
     * so we can encrypt it locally before sending it to
     * firebase
     */
    return await backupKeys(blueBox.keyPair, true, true).catch(e=>{
      console.error(e);
    })
  }
  return undefined
}

export const EncryptionStoreInit = async () => {
  const storedKeyPair = await getStoredKeys()
  const publicKey: Uint8Array | undefined = await getPublicKeyFromServer()
  const secretBackup: string | undefined = await getKeyBackup()
  const prefs = getRawPrefs()
  /**
   * No Stored Key ...
   * Either need to create one, or load from backup
   * If the user does not have a stored Key
   */
  // If we're iniitializing Encryption - then let's demand a keypair
  // && prefs.storageType === 'firebase'
  
  if (!storedKeyPair ) {
    /**
     * User has a public key,
     * but no private key in storage. They need to
     * restore from backup...
     */
     
    if (publicKey && secretBackup) {
     
      await Interact.alert(
        'Security Phrase Required',
        "You have an existing public key and encrypted data on this Nomie account. To decrypt on this device, you'll need to provide your Encryption Passprhase"
      )
      await wait(300);
      
      const blueBox = await tryToRestoreKeys({
        secretBackup,
        publicKey,
        isFirst: false,
        canClose: false
      })

      if (blueBox) {
        await Interact.confetti()
        await wait(1000)
        await Interact.alert('👍 Device authorized', 'This device can now interact with your Nomie Cloud account securely.')
        window.location.href = '/'
      } else {
        await Interact.error('Sorry, we were unable to verify your security phase. Will reload now.')
        window.location.reload()
      }
    } else if (publicKey && !secretBackup) {
      /**
       * They have an account already, and a public key, but they havent backedup their keys yet.
       */

      await Interact.alert(
        'A Public key was found, but no Private key.',
        'This account was setup on another device, without creating backup Encryption Phrase. Go to that device, and generate your Backup Encryption Phrase, then come back, refresh the app, and enter it when asked.'
      )
    } else {
      // Create the keys
      const uid = firebaseAuth.currentUser?.uid

      // Regardless what they pick, we need to generate the keyPair now
      Interact.loading('Generating encryption keys...')
      await wait(500)
      const keyPair = getNewKeyPair(); // Fake Temp
      
      blueBox.init(keyPair)
      await blueBox.saveToDevice()

      // Save public doc
      const publicDoc = {
        publicKey: keyToString(blueBox.keyPair.publicKey),
        created: new Date().toJSON(),
      }

      // Save public key
      await saveDoc(NPaths.blueBox(uid), publicDoc)
      let cancelLoading = Interact.loading('Keys Generating!')
      await wait(600)
      cancelLoading()

      // Alert User to what we need to collect
      await askToBackupKey()
      // Refresh App after Loading
      window.location.reload()
    }
  } else if (storedKeyPair) {
    
    blueBox.init(storedKeyPair);
    // && prefs.storageType == 'firebase'
    /**
     * We have a device saved key
     * Proceed as normal
     */
    
    if (!secretBackup) {
      await askToBackupKey()
    }

    EncryptionStore.update((s) => {
      s.keyPair = storedKeyPair
      s.readyToEncrypt = true
      return s
    })
    // tell blue box to use this stored keypair
    blueBox.init(storedKeyPair)
  }
  return EncryptionStore
}

/**
 * Import a Key from a String
 * Allow users to paste in a stringified version of the key
 */
export const importKeysFromString = async () => {
  await wait(200)
  const value: string = await Interact.prompt('Secret Key', 'Use the keys you copied from the other device', {
    valueType: 'textarea',
  })
  if (value) {
    try {
      await blueBox.fromString(value)
      await Interact.alert('New Keys Imported')
      window.location.reload()
    } catch (e) {
      await wait(200)
      Interact.error(e.message)
    }
  }
}

/**
 * Export Key as a String
 * This will allow users to export the key, copy it
 * and paste it into another device - so they can
 * avoid using the encrypted backup if they want.
 */
export const exportKeysAsString = async () => {
  await Interact.alert('This is SUPER PRIVATE', 'Do not share this information with ANYONE but yourself.')
  await wait(300)
  await Interact.prompt('Your keys', undefined, {
    valueType: 'textarea',
    value: __getKeysAsString(),
  })
}

export const __getKeysAsString = (): string => {
  return blueBox.toString()
}

/**
 * Backup Keys for the user
 * @param keyPair
 * @param isFirst
 * @returns
 */
export const backupKeys = async (keyPair: KeyPairType, isFirst: boolean, canCancel: boolean = false) => {
  const uid = firebaseAuth.currentUser?.uid
  // Get users pass phrase
  const passcode = await getUserPasscode(isFirst, canCancel)
  if (passcode) {
    // Encrypt secretKey with passcode
    const blueBox = new BlueBox(keyPair)
    const encryptedKey = await encryptWithPassword(blueBox.toString(), passcode)
    // Prompt they did a good job
    await Interact.alert('Encrypted keys saved.', `Your keys are now encrypted and saved to your Nomie Cloud account.`)

    const privateBackup = {
      key: encryptedKey,
    }

    await saveDoc(`${NPaths.blueBox(uid)}/backups/main`, privateBackup)
    showToast({ message: 'Keys successfully backed up' })
    closePasscodeModal()
    return true
  } else {
    return false
  }
}

type RestoreKeysProps = {
  publicKey: Uint8Array
  secretBackup: string
  isFirst: boolean,
  canClose?: boolean
}

/**
 * Try to Restore from backup
 *
 * @param props RestoreKeyProps - publicKey, secretBackup, isFirst
 * @returns
 */
export const tryToRestoreKeys = async (props: RestoreKeysProps): Promise<BlueBox> => {
  
  try {
    const passcode = await getUserPasscode(props.isFirst, props.canClose)
    const decryptedSecretKey = await decryptWithPassword(props.secretBackup, passcode)
    // Get a new Bluebox from the Backup string
    const blueBox = await restoreFromBackup(decryptedSecretKey)
    if (blueBox) {
      return blueBox
    } else {
      throw new Error('Unable to restore your keys, please try the Secruity Phrase again')
    }
  } catch (e) {
    if (e.message.match('Malformed UTF-8')) {
      await Interact.alert('Invalid', 'We could not decrypt your backup key using those answers. Please try again.')
    } else {
      await Interact.alert('error', e.message)
    }
    return tryToRestoreKeys(props)
  }
}

/**
 * Get signed in user Public Key
 * @returns Uint8Array
 */
export const getPublicKeyFromServer = async (): Promise<Uint8Array | undefined> => {
  const uid = firebaseAuth.currentUser?.uid
  const path = `${NPaths.blueBox(uid)}`

  const publicKeyDoc = await getDocSnap(path)
  if (publicKeyDoc.exists()) {
    const doc = publicKeyDoc.data()
    const key = doc?.publicKey ? stringToKey(doc.publicKey) : undefined
    return key
  } else {
    return undefined
  }
}

export const getKeyBackup = async (): Promise<string> => {
  const uid = firebaseAuth.currentUser?.uid
  const path = `${NPaths.blueBox(uid)}/backups/main`

  const privateKeyBackup: any = await getDocSnap(path).catch((e) => {
    console.error('Error getting privateKeybackup', e)
  })
  if (privateKeyBackup?.exists()) {
    return privateKeyBackup.data().key
  } else {
    return undefined
  }
}
