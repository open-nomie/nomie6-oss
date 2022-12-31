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

export const dedupArray = (array: Array<any>, key: string): Array<any> => {
  return Array.from(new Set(array.map((a) => a[key]))).map((id) => {
    return array.find((a) => a.id === id)
  })
}
