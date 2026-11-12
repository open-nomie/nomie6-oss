<svelte:options runes={true} />

<script lang="ts">
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'
  import type { WidgetClass } from '../widget-class'
  import UsageChart from '../../../usage/usage-chart.svelte'

  import nid from '../../../../modules/nid/nid'
  import { Prefs } from '../../../preferences/Preferences'
  import { setIncludedTrackable } from './included-trackable-store'

  const { trackable = $bindable(undefined), widget = $bindable(), usage = $bindable() } = $props()
  // export let trackable: Trackable | undefined = undefined

  let type = $state<'bar' | 'line'>('bar')

  let reverseUsage = $state<TrackableUsage | undefined>(undefined)
  let secondUsage = $state<TrackableUsage | undefined>(undefined)
  let usages = $state<Array<TrackableUsage>>([])
  let includedTrackable = $state<any>(undefined)

  $effect(() => {
    // Explicitly reference usage to ensure dependency tracking
    if (usage && widget) {
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
  })


  // Build usages array based on available data
  $effect(() => {
    const arr: Array<TrackableUsage> = []
    if (reverseUsage) arr.push(reverseUsage)
    if (secondUsage) arr.push(secondUsage)
    usages = arr
  })

  // Update includedTrackable when chart includes another tracker via the menu
  $effect(() => {
    if (usages && usages.length > 1) {
      // The second usage is the "alsoInclude" trackable added via the chart menu
      includedTrackable = usages[1].trackable
      setIncludedTrackable(widget.id, usages[1].trackable)
    } else {
      includedTrackable = undefined
      setIncludedTrackable(widget.id, undefined)
    }
  })

  $effect(() => {
    // Explicitly reference usage and widget to ensure dependency tracking
    if (usage && widget) {
      if (widget.type == 'barchart') {
        type = 'bar'
      } else {
        type = 'line'
      }
    }
  })
</script>

{#if widget && reverseUsage}
  <div class="chart-value relative h-full">
    <UsageChart
      id={`usage-${nid(widget.id)}`}
      hideValues={widget.size == 'sm'}
      {usages}
      dualAxis={usages.some(u => u.trackable?.id === '-alsoinclude-')}
      {type}
      className="w-full"
      {widget}
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
