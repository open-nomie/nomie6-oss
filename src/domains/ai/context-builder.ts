import type { UserContext, RichContext, SummaryContext, MetricsContext, JournalContext, PeopleContext, LocationContext } from './profiles/types'
import { get } from 'svelte/store'
import { LedgerStore } from '../ledger/LedgerStore'
import { TrackableStore } from '../trackable/TrackableStore'
import { UsageStore } from '../usage/UsageStore'
import { GoalStore } from '../goals/GoalStore'
import { LocationStore, findNearestLocation } from '../locations/LocationStore'
import dayjs from 'dayjs'
import { tokenizeLite } from '../../modules/tokenizer/lite'

interface ContextHints {
  metrics?: string[]
  dateRange?: { from: string; to: string }
  component?: string
}

interface CorrelationContext extends RichContext {
  correlations?: Array<{
    metric1: string
    metric2: string
    correlation: number
    description: string
  }>
}

interface TrendContext extends RichContext {
  trends?: Array<{
    metric: string
    direction: 'up' | 'down' | 'flat'
    momentum: number
    lastValue: number
  }>
}

interface GoalProgressContext extends RichContext {
  goalProgress?: Array<{
    goal: string
    currentValue?: number
    targetValue: number
    percentComplete: number
    daysRemaining?: number
  }>
}

interface HealthContext extends RichContext {
  healthMetrics?: Record<string, any>
}

interface PatternContext extends RichContext {
  temporalPatterns?: {
    byDayOfWeek?: Record<string, any>
    byHourOfDay?: Record<string, any>
    locations?: any
  }
}

export interface NarrativeContextData {
  entries_by_date: Record<string, { notes: string[]; count: number }>
  total_entries: number
  date_range: { from: string; to: string }
  summary: string
}

export async function buildContext(hints?: ContextHints): Promise<UserContext> {
  try {
    const metrics = await fetchMetrics(hints?.metrics, hints?.dateRange)
    const goals = await fetchGoals()
    const people = await fetchPeople(hints?.dateRange)
    const contexts = await fetchContexts(hints?.dateRange)
    const pointers = await fetchPointers(hints?.dateRange)
    const locations = await fetchLocations(hints?.dateRange)
    const summary = buildSummary(metrics, goals, people, contexts, pointers, locations)

    return {
      recentMetrics: metrics,
      goals,
      summary,
      people,
      contexts,
      pointers,
      locations
    }
  } catch (err) {
    console.error('Error building AI context:', err)
    return {
      recentMetrics: {},
      goals: [],
      summary: 'Unable to load user data at this time.'
    }
  }
}

