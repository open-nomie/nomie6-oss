<svelte:options runes={true} />

<script lang="ts">
  // import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'
  import { untrack } from 'svelte'
  import type { WidgetClass } from '../widget-class'
  import NLog from '../../../nomie-log/nomie-log'
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  import logsToTrackableUsage from '../../../usage/usage-utils'
  import UsageChart from '../../../usage/usage-chart.svelte'

  const { trackable = $bindable(undefined), widget = $bindable(), logs = $bindable(), usage = $bindable() } = $props()

  let scoreUsage = $state<TrackableUsage | undefined>(undefined)
  // export let trackable: Trackable
  // export let usage: TrackableUsage

  let localLogs = $state<Array<NLog>>([])
  $effect(() => {
    if (logs && logs.length) {
      untrack(() => {
        localLogs = logs.map((log) => {
          let note = `#int_score(${log.score || 0})`
          return new NLog({
            note,
            end: log.end,
          })
        })

        scoreUsage = logsToTrackableUsage(localLogs)['#int_score']?.byDay
      })
    }
  })
</script>

<div class="value">
  {#if logs && logs.length && scoreUsage}
    <UsageChart id="positivity-chart" usages={[scoreUsage]} />
  {/if}
</div>
