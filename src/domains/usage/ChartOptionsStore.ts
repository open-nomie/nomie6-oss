import { writable } from 'svelte/store'

type ChartOptions = {
  type: 'bar' | 'line'
  startWithZero: boolean
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
