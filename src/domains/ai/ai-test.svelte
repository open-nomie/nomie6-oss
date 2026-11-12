<svelte:options runes={true} />

<script lang="ts">
  import { query, streamQuery, aiState } from './engine.svelte'
  import { buildContext } from './context-builder'
  import type {
    AdviceItem,
    ChartDataset,
    JournalPrompt,
    AlertItem
  } from './profiles/types'
  import type { NarrativeAnalysis } from './profiles/narrative'
  import NLayout from '../layout/layout.svelte'
  import NBackButton from '../../components/back-button/back-button.svelte'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { get } from 'svelte/store'
  import dayjs from 'dayjs'
  import { tokenizeLite } from '../../modules/tokenizer/lite'

  let responseText = $state('')
  let useStreaming = $state(false)
  let testDataInfo = $state<any>(null)
  let contextSummary = $state('')
  let showTestData = $state(false)

  // Load test data on mount
  $effect.pre(() => {
    loadTestData()
  })

  async function loadTestData() {
    try {
      const thirtyDaysAgo = dayjs().subtract(30, 'days')

      // Query logs from last 30 days
      const logs = await LedgerStore.query({
        start: thirtyDaysAgo,
        end: dayjs()
      })

      console.log('📊 Logs from last 30 days:', logs?.length)

      if (!logs || logs.length === 0) {
        testDataInfo = { info: 'No tracking data available yet' }
        return
      }

      // Extract all tokens from note field using tokenizer
      const byTag: Record<string, any[]> = {}
      let totalTokens = 0

      logs.forEach((log: any) => {
        if (!log.note) return

        // Parse note to extract tokens
        const tokens = tokenizeLite(log.note)
        tokens.forEach((token: any) => {
          // Skip non-trackable tokens (like generic text, links, etc)
          if (token.type !== 'tracker' && token.type !== 'person' && token.type !== 'context' && token.type !== 'pointer') {
            return
          }

          // Build key with prefix - all trackables are stored with their prefix
          const key = `${token.prefix}${token.id}`

          if (!byTag[key]) byTag[key] = []
          byTag[key].push({ value: token.value || 1, date: log.end })
          totalTokens++
        })
      })

      console.log('📊 Extracted tokens:', totalTokens, 'Unique metrics:', Object.keys(byTag).length)

      // Get context
      const context = await buildContext({
        dateRange: {
          from: thirtyDaysAgo.format('YYYY-MM-DD'),
          to: dayjs().format('YYYY-MM-DD')
        }
      })

      testDataInfo = {
        totalEntries: totalTokens,
        uniqueMetrics: Object.keys(byTag).length,
        metrics: Object.entries(byTag).map(([tag, entries]) => ({
          tag,
          count: entries.length,
          recent: (entries as any[]).slice(-3).map((e: any) => e.value)
        }))
      }

      contextSummary = context.summary
    } catch (error) {
      console.error('Error loading test data:', error)
      testDataInfo = { error: `Failed: ${(error as Error).message}` }
    }
  }

  async function testInsight() {
    responseText = 'Loading...'
    try {
      if (useStreaming) {
        responseText = ''
        await streamQuery(
          {
            profile: 'insight',
            prompt: 'How am I doing overall based on my data?'
          },
          (chunk) => {
            responseText += chunk
          }
        )
      } else {
        const res = await query<string>({
          profile: 'insight',
          prompt: 'How am I doing overall based on my data?'
        })
        responseText = res.content
      }
    } catch (err) {
      responseText = `Error: ${(err as Error).message}`
    }
  }

  async function testAdvice() {
    responseText = 'Loading...'
    try {
      const res = await query<AdviceItem[]>({
        profile: 'advice',
        prompt: 'What actionable advice do you have for me this week?'
      })
      responseText = JSON.stringify(res.content, null, 2)
    } catch (err) {
      responseText = `Error: ${(err as Error).message}`
    }
  }

  async function testData() {
    responseText = 'Loading...'
    try {
      const res = await query<ChartDataset>({
        profile: 'data',
        prompt: 'Create a chart showing my top tracked metrics over the last week'
      })
      responseText = JSON.stringify(res.content, null, 2)
    } catch (err) {
      responseText = `Error: ${(err as Error).message}`
    }
  }

  async function testJournal() {
    responseText = 'Loading...'
    try {
      const res = await query<JournalPrompt>({
        profile: 'journal',
        prompt: 'Generate reflection prompts for today'
      })
      responseText = JSON.stringify(res.content, null, 2)
    } catch (err) {
      responseText = `Error: ${(err as Error).message}`
    }
  }

  async function testAlert() {
    responseText = 'Loading...'
    try {
      const res = await query<AlertItem[]>({
        profile: 'alert',
        prompt: 'Detect any anomalies in my tracking data'
      })
      responseText = JSON.stringify(res.content, null, 2)
    } catch (err) {
      responseText = `Error: ${(err as Error).message}`
    }
  }

  async function testNarrative() {
    responseText = 'Loading...'
    try {
      const res = await query<NarrativeAnalysis>({
        profile: 'narrative',
        prompt: 'Analyze my journal entries and notes from the last 30 days'
      })
      responseText = JSON.stringify(res.content, null, 2)
    } catch (err) {
      responseText = `Error: ${(err as Error).message}`
    }
  }
