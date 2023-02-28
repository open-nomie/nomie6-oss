<script lang="ts">
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'
  import type { WidgetClass } from '../widget-class'
  import UsageChart from '../../../usage/usage-chart.svelte'

  import nid from '../../../../modules/nid/nid'
  import { Prefs } from '../../../preferences/Preferences'
  export let widget: WidgetClass
  // export let trackable: Trackable | undefined = undefined
  export let usage: TrackableUsage

  let type: 'bar' | 'line' = 'bar'

  let reverseUsage: TrackableUsage

  $: if (usage) {
    if (['last-365', 'this-year'].indexOf(widget.timeframe.details.id) > -1) {
      reverseUsage = usage
        .reverse()
        .groupBy('week', 'YYYY-MM-D')
        .backfill(widget.getStartDate($Prefs.weekStarts).toDate(), widget.getEndDate($Prefs.weekStarts).toDate())
    } else {
      reverseUsage = usage
        .reverse()
        .byDay.backfill(widget.getStartDate($Prefs.weekStarts).toDate(), widget.getEndDate($Prefs.weekStarts).toDate())
    }
  }

  $: if (usage) {
    if (widget.type == 'barchart') {
      type = 'bar'
    } else {
      type = 'line'
    }
  }
</script>

{#if widget}
  <div class="chart-value relative h-full">
    <UsageChart
      id={`usage-${nid(widget.id)}`}
      hideValues={widget.size == 'sm'}
      usages={[reverseUsage]}
      {type}
      className="w-full"
    />
  </div>
{/if}

<style lang="postcss">
  .chart-value {
    height: 100%;
    flex-grow: 1;
    flex-shrink: 0;
    display: flex;
    width: 100%;
    display: column;
    justify-content: stretch;
  }
</style>