export async function buildChatContext(hints?: ContextHints): Promise<UserContext> {
  try {
    const dateRange = hints?.dateRange || {
      from: dayjs().subtract(14, 'days').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD')
    }

    const trackableStore = get(TrackableStore)
    const trackables = trackableStore.trackables || {}

    // Query logs with full date range
    const logs = await LedgerStore.query({
      start: dayjs(dateRange.from),
      end: dayjs(dateRange.to)
    })

    // Build daily metrics with dates for better temporal understanding
    const dailyMetrics: Record<string, Record<string, any>> = {}

    logs.forEach((log: any) => {
      if (!log.note) return
      const logDate = dayjs(log.end).format('YYYY-MM-DD')
      if (!dailyMetrics[logDate]) dailyMetrics[logDate] = {}

      const tokens = tokenizeLite(log.note)
      tokens.forEach((token: any) => {
        if (token.type !== 'tracker' && token.type !== 'person') return

        const key = `${token.prefix}${token.id}`
        if (!dailyMetrics[logDate][key]) {
          dailyMetrics[logDate][key] = { values: [], count: 0 }
        }
        dailyMetrics[logDate][key].values.push(token.value || 1)
        dailyMetrics[logDate][key].count++
      })
    })

    // Aggregate by applying tracker math rules
    const enrichedMetrics: Record<string, any> = {}
    Object.entries(dailyMetrics).forEach(([date, dayData]) => {
      Object.entries(dayData).forEach(([key, data]: [string, any]) => {
        if (!enrichedMetrics[key]) enrichedMetrics[key] = []

        const tracker = Object.values(trackables).find((t: any) => {
          return `${t.type === 'tracker' ? '#' : '@'}${t.tag}` === key
        }) as any

        let aggregated = data.values[0]
        if (tracker?.math === 'sum') {
          aggregated = data.values.reduce((a: number, b: number) => a + b, 0)
        } else if (tracker?.math === 'mean' || tracker?.math === 'average') {
          aggregated = data.values.reduce((a: number, b: number) => a + b, 0) / data.values.length
        }

        enrichedMetrics[key].push({ date, value: aggregated, count: data.count })
      })
    })

    // Also collect actual note content for journal analysis
    const notesByDate: Record<string, string[]> = {}
    logs.forEach((log: any) => {
      if (!log.note) return
      const logDate = dayjs(log.end).format('YYYY-MM-DD')
      if (!notesByDate[logDate]) notesByDate[logDate] = []
      notesByDate[logDate].push(log.note)
    })

    // Format notes for display
    const notesContent = Object.entries(notesByDate)
      .map(([date, notes]) => `${date}: ${notes.join(' | ')}`)
      .join('\n')

    const goals = await fetchGoals()
    const people = await fetchPeople(hints?.dateRange)
    const contexts = await fetchContexts(hints?.dateRange)
    const pointers = await fetchPointers(hints?.dateRange)
    const locations = await fetchLocations(hints?.dateRange)
    const summary = buildSummary(enrichedMetrics, goals, people, contexts, pointers, locations)

    return {
      recentMetrics: enrichedMetrics,
      goals,
      summary,
      people,
      contexts,
      pointers,
      locations,
      notes: notesContent
    }
  } catch (err) {
    console.error('Error building chat context:', err)
    return {
      recentMetrics: {},
      goals: [],
      summary: 'Unable to load user data at this time.'
    }
  }
}

async function fetchMetrics(
  keys?: string[],
  range?: { from: string; to: string }
): Promise<Record<string, unknown>> {
  try {
    const trackableStore = get(TrackableStore)
    const trackables = trackableStore.trackables || {}

    // Query logs from ledger
    const logs = await LedgerStore.query({
      start: range?.from ? dayjs(range.from) : dayjs().subtract(30, 'days'),
      end: range?.to ? dayjs(range.to) : dayjs()
    })

    const metrics: Record<string, unknown> = {}

    // Extract tokens from all logs and group by id
    const tokensByKey: Record<string, any[]> = {}
    logs.forEach((log: any) => {
      if (!log.note) return

      // Parse note to extract tokens
      const tokens = tokenizeLite(log.note)

      tokens.forEach((token: any) => {
        // Skip non-trackable tokens
        if (token.type !== 'tracker' && token.type !== 'person' && token.type !== 'context' && token.type !== 'pointer') {
          return
        }

        // Build key with prefix - all trackables are stored with their prefix
        const key = `${token.prefix}${token.id}`

        if (!tokensByKey[key]) tokensByKey[key] = []
        const value = token.value !== undefined && token.value !== '' ? token.value : 1
        tokensByKey[key].push(value)
      })
    })


    if (keys && keys.length > 0) {
      for (const key of keys) {
        const trackable = trackables[key]
        if (trackable && tokensByKey[key]) {
          const values = tokensByKey[key]
          const aggregated = aggregateValues(values, trackable as any)
          metrics[key] = {
            label: (trackable as any).label,
            count: values.length,
            recent: values.slice(-5),
            aggregated: aggregated.value,
            aggregationType: aggregated.type
          }
        }
      }
    } else {
      const trackableEntries = Object.entries(trackables)

      for (const [key, trackable] of trackableEntries) {
        if (tokensByKey[key]) {
          const values = tokensByKey[key]
          const aggregated = aggregateValues(values, trackable as any)
          metrics[key] = {
            label: (trackable as any)?.label || key,
            count: values.length,
            recent: values.slice(-3),
            aggregated: aggregated.value,
            aggregationType: aggregated.type
          }
        }
      }
    }

    return metrics
  } catch (err) {
    console.error('Error fetching metrics:', err)
    return {}
  }
}

