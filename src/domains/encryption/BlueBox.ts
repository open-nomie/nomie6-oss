/**
 * BlueBox is a simple class to quickly do encryption and decryption
 */

import {
  decodeBase64ToObject,
  decryptData,
  encodeObjectToBase64,
  encryptData,
  encStorage,
  keyToString,
  stringToKey,
} from './encryption'

import type { KeyPairType } from './encryption'

export class BlueBox {
  keyPair: KeyPairType | undefined

  constructor(keyPair?: KeyPairType) {
    if (keyPair) {
      this.init(keyPair)
    }
  }

  /**
   * Initialize with a Key Pair
   * @param kp
   * @returns
   */
  init(kp: KeyPairType): BlueBox {
    this.keyPair = kp
    return this
  }

  /**
   * Encrypt Data using the Key Pair
   * @param data
   * @returns
   */
  encrypt(data: any) {
    return encryptData(data, this.keyPair.publicKey)
  }

  /**
   * Decrypt Data using the KeyPair
   * @param str
   * @returns
   */
  decrypt(str: string) {
    return decryptData(str, this.keyPair.secretKey)
  }

  /**
   * Create an encoded string of the keys
   * @returns
   */
  toString() {
    const data = {
      publicKey: keyToString(this.keyPair.publicKey),
      secretKey: keyToString(this.keyPair.secretKey),
    }
    return encodeObjectToBase64(data)
  }

  /**
   * Save Key Pair to Device
   * @returns
   */
  async saveToDevice() {
    return await encStorage.setItem('keyPair', this.keyPair)
  }

  /**
   * Convert from a String to a KeyPair
   * @param str
   * @returns
   */
  fromString(str: string): BlueBox {
    try {
      const obj = decodeBase64ToObject(str)
      const secret = stringToKey(obj.secretKey)
      const publicKey = stringToKey(obj.publicKey)
      if (publicKey.length === 32 && secret.length === 32) {
        this.keyPair = {
          secretKey: secret,
          publicKey: publicKey,
        }
        return this
      } else {
        throw new Error('Items need to be a 32 length Uint8Array')
      }
    } catch (e) {
      throw Error(e.message)
    }
  }
}
