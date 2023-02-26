import { writable } from 'svelte/store'
import type { Trackable } from '../trackable/Trackable.class'

type ChartOptions = {
  type: 'bar' | 'line'
  startWithZero: boolean
  stats: 'none' | "avg" | 'sma-7' | 'sma-15' | 'sma-30' | 'ema-7' | 'ema-15' | 'ema-30' | 'split-11' | 'split-12' | 'split-13' | 'cumm'
  include: Trackable
}
export type ChartOptionsStoreState = {
  [key: string]: ChartOptions
}

export const saveChartOptions = (id: string, options: ChartOptions) => {
  const existing = getChartOptions()
  existing[id] = options
  localStorage.setItem('chart-options', JSON.stringify(existing))
}

export const getChartOption = (id: string): ChartOptions | undefined => {
  return getChartOptions()[id]
}

export const getChartOptions = (): ChartOptionsStoreState => {
  try {
    const base = localStorage.getItem('chart-options') || '{}'
    return JSON.parse(base)
  } catch (e) {
    return {}
  }
}

export const ChartOptionsStore = writable<ChartOptionsStoreState>(getChartOptions())