async function fetchGoals(): Promise<string[]> {
  try {
    const goals: string[] = []
    const goalMap = new Map<string, any>()

    // Get goals from GoalStore
    const goalStore = get(GoalStore)

    if (goalStore && Array.isArray(goalStore)) {
      for (let i = 0; i < goalStore.length; i++) {
        const g = goalStore[i] as any

        if (g && g.tag) {
          const durationLabel = g.duration ? `(${g.duration})` : '(daily)'
          const comparisonLabel = getComparisonLabel(g.comparison)
          const description = `${g.tag}: ${comparisonLabel} ${g.target}${g.unit || ''} ${durationLabel}`

          // Group by tag-duration to allow multiple goals per metric
          const key = `${g.tag}-${g.duration}`
          if (!goalMap.has(key)) {
            goalMap.set(key, description)
            goals.push(description)
          }
        }
      }
    }
    return goals.slice(0, 15)
  } catch (err) {
    console.error('Error fetching goals:', err)
    return []
  }
}

function aggregateValues(values: any[], tracker: any): { value: number; type: string } {
  if (!values || values.length === 0) {
    return { value: 0, type: 'empty' }
  }

  // Filter out zeros if tracker specifies to ignore them
  let processValues = values
  if (tracker?.ignore_zeros) {
    processValues = values.filter((v) => v !== 0 && v !== '0')
  }

  if (processValues.length === 0) {
    return { value: 0, type: 'empty' }
  }

  // Convert to numbers
  const numValues = processValues.map((v) => {
    const num = typeof v === 'string' ? parseFloat(v) : v
    return isNaN(num) ? 0 : num
  })

  // Aggregate based on tracker's math property
  const mathType = tracker?.math || 'sum'

  if (mathType === 'mean' || mathType === 'average') {
    const sum = numValues.reduce((a, b) => a + b, 0)
    const average = sum / numValues.length
    return { value: Math.round(average * 100) / 100, type: 'average' }
  }

  // Default to sum
  const sum = numValues.reduce((a, b) => a + b, 0)
  return { value: Math.round(sum * 100) / 100, type: 'sum' }
}

function getComparisonLabel(comparison?: string): string {
  const labels: Record<string, string> = {
    'gt': 'more than',
    'gte': 'at least',
    'lt': 'less than',
    'lte': 'at most',
    'eq': 'exactly'
  }
  return labels[comparison || ''] || 'target'
}

export async function buildNarrativeContext(hints?: ContextHints): Promise<NarrativeContextData> {
  try {
    const from = hints?.dateRange?.from ? dayjs(hints.dateRange.from) : dayjs().subtract(30, 'days')
    const to = hints?.dateRange?.to ? dayjs(hints.dateRange.to) : dayjs()

    // Query logs from ledger
    const logs = await LedgerStore.query({
      start: from,
      end: to
    })

    // Group notes by date, excluding purely metric notes
    const entries_by_date: Record<string, { notes: string[]; count: number }> = {}
    let total_entries = 0

    logs.forEach((log: any) => {
      if (!log.note) return

      // Extract the note text, filtering out pure tracker notation
      const noteText = log.note.trim()

      // Skip if it's just tracker entries with no actual text content
      const hasTextContent = /[a-zA-Z]{3,}/.test(noteText) // At least 3 consecutive letters
      if (!hasTextContent) return

      const dateKey = dayjs(log.end).format('YYYY-MM-DD')
      if (!entries_by_date[dateKey]) {
        entries_by_date[dateKey] = { notes: [], count: 0 }
      }

      entries_by_date[dateKey].notes.push(noteText)
      entries_by_date[dateKey].count++
      total_entries++
    })

    // Create summary
    const dates = Object.keys(entries_by_date).length
    const avgEntriesPerDay = dates > 0 ? Math.round((total_entries / dates) * 100) / 100 : 0
    const summary = `${total_entries} journal entries over ${dates} days (avg ${avgEntriesPerDay}/day)`

    return {
      entries_by_date,
      total_entries,
      date_range: {
        from: from.format('YYYY-MM-DD'),
        to: to.format('YYYY-MM-DD')
      },
      summary
    }
  } catch (err) {
    console.error('Error building narrative context:', err)
    return {
      entries_by_date: {},
      total_entries: 0,
      date_range: {
        from: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
      },
      summary: 'Unable to load journal entries'
    }
  }
}

