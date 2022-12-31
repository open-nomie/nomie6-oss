import colors from './colors'

export const strToColor = (str) => {
  return new Hash(str).pick(colors)
}

export class Hash {
  hash: number
  assets: any
  constructor(id) {
    this.hash = this.fh5(id)
    this.assets = {}
  }
  fh5(s) {
    //Knuth multiplicative hash
    let h = 0xdeadbeef
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761)
    return (h ^ (h >>> 16)) >>> 0
  }
  xor() {
    return this.hash % 2
  }
  pick(arr, seed = '') {
    // Convert to hash+seed, then to hex
    // then get from pos 3 2 chars
    const digit2 = Math.sqrt(parseInt(`${this.hash}${seed}`, 16))
      .toString()
      .substr(3, 4)
    return arr.length ? arr[parseInt(digit2) % arr.length] : null
  }
}
