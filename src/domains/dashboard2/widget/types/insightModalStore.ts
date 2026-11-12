import { writable } from 'svelte/store'

export const insightModalData = writable({
  id: '',
  insight: '',           // For backward compatibility
  insightSummary: '',    // Widget display version
  insightExtended: '',   // Modal full version
  promptLabel: '',
  lastFetchDate: null as string | null,
  aiProvider: 'claude' as string,
  aiModel: 'claude-opus-4-8' as string,
})