// Specialized context builders for different use cases
export async function buildSummaryContext(hints?: ContextHints): Promise<SummaryContext> {
  try {
    const goals = await fetchGoals()
    const summary = buildSummary({}, goals)

    return {
      summary,
      goals: goals.slice(0, 5)
    }
  } catch (err) {
    console.error('Error building summary context:', err)
    return {
      summary: 'Unable to load summary.',
      goals: []
    }
  }
}

export async function buildMetricsContext(hints?: ContextHints): Promise<MetricsContext> {
  try {
    const metrics = await fetchMetrics(hints?.metrics, hints?.dateRange)
    const goals = await fetchGoals()
    const summary = buildSummary(metrics, goals)

    return {
      recentMetrics: metrics,
      goals,
      summary
    }
  } catch (err) {
    console.error('Error building metrics context:', err)
    return {
      recentMetrics: {},
      goals: [],
      summary: 'Unable to load metrics.'
    }
  }
}

export async function buildJournalContext(hints?: ContextHints): Promise<JournalContext> {
  try {
    const dateRange = hints?.dateRange || {
      from: dayjs().subtract(14, 'days').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD')
    }

    const logs = await LedgerStore.query({
      start: dayjs(dateRange.from),
      end: dayjs(dateRange.to)
    })

    const notesByDate: Record<string, string[]> = {}
    logs.forEach((log: any) => {
      if (!log.note) return
      const logDate = dayjs(log.end).format('YYYY-MM-DD')
      if (!notesByDate[logDate]) notesByDate[logDate] = []
      notesByDate[logDate].push(log.note)
    })

    const notesContent = Object.entries(notesByDate)
      .map(([date, notes]) => `${date}: ${notes.join(' | ')}`)
      .join('\n')

    const goals = await fetchGoals()
    const summary = buildSummary({}, goals)

    return {
      notes: notesContent || 'No notes available',
      summary,
      goals
    }
  } catch (err) {
    console.error('Error building journal context:', err)
    return {
      summary: 'Unable to load journal context.',
      goals: []
    }
  }
}

export async function buildPeopleContext(hints?: ContextHints): Promise<PeopleContext> {
  try {
    const people = await fetchPeople(hints?.dateRange)
    const summary = buildSummary({}, [], people)

    return {
      people,
      summary
    }
  } catch (err) {
    console.error('Error building people context:', err)
    return {
      summary: 'Unable to load people context.'
    }
  }
}

export async function buildLocationContext(hints?: ContextHints): Promise<LocationContext> {
  try {
    const locations = await fetchLocations(hints?.dateRange)
    const summary = buildSummary({}, [], undefined, undefined, undefined, locations)

    return {
      locations,
      summary
    }
  } catch (err) {
    console.error('Error building location context:', err)
    return {
      summary: 'Unable to load location context.'
    }
  }
}

export async function buildCorrelationContext(hints?: ContextHints): Promise<CorrelationContext> {
  try {
    const richCtx = await buildChatContext(hints)

    // Extract metrics and calculate simple correlations
    const correlations: any[] = []
    const metricKeys = Object.keys(richCtx.recentMetrics || {})

    // Basic correlation detection (simplified - compares trends)
    for (let i = 0; i < metricKeys.length; i++) {
      for (let j = i + 1; j < metricKeys.length; j++) {
        const m1 = richCtx.recentMetrics[metricKeys[i]] as any
        const m2 = richCtx.recentMetrics[metricKeys[j]] as any

        if (Array.isArray(m1) && Array.isArray(m2) && m1.length > 0 && m2.length > 0) {
          // Simple trend correlation: both trending up/down or opposite
          const trend1 = m1[m1.length - 1]?.value > m1[0]?.value ? 1 : -1
          const trend2 = m2[m2.length - 1]?.value > m2[0]?.value ? 1 : -1
          const corr = (trend1 === trend2) ? 0.5 : -0.5

          if (Math.abs(corr) > 0.3) {
            correlations.push({
              metric1: metricKeys[i],
              metric2: metricKeys[j],
              correlation: corr,
              description: trend1 === trend2 ? 'Both trending together' : 'Trending in opposite directions'
            })
          }
        }
      }
    }

    return {
      ...richCtx,
      correlations: correlations.slice(0, 5)
    }
  } catch (err) {
    console.error('Error building correlation context:', err)
    return await buildChatContext(hints)
  }
}

