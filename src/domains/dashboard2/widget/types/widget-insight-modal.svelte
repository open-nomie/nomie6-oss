<svelte:options runes={true} />

<script lang="ts">
  import BackdropModal from '../../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../../components/backdrop/BackdropStore2'
  import { insightModalData } from './insightModalStore'
  import { Prefs } from '../../../preferences/Preferences'
  import { marked } from 'marked'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'

  dayjs.extend(relativeTime)

  // Font size mapping from preference to rem values
  const fontSizeMap: Record<string, number> = {
    xs: 0.75,    // 12px
    sm: 0.875,   // 14px
    md: 1,       // 16px (base)
    lg: 1.125,   // 18px
    xl: 1.25     // 20px
  }

  function calculateInsightFontSize(prefFontSize: string): string {
    const baseSize = fontSizeMap[prefFontSize] || 1
    const enlargedSize = baseSize * 1.25 // 25% bigger
    return `${enlargedSize}rem`
  }

  let modalId = $derived($insightModalData.id)
  let insight = $derived($insightModalData.insight)
  let insightExtended = $derived($insightModalData.insightExtended || $insightModalData.insight)
  let promptLabel = $derived($insightModalData.promptLabel)
  let lastFetchDate = $derived($insightModalData.lastFetchDate)
  let renderedInsight = $derived(insightExtended ? marked.parse(insightExtended) : '')
  let insightFontSize = $derived(calculateInsightFontSize($Prefs.fontSize || 'md'))
  let aiProvider = $derived($insightModalData.aiProvider || 'claude')
  let aiModel = $derived($insightModalData.aiModel || 'claude-opus-4-8')

  function getRefreshTime(): string {
    if (!lastFetchDate) return 'N/A'
    const today = dayjs().format('YYYY-MM-DD')
    if (lastFetchDate === today) {
      const tomorrow = dayjs().add(1, 'day').startOf('day')
      const hoursUntilRefresh = tomorrow.diff(dayjs(), 'hour')
      return `${hoursUntilRefresh} hour${hoursUntilRefresh !== 1 ? 's' : ''}`
    }
    return 'Soon'
  }

  function close() {
    if (modalId) {
      closeModal(modalId)
    }
  }
</script>

<style lang="postcss" global>
  .markdown-content p {
    margin: 0.5rem 0;
  }

  .markdown-content strong {
    font-weight: 600;
  }

  .markdown-content em {
    font-style: italic;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .markdown-content li {
    margin: 0.25rem 0;
  }

  .markdown-content code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  @media (prefers-color-scheme: dark) {
    .markdown-content code {
      background: rgba(255, 255, 255, 0.1);
    }
  }
</style>

<BackdropModal mainClass="bg-white dark:bg-gray-900 flex flex-col">
  <div slot="header" class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <button
      onclick={close}
      class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 font-medium transition"
    >
      Close
    </button>
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Nomie Insights</h2>
    <div class="w-12" />
  </div>
  <div class="flex-1 flex flex-col p-6 overflow-hidden">
    <div class="flex-1 overflow-y-auto border border-primary-300 rounded p-4" style="font-size: {insightFontSize}">
      <div class="leading-relaxed text-gray-900 dark:text-gray-100 markdown-content">
        {@html renderedInsight}
      </div>
    </div>
    <div class="mt-4 space-y-2">
      {#if lastFetchDate}
        <p class="text-xs text-gray-600 dark:text-gray-400">
          Will refresh in {getRefreshTime()}
        </p>
      {/if}
      <p class="text-xs text-gray-500 dark:text-gray-500" style="font-size: 0.625rem;">
        Generated with {aiProvider}
        {#if aiModel}
          • <span class="font-mono">{aiModel}</span>
        {/if}
      </p>
    </div>
  </div>
</BackdropModal>

