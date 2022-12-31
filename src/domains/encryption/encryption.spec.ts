/**
 * @vitest-environment jsdom
 */
import {
  decodeBase64ToObject,
  decryptWithPassword,
  encodeObjectToBase64,
  encryptWithPassword,
  getNewKeyPair,
  hasKeys,
  keyToString,
  restoreFromBackup,
  stringToKey,
} from './encryption'

import { test, describe, expect } from 'vitest'

import { BlueBox } from './BlueBox'

// import {
//   // encodeUTF8,
//   encodeBase64,
//   // encodeUTF8,
//   // decodeBase64,
//   // decodeUTF8,
// } from "tweetnacl-util";
// import { BlueBox } from "./BlueBox";

describe('basic encoding test tests', () => {
  test('uintWork', () => {
    const keys = getNewKeyPair()
    const asString = keyToString(keys.publicKey)
    const asKey = stringToKey(asString)

    expect(asKey.toString()).toEqual(keys.publicKey.toString())
  })

  test('should work', async () => {
    // Get a BlueBox - generate some keys
    const bluebox = new BlueBox(getNewKeyPair())
    const testMessage = { test: 'boom', name: 'Bill Corbin' }
    const encryptedMessage = bluebox.encrypt(testMessage)
    // Make an object with some keys, that have been converted to string
    const obj = { name: 'Boooooomer', keys: bluebox.toString() }
    // Encode it to a string
    const encoded = encodeObjectToBase64(obj)
    // Decode the string
    const decoded = decodeBase64ToObject(encoded)
    // Import it into the new BlueBox
    const bluebox2 = new BlueBox().fromString(decoded.keys)
    // Do they match?
    expect(bluebox.keyPair.publicKey).toEqual(bluebox2.keyPair.publicKey)
    // Lets see if we can decrypt
    const decryptedMessage: any = bluebox2.decrypt(encryptedMessage)
    expect(decryptedMessage.name).toEqual(testMessage.name)
  })
})

describe('Blue Box Testing', () => {
  test('BlueBox to to initialize', () => {
    const blueBox = new BlueBox()
    expect(blueBox).toBeInstanceOf(BlueBox)
  })
  test('Should get a KeyPair', () => {
    const blueBox = new BlueBox(getNewKeyPair())
    expect(blueBox.keyPair.secretKey).toBeTruthy()
    expect(blueBox.keyPair.publicKey).toBeTruthy()
  })

  test('It should encrypt and decrypt a string', () => {
    const blueBox = new BlueBox(getNewKeyPair())
    const strTest = `"Hello there sir"`
    const encrypted = blueBox.encrypt(strTest)
    const decrypted = blueBox.decrypt(encrypted)
    expect(decrypted).toEqual(strTest)
  })
  test('It should encrypt and decrypt an object', () => {
    const blueBox = new BlueBox(getNewKeyPair())
    const objTest = { name: 'Blue Elephant', age: 7 }
    const encrypted = blueBox.encrypt(objTest)
    const decrypted = blueBox.decrypt(encrypted)
    expect(decrypted).toEqual(objTest)
  })

  test('it should survive', async () => {
    const firstBlue = new BlueBox()
    firstBlue.init(getNewKeyPair())
    const testObj = { name: 'tester' }
    const firstEncryption = firstBlue.encrypt(testObj)
    const keyStrings = firstBlue.toString()
    // Setup a new Blue box
    const secondBlue = new BlueBox()
    await secondBlue.fromString(keyStrings)
    const decryptedObj = secondBlue.decrypt(firstEncryption)
    expect(decryptedObj.name).toBe(testObj.name)
  })

  test('save to device', async () => {
    const bb = new BlueBox()
    bb.init(getNewKeyPair())
    const saved = await bb.saveToDevice()
    expect(saved).toBeTruthy()
  })

  test('it should catch invalid data', () => {
    const keys = { publicKey: '12345', secretKey: '12345' }
    const encodedKeys = {
      publicKey: encodeObjectToBase64(keys.publicKey),
      secretKey: encodeObjectToBase64(keys.secretKey),
    }
    const keyString = encodeObjectToBase64(encodedKeys)

    try {
      const bb = new BlueBox().fromString(keyString)
      const encrypted = bb.encrypt('name')
      console.info({ encrypted })
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })
})

describe('Testing encryption utiltiy functions', () => {
  test('It should look for keys', async () => {
    let keysExist = await hasKeys()
    expect(keysExist).toBeTruthy()
  })
  test('restore from backup', async () => {
    const keys = getNewKeyPair()
    const bb = new BlueBox(keys)
    const asString = bb.toString()
    const setup = await restoreFromBackup(asString)
    expect(setup).toBeTruthy()
  })
  test('Should not restore from backup if invalid key pair', async () => {
    try {
      //@ts-ignore
      const setup = await restoreFromBackup(new Uint8Array())
    } catch (e) {
      expect(e).toBeTruthy()
    }
  })
})

describe('testing password based encryption decryption', () => {
  test('It should encrypt to a string', async () => {
    const password = 'donkey-elephant-frog'
    const obj = { name: 'Boooooomer' }
    const encrypted = await encryptWithPassword(obj, password)
    const decrypted = await decryptWithPassword(encrypted, password)
    expect(decrypted.name).toBe(obj.name)
  })
})

describe('testing encoding of uit8', () => {
  // test("It should encode and decode", ()=>{

  // });

  test('It should encode and deode them', async () => {
    const keyPair = getNewKeyPair()
    expect(keyPair.publicKey).toBeTruthy()
    const publicKey = keyPair.publicKey
    const encodedPublicKey = keyToString(publicKey)

    const encryptedKey = await encryptWithPassword(encodedPublicKey, 'hi there')
    const decodedPublicKey = await decryptWithPassword(encryptedKey, 'hi there')
    // const decodedPublicKey = decodeBase64(deencryptedKey);

    expect(decodedPublicKey.toString()).toEqual(publicKey.toString())
  })
})