</script>

<NLayout pageTitle="AI Integration Test" showTabs={false}>
  <div slot="header" class="n-toolbar-grid">
    <div class="left">
      <NBackButton />
    </div>
    <div class="main title">🤖 AI Test</div>
    <div class="right" />
  </div>

  <div slot="content" class="p-4">
    <div class="mb-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded p-4">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        <strong>Tip:</strong> Configure your API key in Settings &gt; AI Integration first!
      </p>
    </div>

    {#if testDataInfo}
      <div class="mb-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4">
        <button
          onclick={() => (showTestData = !showTestData)}
          class="w-full text-left flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <h3 class="font-semibold text-sm">📊 Test Data (Last 30 Days)</h3>
          <span class="text-xs">{showTestData ? '▼' : '▶'}</span>
        </button>

        {#if showTestData}
          <div class="mt-3 space-y-3 text-xs">
            {#if testDataInfo.error}
              <p class="text-red-600 dark:text-red-400">{testDataInfo.error}</p>
            {/if}
            {#if testDataInfo.info}
              <p class="text-gray-600 dark:text-gray-400">{testDataInfo.info}</p>
            {/if}
            {#if testDataInfo.totalEntries}
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-white dark:bg-gray-700 p-2 rounded">
                  <p class="text-gray-600 dark:text-gray-400">Total Entries</p>
                  <p class="font-bold text-lg">{testDataInfo.totalEntries}</p>
                </div>
                <div class="bg-white dark:bg-gray-700 p-2 rounded">
                  <p class="text-gray-600 dark:text-gray-400">Unique Metrics</p>
                  <p class="font-bold text-lg">{testDataInfo.uniqueMetrics}</p>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 p-3 rounded">
                <p class="font-semibold mb-2">Tracked Metrics:</p>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  {#each testDataInfo.metrics as metric (metric.tag)}
                    <div class="text-xs">
                      <p class="font-medium text-gray-700 dark:text-gray-300">{metric.tag} ({metric.count} entries)</p>
                      <p class="text-gray-500 dark:text-gray-400">Recent: {metric.recent.join(', ')}</p>
                    </div>
                  {/each}
                </div>
              </div>

              {#if contextSummary}
                <div class="bg-white dark:bg-gray-700 p-3 rounded">
                  <p class="font-semibold mb-2">AI Context Summary:</p>
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{contextSummary}</p>
                </div>
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    {#if aiState.error}
      <div class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
        <strong>Error:</strong> {aiState.error}
      </div>
    {/if}

    <div class="mb-6">
      <label class="flex items-center gap-2 mb-4">
        <input type="checkbox" bind:checked={useStreaming} />
        <span class="text-sm">Use Streaming (Insight only)</span>
      </label>

      <div class="grid grid-cols-2 gap-2">
        <button
          onclick={testInsight}
          disabled={aiState.loading}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
        >
          {aiState.loading ? 'Loading...' : '💬 Insight'}
        </button>

        <button
          onclick={testAdvice}
          disabled={aiState.loading}
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
        >
          {aiState.loading ? 'Loading...' : '💡 Advice'}
        </button>

        <button
          onclick={testData}
          disabled={aiState.loading}
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400 text-sm"
        >
          {aiState.loading ? 'Loading...' : '📊 Data'}
        </button>

        <button
          onclick={testJournal}
          disabled={aiState.loading}
          class="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-400 text-sm"
        >
          {aiState.loading ? 'Loading...' : '📝 Journal'}
        </button>

        <button
          onclick={testAlert}
          disabled={aiState.loading}
          class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 text-sm"
        >
          {aiState.loading ? 'Loading...' : '⚠️ Alert'}
        </button>

        <button
          onclick={testNarrative}
          disabled={aiState.loading}
          class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400 text-sm"
        >
          {aiState.loading ? 'Loading...' : '📖 Narrative'}
        </button>
      </div>
    </div>

    <div class="mb-4">
      <h2 class="text-lg font-semibold mb-2">Response:</h2>
      <div class="bg-gray-100 dark:bg-gray-800 rounded p-4 font-mono text-xs min-h-32 max-h-96 overflow-auto text-gray-900 dark:text-gray-100">
        {#if aiState.loading}
          <span class="text-gray-500">Processing...</span>
        {:else if responseText}
          <pre>{responseText}</pre>
        {:else}
          <span class="text-gray-500">Click a button to test a profile</span>
        {/if}
      </div>
    </div>

    <div class="text-xs text-gray-600 dark:text-gray-400">
      <h3 class="font-semibold mb-2">Profiles:</h3>
      <ul class="space-y-1">
        <li>💬 <strong>Insight:</strong> Natural language (supports streaming)</li>
        <li>💡 <strong>Advice:</strong> Actionable recommendations</li>
        <li>📊 <strong>Data:</strong> Chart datasets</li>
        <li>📝 <strong>Journal:</strong> Reflection prompts</li>
        <li>⚠️ <strong>Alert:</strong> Anomaly detection</li>
        <li>📖 <strong>Narrative:</strong> Journal content analysis (themes, sentiment, patterns)</li>
      </ul>
    </div>
  </div>
</NLayout>
