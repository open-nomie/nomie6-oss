<script lang="ts">
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  

  import type { WidgetClass } from '../widget-class'
  import math from '../../../../utils/math/math'
  import ProgressBar from '../../../../components/progress-bar/progress-bar.svelte'

  export let widget: WidgetClass
  // export let trackable: Trackable
  export let usage: TrackableUsage


</script>

<div class="value px-4 flex flex-col items-center h-full justify-center {widget.includeAvg ? 'value-sm' : ''}">
  <div class="current dark:text-white h-full w-full flex items-center justify-center flex-col">
    {#if usage?.trackable?.tracker?.type === 'range'}
      <div class="mb-2 text-3xl leading-tight">{usage.totalDisplay || 0}</div>
      <ProgressBar
        className="w-20 mx-auto h-2 bg-gray-500 bg-opacity-40"
        percentage={math.percentage(usage.trackable.tracker.max || 10, usage.total)}
      />
    {:else}
    
      <div class="mb-2 text-3xl leading-tight">{usage?.totalDisplay || 0}</div>
    {/if}
  </div>
  {#if widget.includeAvg && usage}
    <div class="avg text-primary-500 font-medium text-sm mt-1">
      Avg <span class="font-bold">{(usage.trackable.formatValue(math.average(usage.byDay.values)))}</span>
    </div>
  {/if}
</div>

<style global lang="postcss">
  .dashboard-widget.type-value .widget-main {
    @apply items-center;
    @apply justify-center;
    /* @apply bg-pink-500; */
    @apply flex;
    @apply flex-col;
  }
  .value .current {
    @apply text-2xl lg:text-4xl;
    @apply text-center;
    @apply font-bold;
  }
</style>
