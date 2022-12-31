<script lang="ts">
  // import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'
  import type { WidgetClass } from '../widget-class'
  import NLog from '../../../nomie-log/nomie-log'
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  import logsToTrackableUsage from '../../../usage/usage-utils'
  import UsageChart from '../../../usage/usage-chart.svelte'

  export let widget: WidgetClass
  export let logs: Array<NLog>
  export let usage: TrackableUsage

  let scoreUsage: TrackableUsage
  // export let trackable: Trackable
  // export let usage: TrackableUsage

  let localLogs: Array<NLog> = []
  $: if (logs && logs.length) {
    localLogs = logs.map((log) => {
      let note = `#int_score(${log.score || 0})`
      return new NLog({
        note,
        end: log.end,
      })
    })

    scoreUsage = logsToTrackableUsage(localLogs)['#int_score']?.byDay
  }
</script>

<div class="value">
  {#if logs && logs.length}
    <UsageChart id="positivity-chart" usages={[scoreUsage]} />
  {/if}
</div>
