import type { UOMElement } from './uom-types'
import UOMS from './uom.config'

type GroupUOMS = {
  [key: string]: Array<UOMElement>
}

export const uomPlural = (uomKey: string): string => {
  const uom = UOMS[uomKey]
  if (!uom) return uomKey
  return uom.plural
}

export const uomSingular = (uomKey: string): string => {
  const uom = UOMS[uomKey]
  if (!uom) return uomKey
  return uom.singular
}

export const uomSymbol = (uomKey: string): string => {
  const uom = UOMS[uomKey]
  if (!uom || !uom.symbol) return ''
  return uom.symbol
}

export const getUOM = (uomKey: string): UOMElement | undefined => {
  return UOMS[uomKey]
}

const uomDefaultFormat = (value: number, uomKey: string, includeSymbold: boolean = true) => {
  const str: Array<any> = [value]
  const uom = getUOM(uomKey)
  if (!uom) return value
  if (uom.symbolAffix === 'post' && includeSymbold) {
    str.push(`${uom.symbolSpace ? ' ' : ''}${uom.symbol}`)
  } else if (uom.symbolAffix === 'pre' && includeSymbold) {
    str.unshift(`${uom.symbol}${uom.symbolSpace ? ' ' : ''}`)
  }
  return str.join(' ')
}

export const uomFormat = (value: number, uomKey: string, include?: boolean) => {
  const uom = UOMS[uomKey]
  if (!uom || !uom.display) {
    return uomDefaultFormat(value, uomKey, include)
  } else {
    return uom.display(value, include)
  }
}

export const getGroupedUoms = (hideTimer: boolean = true): GroupUOMS => {
  let items: GroupUOMS = {}
  Object.keys(UOMS).forEach((key) => {
    let obj: UOMElement = UOMS[key]
    obj.key = key
    items[obj.type] = items[obj.type] || []
    items[obj.type].push(obj)
  })
  Object.keys(items).forEach((key) => {
    items[key] = items[key].sort((a, b) => {
      return a.plural > b.plural ? 1 : -1
    })
  })
  if (hideTimer) {
    delete items['timer']
  }
  return items
}
