/**
 * nid - nomie id
 * A small utility class to generate a unique-ish ID with a set length.
 * Since nomie runs locally, a collision will be unlikedly
 *
 */
import { Md5 } from 'ts-md5/dist/md5'
export default (a1?: string | number, a2?: string | number): string => {
  let str: string = `${new Date().getTime() + Math.random()}`
  let defaultLen: number = 32
  if (!a1) {
    return Md5.hashStr(str).toString().substr(0, defaultLen)
  } else {
    if (typeof a1 == 'string') {
      let len: number = typeof a2 == 'number' ? a2 : defaultLen
      str = a1
      return Md5.hashStr(str).toString().substr(0, len)
    } else if (typeof a1 == 'number') {
      return Md5.hashStr(str).toString().substr(0, a1)
    }
  }
  return undefined
}

export function md5(str: string): string {
  return Md5.hashStr(str).toString()
}

export const fastHash = (str: string): any => {
  let hash = 0,
    i,
    chr
  if (str.length === 0) return hash
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
