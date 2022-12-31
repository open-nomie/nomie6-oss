import { parseNumber } from '../../utils/parseNumber/parseNumber'
import { addCommas } from './uom'
import type { UOMElement } from './uom-types'
import UOMS from './uom.config'

export class UOMClass {
  id: string
  uom: UOMElement
  constructor(uomKey: string) {
    this.id = uomKey
    if (UOMS.hasOwnProperty(uomKey)) {
      this.uom = UOMS[uomKey]
    } else {
      throw new Error(`${uomKey} is an unknow unit of measure`)
    }
  }

  get system(): 'imperial' | 'metric' | 'both' {
    if (this.uom.system) return this.uom.system
    return 'both'
  }

  display(v: number): string {
    const nativeDisplay = (_v) => {
      let value: number = parseNumber(_v)
      let valueStr = `${value}`
      if (!isNaN(value) && value !== 0) {
        valueStr = addCommas(value)
      }
      if (this.uom.symbolAffix && this.uom.symbol) {
        if (this.uom.symbolAffix === 'pre') {
          return this.uom.symbol + this.uom.symbolSpace + valueStr
        } else {
          return `${valueStr}${this.uom.symbolSpace}${this.uom.symbol}`
        }
      } else {
        return valueStr
      }
    }

    return this.uom.display ? this.uom.display(v) : nativeDisplay(v)
  }

  convertValueTo(v: number, system: 'imperial' | 'metric') {
    if (this.uom.system && system !== this.uom.system) {
      if (this.uom.convert) return Math.round(100 * this.uom.convert(v)) / 100
      return v
    } else {
      return v
    }
  }

  convertTo(system: 'imperial' | 'metric'): UOMClass {
    if (this.uom.system && system !== this.uom.system) {
      const cousin = this.uom.cousin
      if (cousin) {
        return new UOMClass(cousin)
      } else {
        return this
      }
    } else {
      return this
    }
  }
}
