<svelte:options runes={true} />

<script lang="ts">
  import { query, aiState } from '../../../ai/engine.svelte'
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
import type { DualInsightResponse } from '../../../ai/profiles/types'

  dayjs.extend(relativeTime)

  const { widget = $bindable() } = $props()

  function isAiEnabled(): boolean {
    return !!($Prefs.ai?.enabled && $Prefs.ai?.services?.[
      $Prefs.ai?.selectedService || 'claude'
    ]?.apiKey)
  }

  function openFullInsightModal() {
    if (!isAiEnabled()) return
    const modalId = `insight-modal-${widget?.id}`

    // Update store with current values, modal ID, and AI provider/model info
    insightModalData.set({
      id: modalId,
      insight: insightSummary,
      insightSummary,
      insightExtended,
      promptLabel,
      lastFetchDate,
      aiProvider: widget.data?.aiProvider || $Prefs.ai?.selectedService || 'claude',
      aiModel: widget.data?.aiModel || aiState.actualModel || 'claude-opus-4-8',
    })

    openModal({
      id: modalId,
      component: InsightModal,
    })
  }


  // Set to true to use mock/dummy responses instead of real Claude API
  // Useful for testing without spending credits
  const USE_MOCK_MODE = false

  let insightSummary = $state('')
  let insightExtended = $state('')
  let loading = $state(false)
  let error = $state<string | null>(null)
  let lastFetchDate = $state<string | null>(null)
  let promptLabel = $state('')

  let renderedInsight = $derived(insightSummary ? marked.parse(insightSummary) : '')
  let cacheState = $derived(`${widget.data?.cachedDate}${widget.data?.insightSummary}${widget.data?.insightExtended}`)

  const mockResponses: Record<string, string> = {
    patterns: `## SUMMARY
Productivity peaks Tue-Wed mornings (+40%).
Mood 30% higher on exercise days.
Evening logging consistency +25%.

## EXTENDED
Your tracking data reveals three primary pattern clusters over the analysis period:

**Temporal Pattern - Productivity Peaks**: You demonstrate a clear circadian rhythm with productivity metrics showing 35-40% elevation on Tuesday and Wednesday mornings between 6-9 AM. This pattern remains consistent across 4 weeks. Afternoon productivity drops by 25%, suggesting peak cognitive availability in early mornings.

**Behavioral Correlation - Exercise Impact**: Exercise days show measurable improvements: mood scores increase 28-32%, sleep quality improves 18-22%, and next-day productivity gains 15%. The effect is most pronounced within 6 hours of exercise completion.

**Logging Behavior Pattern**: Evening entries outnumber morning entries 3:1, with highest consistency (95%+ compliance) between 7-10 PM. Weekend logging drops 35% compared to weekdays, suggesting work-life routine dependency.

These patterns indicate your brain operates optimally in early mornings and exercises provide significant emotional and cognitive benefits. The evening logging preference suggests building accountability systems around your natural behavior patterns rather than fighting them.`,

    progress: `## SUMMARY
Goal completion improved 85% (up from 72% last week).
Consistency improved 18% over last month.
Weekends show 12% compliance drop.

## EXTENDED
Your progress toward stated goals shows encouraging upward momentum with some variance based on temporal factors:

**Weekly Improvement Trajectory**: Week-over-week comparison shows 13% progress improvement (72% → 85% completion rate). This sustained improvement across consecutive weeks indicates the system changes are gaining traction. Monthly view (30-day rolling average) shows 18% improvement from baseline, suggesting genuine behavior change rather than weekly noise.

**Consistency Metrics**: Your adherence has improved significantly with fewer tracking gaps (from 8 gaps/month → 2 gaps/month). Session completion time has normalized to 4-5 minutes, down from initial 8-10 minutes, suggesting habit formation.

**Temporal Variance**: Weekend compliance drops consistently 10-12% below weekday baseline. Tuesday-Thursday show your strongest performance (+25% above average), while Sundays show your weakest (-28% below average). This pattern suggests recovery capacity rather than motivation issues.

**Goal-Specific Progress**: Of your 4 primary goals, 3 show consistent upward trends (goal 1: +35%, goal 2: +22%, goal 3: +18%) while goal 4 remains flat. The flat goal may benefit from a system redesign or clarified success metrics.`,

    insights: `## SUMMARY
Morning goal setting 23% more successful than evening.
Metrics improving 15% over last 30 days.
Weather patterns influence outdoor tracking.

## EXTENDED
Analysis of your tracked metrics reveals three key insight categories with actionable implications:

**Goal Setting Timing Insight**: Morning-set goals show 23% higher completion rates (72% vs 58%) compared to evening-set goals. This pattern holds across all goal types. Additional analysis shows morning goal-setters also maintain better weekly momentum, suggesting early-day goal specification creates stronger attentional anchors.

**Metric Improvement Trends**: Your core metrics show 15% improvement over the rolling 30-day period. This improvement is distributed across categories: health metrics +22%, productivity metrics +12%, wellbeing metrics +10%. The differential improvement suggests certain domains are more responsive to your current interventions.

**Environmental Correlation**: Outdoor activities show strong weather correlation (r=0.68 with temperature, r=-0.45 with precipitation). On days above 65°F, outdoor activity tracking increases 35-40%. This suggests weather-responsive planning could improve consistency without requiring additional willpower.

**Emerging Patterns**: Sleep tracking and mood tracking are increasingly correlated (r=0.62, p<0.01), suggesting sleep quality becomes an increasingly reliable proxy for daily mood prediction as the behavior stabilizes.`,

    recommendations: `## SUMMARY
Schedule tasks during peak hours: Tue-Wed 6-9 AM.
Add exercise before high-priority work blocks.
Set weekend reminders for compliance gaps.

## EXTENDED
Based on your data patterns, here are three prioritized recommendations with expected outcomes:

**Priority 1: Align Schedule with Chronotype (High Impact, Low Effort)**
Schedule your 2-3 most important decision-making tasks for Tuesday-Wednesday mornings, 6-9 AM window. Your data shows 35-40% productivity elevation during this period, representing your highest cognitive capacity. Expected outcome: 20-30% improved task completion rate for priority work. Implementation: Calendar blocking for these slots 2 weeks in advance.

**Priority 2: Implement Pre-Work Exercise Protocol (High Impact, Medium Effort)**
Exercise sessions produce measurable 6-hour downstream benefits to mood (+28%), focus (+18%), and task completion (+15%). Recommendation: Schedule any exercise (minimum 15 min) within 4 hours before your peak priority work. Expected outcome: 15-20% improvement in quality metrics for post-exercise work sessions. Secondary benefit: improved evening sleep quality when morning exercise incorporated.

**Priority 3: Weekend Accountability System (Medium Impact, Low Effort)**
Your weekend compliance drops 12% below weekday baseline. Add friction to your existing weekday system: 1) phone notifications Saturday/Sunday at your peak evening logging time (8 PM), 2) simplified weekend entry forms (3 questions instead of 7), 3) group accountability (one weekend check-in text with accountability partner).`,

    trends: `## SUMMARY
Goal completion trending +65% → +85% over 30 days.
Tracking consistency improved with fewer gaps.
Activity patterns emerging by day-of-week.

## EXTENDED
Your 30-day trend analysis shows encouraging momentum across multiple dimensions with some emerging volatility patterns:

**Primary Trend - Goal Completion Upward Arc**: Your goal completion metric follows a clear upward trend from 65% baseline to current 85%, averaging +0.67% improvement per day. This is a statistically significant trend (trend line p<0.01). The improvement shows no signs of plateau despite 30 days, suggesting sustainable behavior change rather than temporary motivation spike. Velocity analysis: improvement pace is decelerating slightly (first week: +2.5%/day, fourth week: +0.3%/day), which is normal as easier habits are automated and remaining challenges require more effort.

**Consistency Trend - Stabilization Pattern**: Tracking gaps have declined from 8/month → 2/month (75% reduction). Gap clustering shows improvement: initially random distributed gaps, now clustered to specific days (Sundays: 40% of all gaps), suggesting systematic barrier rather than random lapses.

**Emerging Activity Patterns**: Weekly cycles are becoming more pronounced: Tuesday peak (+25% vs average), Thursday decline (-15% vs average), weekend trough (-28% vs average). This suggests weekly pattern entrenchment rather than daily volatility.

**Forecast**: Current trajectory suggests reaching 92-95% goal completion by week 6 if current trend continues. Main risk: weekend compliance becoming problematic as weekday performance improves (motivation may not transfer).`,

    wellbeing: `## SUMMARY
Positive overall assessment across key indicators.
Sleep-mood correlation: +22% on good sleep days.
Stress decreased 22% since tracking began.

## EXTENDED
Comprehensive wellbeing assessment shows positive trending with specific driver identification:

**Sleep Quality Impact**: Sleep quality is your strongest wellbeing lever. Days following 7+ hour nights show 22% higher mood scores, 18% improved stress ratings, and 25% better social engagement. Sleep represents your most reliable wellbeing predictor (r=0.72 with overall wellness).

**Stress Trend Analysis**: Stress levels have shown sustained decline: baseline stress score 7.2/10 → current 5.6/10 (22% improvement). Decline is not linear; largest drops occurred weeks 2-3, suggesting initial system changes provided primary relief with ongoing incremental gains.

**Social Interaction Effect**: Days with social interaction (>30 min meaningful interaction) show 25% higher satisfaction ratings. Weekly social totals correlate with weekend mood (r=0.68). Isolated weeks show 35% lower satisfaction despite goal completion success, suggesting social connection is necessary for overall wellbeing even when productivity goals are met.

**Physical Wellness Pattern**: Exercise shows dose-response relationship: <30 min provides basic benefits, 30-60 min optimal, >90 min shows diminishing returns. Current exercise frequency (3x/week) is adequate for mood regulation but suboptimal for long-term resilience.`,

    productivity: `## SUMMARY
Peak hours Tue-Wed 6-9 AM: +40% output.
Post-rest-day productivity: +28% improvement.
Task switching costs ~25 minutes per occurrence.

## EXTENDED
Productivity analysis reveals significant optimization opportunities through temporal and task-structure modifications:

**Chronotype Optimization**: Morning hours show dramatically elevated productivity: 6-9 AM baseline +40%, 9 AM-noon baseline +18%, afternoon baseline -15%, evening baseline -25%. This pattern is consistent across all work types, suggesting fundamental circadian rhythm alignment rather than task-specific variation.

**Rest-Productivity Cycle**: Post-rest-day productivity increases 28% (measured by task completion metrics). This suggests your system is rest-responsive: adequate recovery directly enables productivity. Current schedule provides 1.5 rest days/week, which is sufficient to generate observable improvements but suboptimal for peak performance (research suggests 2-2.5 optimize sustained output).

**Context Switching Cost**: Task switches average 25-minute productivity penalty (measured as time to return to baseline focus). Batching tasks by type reduces this cost 60-70%. You currently switch contexts 8-12 times daily; consolidating to 3-4 context blocks would save 2+ hours daily productivity.

**Tool Usage Analysis**: Productivity is highest when working in distraction-minimized environment (phone away: +35%, single-app focus: +28%, notification silence: +22%). Current environment changes have been inconsistently applied.`,

    health: `## SUMMARY
Exercise-sleep quality correlation: +18-22%.
Hydration patterns consistent and healthy.
Recovery improves 35% on rest days.

## EXTENDED
Health metrics analysis shows strong positive indicators with clear lifestyle intervention points:

**Exercise-Sleep Quality Relationship**: Exercise days show 18-22% improvement in measured sleep quality metrics (measured by deep sleep percentage). This relationship holds regardless of exercise type. Effect is strongest when exercise occurs 6-8 hours before sleep (maximum 22% improvement) versus morning exercise (12% improvement). Current 3x/week frequency is minimal effective dose; 4-5x/week would likely provide additional 5-8% improvement.

**Hydration Consistency**: Your hydration tracking shows excellent consistency (95%+ compliance) with stable daily averages (2.1-2.3 liters). This consistency is associated with 15% more stable mood ratings and 12% better cognitive performance relative to your low-hydration days. Hydration is your most optimized health behavior.

**Recovery Patterns**: Rest day metrics show 35% improvement in recovery markers (muscle soreness, perceived fatigue, resting heart rate). Current 1.5 rest days/week appears adequate for your activity level but increasing to 2 structured rest days would likely accelerate recovery 10-15%.

**Emerging Health Concerns**: Sleep variability (range 5.5-8.5 hours) is your highest health volatility. Stabilizing sleep would likely provide 15-20% wellbeing improvement. Sleep appears sleep-quality-dependent rather than duration-dependent based on your data patterns.`,

    mood: `## SUMMARY
Mood 30% higher on social interaction days.
Morning mood 22% more variable than evening.
Activities consistently elevate mood identified.

## EXTENDED
Mood pattern analysis reveals strong external dependency patterns with clear intervention opportunities:

**Social Interaction Effect**: Social interaction days (>30 minutes meaningful connection) show 28-32% mood elevation relative to isolated days. Effect is stronger for in-person (32% elevation) versus text-only (8% elevation) interaction. Your mood is more socially-dependent than average, suggesting social rhythms should be a primary wellness lever.

**Time-of-Day Volatility**: Morning mood shows 22% higher variability (std dev 1.8 vs evening 1.4) around a slightly lower average (morning: 6.1/10, evening: 6.4/10). This suggests your mood is increasingly stabilized throughout the day by activity and social interaction rather than starting the day in a neutral state.

**Mood-Elevating Activities Identified**: Three activities show consistent mood elevation: outdoor time (+35% average), creative activities (+28%), exercise (+22%). Current weekly frequency of these activities is sporadic (outdoor: 2-3x, creative: 1x, exercise: 3x). Increasing outdoor time and creative activities would likely boost baseline mood by 15-20%.

**Mood Sustainability**: Your mood shows positive correlation with previous day's sleep (r=0.67) and current day exercise (r=0.45), explaining 42-60% of daily mood variance. The remaining variance appears social/contextual dependent. Focus on sleep + exercise as foundational, then add social/activity optimization for additional gains.`,

    correlation: `## SUMMARY
Exercise ↔ Sleep Quality: r=0.78 (strong).
Social Time ↔ Mood: r=0.72 (strong).
Stress ↔ Productivity: r=-0.65 (inverse).

## EXTENDED
Correlation analysis reveals three major relationship clusters with predictive and intervention value:

**Exercise-Sleep Quality Correlation (r=0.78, very strong positive)**: Exercise days produce 18-22% improvement in measured sleep quality, independent of exercise timing. This is among the strongest relationships in your data. Implication: exercise is one of your most powerful sleep optimization tools. Increasing from 3x → 5x weekly would likely improve baseline sleep quality 15-25%.

**Social Time-Mood Correlation (r=0.72, strong positive)**: Days with >30 minutes meaningful social interaction show 28% mood elevation. Effect varies by interaction type: in-person (r=0.72), phone (r=0.48), text (r=0.15). Implication: in-person social frequency is your second-strongest mood lever. Current pattern (sporadic, event-driven) is suboptimal; scheduled weekly social time would stabilize mood baseline.

**Stress-Productivity Inverse Correlation (r=-0.65, strong negative)**: High-stress days show 35% productivity reduction. This relationship is bidirectional: stress reduces productivity, and productivity slumps increase stress perception. Implication: stress management is productivity management. Breaking this cycle likely requires one intervention in the stress chain (sleep improvement, exercise increase, or social connection boost).

**Secondary Correlations**: Sleep quality-stress (r=-0.58), Physical activity-social mood (r=0.42), Rest-recovery mood (r=0.51). These secondary relationships suggest multi-factor reinforcement: improving sleep, exercise, and social time creates compounding wellbeing improvements.`,
  }

  function getMockResponse(promptKey: string): string {
    return mockResponses[promptKey] || mockResponses.insights
  }

  async function shouldFetchInsight(): Promise<boolean> {
    const today = dayjs().format('YYYY-MM-DD')

    // Check for new dual-level cache first
    if (widget.data?.insightSummary && widget.data?.cachedDate === today) {
      console.log('[Insight Widget] Using cached dual-level insight from', widget.data.cachedDate)
      insightSummary = widget.data.insightSummary
      insightExtended = widget.data.insightExtended || widget.data.insightSummary
      lastFetchDate = widget.data.cachedDate
      promptLabel = getPromptLabel(widget.data?.promptValue || 'Custom Prompt')
      return false
    }

    // Fallback: check for legacy single-level cache
    if (widget.data?.cachedInsight && widget.data?.cachedDate === today) {
      console.log('[Insight Widget] Using legacy cached insight from', widget.data.cachedDate)
      insightSummary = widget.data.cachedInsight
      insightExtended = widget.data.cachedInsight
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
      let response: any
      if (USE_MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
        const mockContent = getMockResponse(widget.data.promptValue)
        response = {
          content: {
            summary: mockContent,
            extended: mockContent,
            raw: mockContent
          }
        }
      } else {
        response = await query({
          profile: 'insight',
          prompt: promptText,
          contextHints: {
            dateRange: {
              from: timeframe.start.format('YYYY-MM-DD'),
              to: timeframe.end.format('YYYY-MM-DD'),
            },
          },
        })
      }

      // Handle both dual-level and legacy single-level responses
      const content = response.content as DualInsightResponse | string
      let summary = ''
      let extended = ''

      if (typeof content === 'object' && 'summary' in content) {
        // Dual-level response
        summary = content.summary || content.extended || ''
        extended = content.extended || content.summary || ''
      } else {
        // Legacy single-level response (fallback)
        summary = content as string
        extended = content as string
      }

      insightSummary = summary
      insightExtended = extended
      const today = dayjs().format('YYYY-MM-DD')

      // Update widget data with dual-level cache (include provider/model info)
      widget.data = widget.data || {}
      widget.data.insightSummary = summary
      widget.data.insightExtended = extended
      widget.data.cachedDate = today
      widget.data.cachedAt = Date.now()
      widget.data.aiProvider = $Prefs.ai?.selectedService || 'claude'
      widget.data.aiModel = aiState.actualModel || 'claude-opus-4-8'

      lastFetchDate = today
      loading = false

      // Save dashboard to persist cache
      const currentDashboard = $DashStore.activeDashboard
      if (currentDashboard) {
        saveDashboard(currentDashboard)
      }
    } catch (e) {
      const errorMessage = (e as Error).message || 'Failed to generate insight'
      console.error('[Insight Widget] Error:', e)

      // Check for OpenRouter-specific errors (already formatted in openrouter.ts)
      if (errorMessage.includes('openrouter.ai/settings/credits')) {
        error = errorMessage
      } else if (errorMessage.toLowerCase().includes('openrouter')) {
        error = errorMessage
      }
      // Check for Claude API credit/quota errors
      else if (
        errorMessage.toLowerCase().includes('credit') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('insufficient')
      ) {
        error = 'Out of Claude credits. Add credits to claude.com to continue.'
      }
      // Check for rate limiting
      else if (errorMessage.toLowerCase().includes('rate limit')) {
        const selectedService = $Prefs.ai?.selectedService || 'claude'
        if (selectedService === 'openrouter') {
          error = 'OpenRouter rate limit exceeded (20 requests/min). Wait a moment and try again.'
        } else {
          error = 'Rate limited. Wait a moment and try again.'
        }
      } else {
        error = errorMessage
      }

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
      // Clear both dual-level and legacy fields
      widget.data.insightSummary = undefined
      widget.data.insightExtended = undefined
      widget.data.cachedInsight = undefined
      widget.data.cachedDate = undefined
      widget.data.cachedAt = undefined
      insightSummary = ''
      insightExtended = ''
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

<div class="flex flex-col h-full justify-between {!isAiEnabled() ? 'opacity-50' : ''}">
  {#if !isAiEnabled()}
    <div class="flex items-center justify-center h-full">
      <div class="text-center px-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">AI is disabled</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Enable in settings to use insights</p>
      </div>
    </div>
  {:else if loading}
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
  {:else if insightSummary}
    <div class="px-2 h-full flex flex-col">
      <div class="insight-container px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition border border-primary-300 rounded mb-2" onclick={openFullInsightModal}>
        <div class="text-xs leading-relaxed text-gray-900 dark:text-gray-100 markdown-content">
          {@html renderedInsight}
        </div>
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
