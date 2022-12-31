// import Assets from "./svg/svgs.json";

import { base as colors } from '../../modules/colors/colors'

// modified for nomie...

class Hash {
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

export class Config {
  colors: Array<any> = []
  size: number = 42
  radius: number = 0.12
  constructor(starter: any = {}) {
    this.colors = (starter.colors || []).length ? starter.colors : colors
    this.size = starter.size || 42
    this.radius = starter.radius || 0.12
  }
}

export const strToColor = (str: string = '') => {
  let config = new Config()
  return new Hash(str).pick(config.colors)
}

export default class Face {
  id: any
  config: any
  hash: any
  color: any
  base: any
  assets: any
  constructor(id, config: any = {}) {
    this.id = id
    this.config = new Config(config)
    this.hash = new Hash(id)
    this.color = this.hash.pick(this.config.colors) || 'red'
    this.base = ``
    this.assets = {}
  }
  svg() {
    // let base = []
    //const assetKeys = Object.keys(this.assets);
    // const assetKeys = ["c-wear"];
    // base = assetKeys.map((layer) => {
    //   return this.hash.pick(this.assets[layer], layer);
    // });
    // Define Style
    const style = [
      `display:inline-block; overflow:hidden;`,
      `border-radius: ${this.config.size * this.config.radius}px;`,
      `position:relative; background-color: ${this.color};`,
      `width:${this.config.size}px; height:${this.config.size}px;`,
      // `box-shadow:inset 0px -4px 10px rgba(0,0,0,0.2),inset 0px 4px 10px 3px rgba(255,255,255,0.1)`,
    ]
    //${pickedWear}
    // ${base.join("")}
    const svg = `<div class="dymoji-character" style="${style.join(' ')}">
      <svg height="${this.config.size}px" viewBox="0 0 252 252" fill="none" xmlns="http://www.w3.org/2000/svg">
        
      </svg>
    </div>`
    return svg
  }
}