export async function buildTrendContext(hints?: ContextHints): Promise<TrendContext> {
  try {
    const richCtx = await buildChatContext(hints)

    const trends: any[] = []

    Object.entries(richCtx.recentMetrics || {}).forEach(([key, data]: [string, any]) => {
      if (Array.isArray(data) && data.length >= 2) {
        const values = data.map((d: any) => d.value)
        const lastValue = values[values.length - 1]
        const prevValue = values[values.length - 2]
        const avgValue = values.reduce((a: number, b: number) => a + b, 0) / values.length

        const direction = lastValue > avgValue ? 'up' : lastValue < avgValue ? 'down' : 'flat'
        const momentum = ((lastValue - prevValue) / (prevValue || 1)) * 100

        trends.push({
          metric: key,
          direction,
          momentum,
          lastValue
        })
      }
    })

    return {
      ...richCtx,
      trends: trends.slice(0, 10)
    }
  } catch (err) {
    console.error('Error building trend context:', err)
    return await buildChatContext(hints)
  }
}

export async function buildGoalProgressContext(hints?: ContextHints): Promise<GoalProgressContext> {
  try {
    const richCtx = await buildChatContext(hints)
    const goalStore = get(GoalStore)

    const goalProgress: any[] = []

    if (Array.isArray(goalStore)) {
      for (const goal of goalStore) {
        const metricKey = `#${goal.tag}`
        const metricData = richCtx.recentMetrics[metricKey] as any

        if (metricData && metricData.aggregated !== undefined) {
          const current = metricData.aggregated
          const target = parseFloat(goal.target) || 0
          const percentComplete = (current / target) * 100

          goalProgress.push({
            goal: `${goal.tag}: ${goal.comparison} ${goal.target}${goal.unit || ''}`,
            currentValue: Math.round(current * 100) / 100,
            targetValue: target,
            percentComplete: Math.round(percentComplete),
            daysRemaining: goal.duration === 'daily' ? 1 : 7
          })
        }
      }
    }

    return {
      ...richCtx,
      goalProgress
    }
  } catch (err) {
    console.error('Error building goal progress context:', err)
    return await buildChatContext(hints)
  }
}

export async function buildHealthContext(hints?: ContextHints): Promise<HealthContext> {
  try {
    const richCtx = await buildChatContext(hints)

    // Filter for health-related metrics
    const healthKeywords = ['sleep', 'heart', 'hrv', 'steps', 'exercise', 'workout', 'mood', 'energy', 'stress', 'anxiety']
    const healthMetrics: Record<string, any> = {}

    Object.entries(richCtx.recentMetrics || {}).forEach(([key, value]) => {
      const keyLower = key.toLowerCase()
      if (healthKeywords.some(h => keyLower.includes(h))) {
        healthMetrics[key] = value
      }
    })

    return {
      ...richCtx,
      recentMetrics: healthMetrics,
      healthMetrics
    }
  } catch (err) {
    console.error('Error building health context:', err)
    return await buildChatContext(hints)
  }
}

