import localforage from 'localforage'
import nacl, { box } from 'tweetnacl'
import CryptoJS from 'crypto-js'

import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util'
import { BlueBox } from './BlueBox'

export type KeyPairType = {
  secretKey: Uint8Array
  publicKey: Uint8Array
}

type EncryptedString = string

/**
 * Get the IndexedDB Storage Engine going
 * This will be used to avoid saving it in localStorage
 */
export const encStorage = localforage.createInstance({
  name: 'nomiencl',
})

/**
 * Does this device have keys installed?
 * @returns Promise boolean
 */
export const hasKeys = async (): Promise<Boolean> => {
  return (await getStoredKeys()) ? true : false
}

/**
 * Generate a new public private key combo
 * @returns
 */
export const getNewKeyPair = (): KeyPairType => {
  const { publicKey, secretKey } = box.keyPair()
  return {
    publicKey,
    secretKey,
  }
}

/**
 * Converts a Public/Private key to a serialized string
 * @param key: Uint8Array
 * @returns string;
 */
export const keyToString = (key: Uint8Array): string => {
  if (key.length === 32) return key.toString()
  throw new Error(`${key} is not a valid key`)
}

/**
 * Converts a Public/Private encoded string to a key
 * @param str
 * @returns  Uint8Array
 */
export const stringToKey = (str: any): Uint8Array => {
  const items = str.split(',')
  if (items.length !== 32) throw new Error('This is not a valid key')
  const ab = new Uint8Array(items.length)
  items.forEach((item, i) => {
    ab[i] = parseInt(item)
  })
  return ab
}

/**
 * Get this devices stored Keys
 * @returns KeyPairType | undefined
 */
export const getStoredKeys = async (): Promise<KeyPairType | undefined> => {
  return await encStorage.getItem('keyPair')
}

/**
 * Encode Object to String
 * @param obj
 * @returns string
 */
export const encodeObjectToBase64 = (obj: any): string => {
  const str = JSON.stringify(obj)
  return window.btoa(str)
}

/**
 * Decode Base64 Object
 * Decodes base64 string to an js object
 * @param str
 * @returns
 */
export const decodeBase64ToObject = (str) => {
  const obj = window.atob(str)
  return JSON.parse(obj)
}

/**
 * Decrypt a String
 * @param encryptedMessage
 * @param secretKey
 * @returns any
 */
export const decryptString = (encryptedMessage: EncryptedString, secretKey: Uint8Array) => {
  const decodedPayload = decodeBase64ToObject(encryptedMessage)
  // Get the Secret as a UInt8Array
  let secretUInt8Array: Uint8Array = secretKey
  // Extract the nonce
  const nonce = decodeBase64(decodedPayload.nonce)
  // Extract Cipher Text
  const ciphertext = decodeBase64(decodedPayload.ciphertext)
  // Extract epehmeral public key
  const ephemPubKey = decodeBase64(decodedPayload.ephemPubKey)
  // Decrypt the message
  const decryptedMessage = nacl.box.open(ciphertext, nonce, ephemPubKey, secretUInt8Array)
  // Convert it to a JSON string
  return encodeUTF8(decryptedMessage)
}

/**
 * Decrypt Data
 * Converts data to a string, then uses decryptString
 * @param encryptedMessage
 * @param secretKey
 * @returns object
 */
export const decryptData = (encryptedMessage: EncryptedString, secretKey: Uint8Array) => {
  // Decode String to Encryption Payload
  const unencryptedData = decryptString(encryptedMessage, secretKey)
  // Return a JSON parsed string
  return JSON.parse(unencryptedData)
}

/**
 * Encrypt a String
 * @param str
 * @param publicKey
 * @returns string
 */
export const encryptString = (str: string, publicKey: Uint8Array): EncryptedString => {
  const ephemeralKeyPair = nacl.box.keyPair()
  const pubKeyUInt8Array = publicKey
  const msgParamsUInt8Array = decodeUTF8(str)
  const nonce = nacl.randomBytes(nacl.box.nonceLength)
  const encryptedMessage = nacl.box(msgParamsUInt8Array, nonce, pubKeyUInt8Array, ephemeralKeyPair.secretKey)
  return encodeObjectToBase64({
    ciphertext: encodeBase64(encryptedMessage),
    ephemPubKey: encodeBase64(ephemeralKeyPair.publicKey),
    nonce: encodeBase64(nonce),
    version: 'x25519-xsalsa20-poly1305',
  })
}

/**
 * Encrypt a JS object
 * Converts it to a json string then encrypts with encryptString
 * @param data
 * @param publicKey
 * @returns
 */
export const encryptData = (data: any, publicKey: Uint8Array) => {
  return encryptString(JSON.stringify(data), publicKey)
}

/**
 * Restore a key pair from a string
 * @param keysAsString
 * @returns
 */
export const restoreFromBackup = async (keysAsString: string): Promise<BlueBox> => {
  if (!keysAsString) throw new Error('Missing the keys as a string')
  const testBlueBox = new BlueBox().fromString(keysAsString)
  const testObj = { name: 'Nomie' }
  const encrypted = testBlueBox.encrypt(testObj)
  const unencryptedData = testBlueBox.decrypt(encrypted)
  if (unencryptedData.name === testObj.name) {
    await encStorage.setItem('keyPair', testBlueBox.keyPair)

    return testBlueBox
  } else {
    throw new Error('Invalid public private key combination')
  }
}

/**
 * Export with a known passphrase
 * Using SSHCrack/aes-password - imported
 * @param data
 * @param key
 * @returns
 */
export const encryptWithPassword = async (data: any, key: string): Promise<string> => {
  const dataStr = encodeObjectToBase64(data)
  const encryptedMessage = await CryptoJS.AES.encrypt(dataStr, key).toString()

  return encryptedMessage
}

/**
 * Decrypt a string given a known passphrase
 * @param str
 * @param key
 * @returns
 */
export const decryptWithPassword = async (encryptedString: string, key: string) => {
  const decryptedObject = CryptoJS.AES.decrypt(encryptedString, key).toString(CryptoJS.enc.Utf8)
  return decodeBase64ToObject(decryptedObject)
}
