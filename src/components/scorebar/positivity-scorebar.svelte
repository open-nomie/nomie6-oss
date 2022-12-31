<script lang="ts">
  import type NLog from '../../domains/nomie-log/nomie-log'
  import { positivityFromLogs } from '../../utils/positivity/positivity'
  import type { IPositivityResults } from '../../utils/positivity/positivity'
  import Scorebar from './scorebar.svelte'
  import { TrackerStore } from '../../domains/tracker/TrackerStore'

  export let logs: Array<NLog> = []
  export let className: string = ''

  let positivity: IPositivityResults
  $: if (logs) {
    positivity = positivityFromLogs(logs, $TrackerStore)
  }
</script>

{#if positivity.positive || positivity.negative}
  <Scorebar
    total={positivity.positive - positivity.negative}
    {className}
    scores={[
      { label: 'Positive', score: positivity.positive, className: 'bg-green-600 text-white' },
      { label: 'Negative', score: positivity.negative, className: 'bg-red-600 text-white' },
      {
        label: 'Neutral',
        score: positivity.neutral,
        className: 'bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20',
      },
    ]}
  />
{/if}