export async function buildPatternContext(hints?: ContextHints): Promise<PatternContext> {
  try {
    const richCtx = await buildChatContext(hints)
    const dateRange = hints?.dateRange || {
      from: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
      to: dayjs().format('YYYY-MM-DD')
    }

    const logs = await LedgerStore.query({
      start: dayjs(dateRange.from),
      end: dayjs(dateRange.to)
    })

    // Analyze temporal patterns
    const byDayOfWeek: Record<string, number> = {}
    const byHourOfDay: Record<string, number> = {}

    logs.forEach((log: any) => {
      if (log.note) {
        const logDay = dayjs(log.end).format('dddd')
        const logHour = dayjs(log.end).format('HH')

        byDayOfWeek[logDay] = (byDayOfWeek[logDay] || 0) + 1
        byHourOfDay[logHour] = (byHourOfDay[logHour] || 0) + 1
      }
    })

    return {
      ...richCtx,
      temporalPatterns: {
        byDayOfWeek,
        byHourOfDay,
        locations: richCtx.locations?.slice(0, 5)
      }
    }
  } catch (err) {
    console.error('Error building pattern context:', err)
    return await buildChatContext(hints)
  }
}

async function fetchPeople(range?: { from: string; to: string }): Promise<Record<string, any> | undefined> {
  try {
    const logs = await LedgerStore.query({
      start: range?.from ? dayjs(range.from) : dayjs().subtract(30, 'days'),
      end: range?.to ? dayjs(range.to) : dayjs()
    })

    const peopleData: Record<string, any> = {}
    const moodMetrics = ['mood', 'happiness', 'energy', 'anxiety', 'stress']

    logs.forEach((log: any) => {
      if (!log.note) return
      const tokens = tokenizeLite(log.note)

      tokens.forEach((token: any) => {
        if (token.type === 'person') {
          const key = `@${token.id}`
          if (!peopleData[key]) {
            peopleData[key] = { values: [], dates: [] }
          }
          peopleData[key].values.push(token.value || 1)
          peopleData[key].dates.push(new Date(log.end))
        }
      })
    })

    // Convert to final format and calculate correlations
    const result: Record<string, any> = {}
    for (const [key, data] of Object.entries(peopleData)) {
      result[key] = {
        count: data.values.length,
        recent: data.values.slice(-3)
      }
    }

    return Object.keys(result).length > 0 ? result : undefined
  } catch (err) {
    console.error('Error fetching people data:', err)
    return undefined
  }
}

async function fetchContexts(range?: { from: string; to: string }): Promise<Record<string, any> | undefined> {
  try {
    const logs = await LedgerStore.query({
      start: range?.from ? dayjs(range.from) : dayjs().subtract(30, 'days'),
      end: range?.to ? dayjs(range.to) : dayjs()
    })

    const contextsData: Record<string, any> = {}

    logs.forEach((log: any) => {
      if (!log.note) return
      const tokens = tokenizeLite(log.note)

      tokens.forEach((token: any) => {
        if (token.type === 'context') {
          const key = `+${token.id}`
          if (!contextsData[key]) {
            contextsData[key] = { values: [], dates: [] }
          }
          contextsData[key].values.push(token.value || 1)
          contextsData[key].dates.push(new Date(log.end))
        }
      })
    })

    // Convert to final format
    const result: Record<string, any> = {}
    for (const [key, data] of Object.entries(contextsData)) {
      result[key] = {
        count: data.values.length,
        recent: data.values.slice(-3)
      }
    }

    return Object.keys(result).length > 0 ? result : undefined
  } catch (err) {
    console.error('Error fetching contexts:', err)
    return undefined
  }
}

async function fetchPointers(range?: { from: string; to: string }): Promise<Record<string, any> | undefined> {
  try {
    const logs = await LedgerStore.query({
      start: range?.from ? dayjs(range.from) : dayjs().subtract(30, 'days'),
      end: range?.to ? dayjs(range.to) : dayjs()
    })

    const pointersData: Record<string, any> = {}

    logs.forEach((log: any) => {
      if (!log.note) return
      const tokens = tokenizeLite(log.note)

      tokens.forEach((token: any) => {
        if (token.type === 'pointer') {
          const key = `^${token.id}`
          if (!pointersData[key]) {
            pointersData[key] = { values: [], dates: [] }
          }
          pointersData[key].values.push(token.value || 1)
          pointersData[key].dates.push(new Date(log.end))
        }
      })
    })

    // Convert to final format
    const result: Record<string, any> = {}
    for (const [key, data] of Object.entries(pointersData)) {
      result[key] = {
        count: data.values.length,
        recent: data.values.slice(-3)
      }
    }

    return Object.keys(result).length > 0 ? result : undefined
  } catch (err) {
    console.error('Error fetching pointers:', err)
    return undefined
  }
}

