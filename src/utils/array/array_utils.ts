import chunk from 'lodash/chunk'
import uniq from 'lodash/uniq'

export default {
  split(arr = []) {
    let half = Math.ceil(arr.length * 0.5)
    return [arr.splice(0, half), arr.splice(-half)]
  },
  unique(array) {
    return uniq(array)
  },
  chunk(array, chunkSize) {
    return chunk(array, chunkSize)
  },
}

/**
 * It takes an array of objects and a key, and returns a new array of objects with no duplicates based
 * on the key
 * @param array - The array you want to deduplicate
 * @param {string} key - The key to dedup by.
 * @returns an array of objects that have unique ids.
 */
export const dedupArray = (array: Array<any>, key: string): Array<any> => {
  return Array.from(new Set(array.map((a) => a[key]))).map((id) => {
    return array.find((a) => a.id === id)
  })
}
