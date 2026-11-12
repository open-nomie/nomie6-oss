<svelte:options runes={true} />

<script lang="ts">
  import { query } from '../../../ai/engine.svelte'
  import { Prefs } from '../../../preferences/Preferences'
  import { LedgerStore } from '../../../ledger/LedgerStore'
  import { saveDashboard, DashStore } from '../../DashStore'
  import { getPromptText, getPromptLabel } from './widget-insight-prompts'
  import { openModal } from '../../../../components/backdrop/BackdropStore2'
  import InsightModal from './widget-insight-modal.svelte'
  import { insightModalData } from './insightModalStore'
  import { insightClearSignal } from './insightClearSignal'
  import { marked } from 'marked'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import type { WidgetClass } from '../widget-class'

  dayjs.extend(relativeTime)

  const { widget = $bindable() } = $props()

  function openFullInsightModal() {
    const modalId = `insight-modal-${widget?.id}`

    // Update store with current values and modal ID
    insightModalData.set({
      id: modalId,
      insight,
      promptLabel,
      lastFetchDate,
    })

    openModal({
      id: modalId,
      component: InsightModal,
    })
  }


  // Set to true to use mock/dummy responses instead of real Claude API
  // Useful for testing without spending credits
  const USE_MOCK_MODE = false

  let insight = $state('')
  let loading = $state(false)
  let error = $state<string | null>(null)
  let lastFetchDate = $state<string | null>(null)
  let promptLabel = $state('')

  let renderedInsight = $derived(insight ? marked.parse(insight) : '')
  let cacheState = $derived(`${widget.data?.cachedDate}${widget.data?.cachedInsight}`)

  const mockResponses: Record<string, string> = {
    patterns: 'Based on your tracking data, I notice three key patterns: (1) Your productivity peaks on Tuesday and Wednesday mornings, (2) Your mood is notably higher on days when you exercise, (3) You tend to log entries more consistently in the evening. These patterns suggest optimizing your schedule around your natural peak times.',
    progress: 'You\'re making solid progress towards your goals! This week you completed 85% of your daily targets, up from 72% last week. Your consistency has improved by 18% over the last month. Focus on maintaining momentum during weekends when adherence typically drops.',
    insights: 'Your data reveals interesting insights: (1) You have a 23% higher completion rate for goals set in the morning vs evening, (2) Your average metric values show 15% improvement over the last 30 days, (3) External factors like weather appear to influence your outdoor activity tracking. Leverage these insights for better planning.',
    recommendations: 'Here are 3 actionable recommendations: (1) Schedule important tasks during your identified peak performance hours (Tuesday-Wednesday morning), (2) Plan exercise sessions right before important work blocks since they boost productivity, (3) Set up weekend reminders since compliance drops by 12% on Saturdays and Sundays.',
    trends: 'Your trends over the past 30 days show: (1) Steady upward trajectory in goal completion (from 65% to 85%), (2) More consistent tracking with fewer gaps between entries, (3) Slight seasonal pattern emerging - certain activities peak on specific days. This positive momentum suggests your systems are working well.',
    wellbeing: 'Your overall wellbeing assessment is positive! Key indicators show: (1) Sleep quality and mood are correlated positively, (2) Your stress levels have decreased by 22% since you started tracking, (3) Social interactions appear to be a strong predictor of daily satisfaction. Prioritize these wellbeing drivers.',
    productivity: 'Your productivity trends are encouraging: (1) Morning focus sessions yield 40% more output than afternoon sessions, (2) You\'re most productive after rest days, (3) Task switching costs you approximately 25 minutes of productive time. Batch similar tasks together for better flow.',
    health: 'Health-related insights from your data: (1) Your exercise frequency correlates with better sleep quality, (2) You show consistent hydration patterns, (3) Your recovery metrics improve significantly on rest days. Maintaining this exercise routine is your strongest health lever.',
    mood: 'Mood pattern analysis shows: (1) Your mood is 30% higher on days with social interaction, (2) Morning mood fluctuates more than evening mood, (3) Certain activities consistently elevate your mood - prioritize these in your weekly planning. Your emotional patterns are quite stable overall.',
    correlation: 'Strong correlations detected: (1) Exercise ↔ Sleep Quality (r=0.78), (2) Social Time ↔ Mood (r=0.72), (3) Stress Level ↔ Productivity (r=-0.65 inverse). These relationships suggest focusing on exercise and social connection will have cascading positive effects on other areas.',
  }

  function getMockResponse(promptKey: string): string {
    return mockResponses[promptKey] || mockResponses.insights
  }

  async function shouldFetchInsight(): Promise<boolean> {
    const today = dayjs().format('YYYY-MM-DD')

    // If cached insight exists and is from today, use it
    if (widget.data?.cachedInsight && widget.data?.cachedDate === today) {
      console.log('[Insight Widget] Using cached insight from', widget.data.cachedDate)
      insight = widget.data.cachedInsight
      lastFetchDate = widget.data.cachedDate
      promptLabel = getPromptLabel(widget.data?.promptValue || 'Custom Prompt')
      return false
    }

    return true
  }

  async function fetchInsight() {
    // Skip AI enabled check in mock mode
    if (!USE_MOCK_MODE && !$Prefs.ai?.enabled) {
      error = 'AI is not enabled. Enable it in Settings.'
      return
    }

    // Check if API key is configured
    if (!USE_MOCK_MODE) {
      const selectedService = $Prefs.ai?.selectedService || 'claude'
      const apiKey = $Prefs.ai?.services?.[selectedService]?.apiKey
      if (!apiKey) {
        error = 'Claude API key not configured. Add it in Settings > AI Integration.'
        return
      }
    }

    if (!widget.data?.promptValue) {
      error = 'No prompt configured for this insight widget.'
      return
    }

    loading = true
    error = null

    try {
      // Get the prompt text
      const promptText = getPromptText(widget.data.promptValue)
      promptLabel = getPromptLabel(widget.data.promptValue)

      // Get logs for the timeframe
      const timeframe = widget.timeframe
      const logs = await LedgerStore.query({
        start: timeframe.start.format('YYYY-MM-DD'),
        end: timeframe.end.format('YYYY-MM-DD'),
      })

      if (!logs || logs.length === 0) {
        error = 'No data available for the selected timeframe.'
        loading = false
        return
      }

      // Query AI for insight (or use mock if in test mode)
      let insightContent: string
      if (USE_MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
        insightContent = getMockResponse(widget.data.promptValue)
      } else {
        const response = await query({
          profile: 'insight',
          prompt: promptText,
        })
        insightContent = response.content as string
      }

      insight = insightContent
      const today = dayjs().format('YYYY-MM-DD')

      // Update widget data with cache
      widget.data = widget.data || {}
      widget.data.cachedInsight = insight
      widget.data.cachedDate = today
      widget.data.cachedAt = Date.now()

      lastFetchDate = today
      loading = false

      // Save dashboard to persist cache
      const currentDashboard = $DashStore.activeDashboard
      if (currentDashboard) {
        saveDashboard(currentDashboard)
      }
    } catch (e) {
      const errorMessage = (e as Error).message || 'Failed to generate insight'

      // Check for credit/quota errors from Claude API
      if (
        errorMessage.toLowerCase().includes('credit') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('insufficient') ||
        errorMessage.toLowerCase().includes('rate limit')
      ) {
        error = 'Out of Claude credits. Add credits to claude.com to continue.'
      } else {
        error = errorMessage
      }

      console.error('[Insight Widget] Error:', e)
      loading = false
    }
  }

  function getRefreshTime(): string {
    if (!lastFetchDate) return 'N/A'
    const today = dayjs().format('YYYY-MM-DD')
    if (lastFetchDate === today) {
      const tomorrow = dayjs().add(1, 'day').startOf('day')
      const hoursUntilRefresh = tomorrow.diff(dayjs(), 'hour')
      return `${hoursUntilRefresh}h`
    }
    return 'Soon'
  }

  function clearCache() {
    if (widget?.data) {
      widget.data.cachedInsight = undefined
      widget.data.cachedDate = undefined
      widget.data.cachedAt = undefined
      insight = ''
      lastFetchDate = null

      // Save dashboard to persist cache deletion
      const currentDashboard = $DashStore.activeDashboard
      if (currentDashboard) {
        saveDashboard(currentDashboard)
      }
    }
  }

  $effect(() => {
    if (widget && widget?.data?.promptValue) {
      // Use cacheState and insightClearSignal to trigger effect when cache is cleared
      const _ = cacheState
      const __ = $insightClearSignal
      shouldFetchInsight().then((shouldFetch) => {
        if (shouldFetch) {
          fetchInsight()
        }
      })
    }
  })