async function fetchLocations(range?: { from: string; to: string }): Promise<Array<any> | undefined> {
  try {
    const logs = await LedgerStore.query({
      start: range?.from ? dayjs(range.from) : dayjs().subtract(30, 'days'),
      end: range?.to ? dayjs(range.to) : dayjs()
    })

    const locationsMap: Record<string, any> = {}
    let logsWithLocation = 0

    // Get saved locations from LocationStore for name resolution
    const savedLocations = get(LocationStore)

    logs.forEach((log: any, index: number) => {
      // Include logs that have location coordinates (lat/lng must be numbers)
      if (typeof log.lat !== 'number' || typeof log.lng !== 'number') {
        return
      }

      logsWithLocation++

      // Try to resolve location name from saved locations
      let locationName = log.location || undefined

      if (!locationName && log.lat && log.lng) {
        const nearestLocation = findNearestLocation({ lat: log.lat, lng: log.lng }, savedLocations)
        if (nearestLocation) {
          locationName = nearestLocation.name
        }
      }

      // Use coordinates as key for grouping
      const key = `${log.lat.toFixed(4)},${log.lng.toFixed(4)}`
      const logDate = dayjs(log.end).format('YYYY-MM-DD')

      if (!locationsMap[key]) {
        locationsMap[key] = {
          name: locationName,
          lat: log.lat,
          lng: log.lng,
          count: 0,
          lastUsed: logDate,
          dates: [] // Track all dates
        }
      }

      locationsMap[key].count++
      locationsMap[key].lastUsed = logDate
      // Keep last 7 unique dates
      if (!locationsMap[key].dates.includes(logDate)) {
        locationsMap[key].dates.push(logDate)
      }
    })


    // Sort by frequency and return top locations
    const locations = Object.values(locationsMap)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10) // Top 10 locations
      .map((loc: any) => ({
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        count: loc.count,
        lastUsed: loc.lastUsed,
        recentDates: loc.dates.slice(-7).reverse() // Last 7 dates, most recent first
      }))

    return locations.length > 0 ? locations : undefined
  } catch (err) {
    console.error('Error fetching locations:', err)
    return undefined
  }
}

function buildSummary(metrics: Record<string, unknown>, goals: string[], people?: Record<string, any>, contexts?: Record<string, any>, pointers?: Record<string, any>, locations?: Array<any>): string {
  const metricNames = Object.keys(metrics)
    .filter(k => k.startsWith('#'))
    .map(k => k.substring(1))
    .join(', ')
  const personNames = people ? Object.keys(people).map(k => k.substring(1)).join(', ') : ''
  const contextNames = contexts ? Object.keys(contexts).map(k => k.substring(1)).join(', ') : ''
  const pointerNames = pointers ? Object.keys(pointers).map(k => k.substring(1)).join(', ') : ''
  const locationNames = locations ? locations.map(l => l.name || `${l.lat?.toFixed(2)},${l.lng?.toFixed(2)}`).join(', ') : ''
  const activeGoals = goals.slice(0, 3).join('; ')

  let summary = ''

  if (metricNames) {
    summary += `The user is tracking: ${metricNames}. `
  }

  if (personNames) {
    summary += `Interactions with: ${personNames}. `
  }

  if (contextNames) {
    summary += `Contexts: ${contextNames}. `
  }

  if (pointerNames) {
    summary += `Pointers/Topics: ${pointerNames}. `
  }

  if (locationNames) {
    summary += `Primary locations: ${locationNames}. `
  }

  if (activeGoals) {
    summary += `Active goals: ${activeGoals}.`
  }

  if (!metricNames && !personNames && !contextNames && !pointerNames && !locationNames) {
    summary = 'No tracking data available yet.'
  }

  return summary
}
