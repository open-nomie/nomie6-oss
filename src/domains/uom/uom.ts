import type { UOMElement } from './uom-types'
import UOMS from './uom.config'

export const addCommas = (base: number = 0): string => {
  const num: string = `${base}`
  const x = num.split('.')
  let x1 = x[0]
  const x2 = x.length > 1 ? '.' + x[1] : ''
  const rgx = /(\d+)(\d{3})/
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2')
  }
  return x1 + x2
}

function main() {
  /**
   * Array of UOMS
   */
  function toArray(): Array<UOMElement> {
    return Object.keys(UOMS).map((key) => {
      const obj: UOMElement = UOMS[key]
      obj.key = key
      return obj
    })
  }

  /**
   * Map of UOMS grouped by type
   * { general: [], volume: []...}
   */
  function toGroupedArray(): any {
    const items: any = {}
    Object.keys(UOMS).forEach((key: string) => {
      const obj: UOMElement = UOMS[key]
      obj.key = key
      const type: any = obj.type
      if (type) {
        const itemType: Array<any> = items[type] || []
        itemType.push(obj)
      }
    })
    return items
  }

  /**
   * Format a value to a UOM's display
   * @param value Number
   * @param key String
   * @param includeUnit boolean
   */
  function format(value: any, key: string, includeUnit: boolean = true): string {
    if (Object.prototype.hasOwnProperty.call(UOMS, key) && !isNaN(value)) {
      const symbol = UOMS[key].symbol
      const affix = UOMS[key].symbolAffix
      const space = UOMS[key].symbolSpace || false ? ' ' : ''
      // Get display formatter for key if one exists.
      const displayFormatter = UOMS[key].display || null
      // Does the UOM have it's own display formatter?
      if (displayFormatter) {
        return displayFormatter(value) // displayFormatter(v);
      } else {
        if (!isNaN(parseFloat(value)) && isFinite(value) && value !== 0) {
          value = addCommas(value)
        }
        if (affix && symbol && includeUnit) {
          if (affix === 'pre') {
            return symbol + space + value
          } else {
            return value + space + symbol
          }
        } else {
          return value
        }
      } // end if the uom has it's own display
    } else {
      return value
    }
  }

  /**
   * Plural
   * @param key string
   */
  function plural(key: string): string {
    return Object.prototype.hasOwnProperty.call(UOMS, key) ? UOMS[key].plural : key
  }

  /**
   * Singular
   * @param key string
   */
  function singular(key: string): string {
    return Object.prototype.hasOwnProperty.call(UOMS, key) ? UOMS[key].singular : key
  }

  /**
   * Abreviation
   * @param key string
   */
  function abv(key: string): any {
    return Object.prototype.hasOwnProperty.call(UOMS, key) ? UOMS[key].symbol : null
  }

  /**
   * Add Comma to a number
   * @param base number
   */

  return {
    toArray,
    toGroupedArray,
    plural,
    singular,
    abv,
    format,
    addCommas,
  }
}

export default main()
