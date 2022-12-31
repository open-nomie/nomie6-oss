<script lang="ts">

  import { onMount } from 'svelte'

  import type NLog from '../../domains/nomie-log/nomie-log'
  import { TrackerStore } from '../../domains/tracker/TrackerStore'
  import { positivityFromLogs } from '../../utils/positivity/positivity'

  export let logs: Array<NLog> = []
  export let className:string = "";

  let mounted = false
  let byHour: Array<any> = []
  let score: number = 0

  $: if (logs && mounted) {
    let pos = positivityFromLogs(logs, $TrackerStore)
    score = 0
    byHour = pos.byHour.map((number) => {
      score = score + number
      if (number > 0) {
        return 'positive'
      } else if (number < 0) {
        return 'negative'
      } else {
        return 'neutral'
      }
    })
  }

  onMount(() => {
    mounted = true
  })
</script>

{#if score}
  <div  class="score-grid {className || 'h-4'}">
    <div class="score flex items-center bg-gray-300 dark:bg-gray-900 px-1 text-xs">
      {score}
    </div>
    {#each byHour as hour, index}
      <div class="hour {hour}" />
    {/each}
  </div>
{/if}

<style lang="postcss" global>
  .score-grid {
    
    @apply bg-gray-500 bg-opacity-5;
    @apply flex leading-none rounded-md overflow-hidden space-x-px w-full;
  }
  .score-grid .score {
    @apply font-semibold;
    font-size: 0.7rem;
  }
  .score-grid .hour {
    @apply transition-all duration-100;
    width: calc(100% / 24 + 1px);
    
    @apply bg-gray-500 bg-opacity-20;
  }
  .score-grid .hour.positive {
    @apply from-green-600 via-green-500 to-green-400 bg-gradient-to-t;
  }
  .score-grid .hour.negative {
    @apply from-red-600 via-red-500 to-red-400 bg-gradient-to-t;
  }
</style>
