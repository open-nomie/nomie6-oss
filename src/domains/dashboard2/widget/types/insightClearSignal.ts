import { writable } from 'svelte/store'

export const insightClearSignal = writable<number>(0)

export function triggerInsightClear() {
  insightClearSignal.update(v => v + 1)
}