</script>

<div class="flex flex-col h-full justify-between">
  {#if loading}
    <div class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="spinner mb-2"></div>
        <p class="text-xs text-gray-500 dark:text-gray-400">Generating insight...</p>
      </div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center h-full">
      <div class="text-center px-4">
        <p class="text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>
      </div>
    </div>
  {:else if insight}
    <div class="insight-container px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition border border-gray-300 dark:border-gray-600 rounded h-full" onclick={openFullInsightModal}>
      <div class="text-xs leading-relaxed text-gray-900 dark:text-gray-100 markdown-content">
        {@html renderedInsight}
      </div>
    </div>
  {:else}
    <div class="flex items-center justify-center h-full">
      <p class="text-xs text-gray-500 dark:text-gray-400">No insight available</p>
    </div>
  {/if}
</div>

<style lang="postcss" global>
  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @media (prefers-color-scheme: dark) {
    .spinner {
      border-color: #374151;
      border-top-color: #60a5fa;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .insight-container {
    height: 120px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .markdown-content {
    flex: 1;
    min-height: 0;
  }

  .markdown-content p {
    margin: 0;
    display: inline;
  }

  .markdown-content strong {
    font-weight: 600;
  }

  .markdown-content em {
    font-style: italic;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin: 0;
    padding: 0;
    display: inline;
  }

  .markdown-content li {
    display: inline;
  }

  .markdown-content li::before {
    content: ' • ';
  }

  .markdown-content li:last-child::after {
    content: '';
  }
</style>
