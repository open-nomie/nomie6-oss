export type UOMGroupingTypes =
  | 'general'
  | 'currency'
  | 'timer'
  | 'time'
  | 'distance'
  | 'temperature'
  | 'weight'
  | 'volume'
  | 'health'

export interface UOMElement {
  singular: string
  plural: string
  symbol: string
  type: UOMGroupingTypes
  symbolAffix?: 'post' | 'pre'
  display?: Function
  symbolSpace?: boolean
  system?: 'metric' | 'imperial'
  cousin?: string
  key?: string
  convert?: Function
}

export interface IUOM {
  [key: string]: UOMElement
}
