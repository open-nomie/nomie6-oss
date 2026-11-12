import { writable } from 'svelte/store'
import type { Trackable } from '../trackable/Trackable.class'
import Storage from '../storage/storage'

type ChartOptions = {
  type: 'bar' | 'line'
  startWithZero: boolean
  ignoreZero:boolean
  stats: 'none' | "avg" | 'sma-7' | 'sma-15' | 'sma-30' | 'ema-7' | 'ema-15' | 'ema-30' | 'split-11' | 'split-12' | 'split-13' | 'cumm'
  include?: string  // Store as trackable ID (e.g., "#tracker-name") instead of Trackable object
  showContext: boolean
}
export type ChartOptionsStoreState = {
  [key: string]: ChartOptions
}

let chartOptionsCache: ChartOptionsStoreState = {}

export const saveChartOptions = async (id: string, options: any) => {
  // Convert Trackable object to its ID string for JSON serialization
  const optionsToSave: ChartOptions = {
    type: options.type,
    startWithZero: options.startWithZero,
    ignoreZero: options.ignoreZero,
    stats: options.stats,
    include: options.include?.id || options.include,  // Store trackable ID if it's an object, or use as-is if already a string
    showContext: options.showContext,
  }
  chartOptionsCache[id] = optionsToSave
  // Save to CouchDB via Storage for multi-device sync
  await Storage.put('chart-options.json', chartOptionsCache)
}

export const getChartOption = (id: string): ChartOptions | undefined => {
  return chartOptionsCache[id]
}

export const getChartOptions = (): ChartOptionsStoreState => {
  return chartOptionsCache
}

/**
 * Register change listener for chart options to enable real-time sync
 * When chart options are updated on other devices via CouchDB,
 * this function ensures the app detects and handles those changes.
 */
export const registerChartOptionsListener = async () => {
  try {
    // Register listener for chart option changes from CouchDB sync
    Storage.get('chart-options.json', (changedOptions: ChartOptionsStoreState) => {
      // Update the cache with synced options
      if (changedOptions) {
        chartOptionsCache = changedOptions
        ChartOptionsStore.set(chartOptionsCache)
      }
    })

    // Load initial options from Storage
    const initialOptions = await Storage.get('chart-options.json')
    if (initialOptions) {
      chartOptionsCache = initialOptions
      ChartOptionsStore.set(chartOptionsCache)
    }
  } catch (e) {
    console.error('[ChartOptionsStore] Error registering chart options listener:', e)
  }
}

export const ChartOptionsStore = writable<ChartOptionsStoreState>(chartOptionsCache)
