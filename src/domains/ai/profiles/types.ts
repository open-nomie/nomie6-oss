export type ProfileName = 'insight' | 'data' | 'advice' | 'journal' | 'alert' | 'narrative' | 'chat'

export interface AIRequest {
  profile: ProfileName
  prompt: string
  contextHints?: {
    metrics?: string[]
    dateRange?: {
      from: string
      to: string
    }
    component?: string
  }
}

export interface AIResponse<T = string> {
  profile: ProfileName
  content: T
  raw: string
}

export interface Profile {
  name: ProfileName
  temperature: number
  maxTokens: number
  systemPrompt: (context: UserContext, prompt?: string) => string
  parseResponse: (raw: string) => unknown
}

// Base context with all available data and details
export interface RichContext {
  recentMetrics: Record<string, unknown>
  goals: string[]
  summary: string
  people?: Record<string, {
    count: number
    recent: (string | number)[]
  }>
  contexts?: Record<string, {
    count: number
    recent: (string | number)[]
  }>
  pointers?: Record<string, {
    count: number
    recent: (string | number)[]
  }>
  locations?: Array<{
    name?: string
    lat?: number
    lng?: number
    count: number
    lastUsed: string
  }>
  notes?: string
}

// Summary context - high-level overview only
export interface SummaryContext {
  summary: string
  goals: string[]
}

// Metrics-focused context
export interface MetricsContext {
  recentMetrics: Record<string, unknown>
  goals: string[]
  summary: string
}

// Journal/Notes-focused context
export interface JournalContext {
  notes?: string
  summary: string
  goals: string[]
}

// People-focused context
export interface PeopleContext {
  people?: Record<string, {
    count: number
    recent: (string | number)[]
  }>
  summary: string
}

// Location-focused context
export interface LocationContext {
  locations?: Array<{
    name?: string
    lat?: number
    lng?: number
    count: number
    lastUsed: string
    recentDates?: string[]
  }>
  summary: string
}

// Backward compatibility
export type UserContext = RichContext

export interface ChartDataset {
  chartType: 'line' | 'bar' | 'scatter'
  title: string
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    color?: string
  }>
}

export interface AdviceItem {
  headline: string
  detail: string
  priority: 'high' | 'medium' | 'low'
  relatedMetrics: string[]
}

export interface AlertItem {
  metric: string
  message: string
  severity: 'warning' | 'critical'
  trend: 'up' | 'down' | 'flat'
}

export interface JournalPrompt {
  opening_question: string
  follow_up_questions: string[]
  mood_scale_label: string
}

export interface DualInsightResponse {
  summary: string      // 3-4 lines for widget display
  extended: string     // ~1000 tokens for modal
  raw: string         // Full unparsed response
}
