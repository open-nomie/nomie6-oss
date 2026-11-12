<svelte:options runes={true} />

<script lang="ts">
  import WidgetWhatTime from './types/widget-what-time.svelte'
  import WidgetFocus from './types/widget-focus.svelte'
  import WidgetLastUsed from './types/widget-last-used.svelte'
  import WidgetBarChart from './types/widget-bar-chart.svelte'
  import WidgetValue from './types/widget-value-display.svelte'
  import WidgetNote from './types/widget-note.svelte'
  import WidgetMinMax from './types/widget-min-max.svelte'
  import WidgetPositivityPie from './types/widget-positivity-pie.svelte'
  import WidgetMap from './types/widget-map.svelte'
  import WidgetStreak from './types/widget-streak.svelte'
  import WidgetHabit from './types/widget-habit.svelte'
  import WidgetPointer from './types/widget-pointer.svelte'
  import WidgetTodos from './types/widget-todos.svelte';
  import WidgetPlugin from './types/widget-plugin.svelte';
  import WidgetInsight from './types/widget-insights.svelte';

  import type { WidgetClass } from './widget-class'
  import type { Trackable } from '../../trackable/Trackable.class'
  import type { TrackableUsage } from '../../usage/trackable-usage.class'
  import { TrackableStore } from '../../trackable/TrackableStore'
  import type NLog from '../../nomie-log/nomie-log'
  import { IncludedTrackableStore } from './types/included-trackable-store'


  const { trackable: trackableProp = undefined, widget: widgetProp, usage: usageProp, logs: logsProp } = $props()

  let trackable = $state(trackableProp)
  let widget = $state(widgetProp)
  let usage = $state(usageProp)
  let logs = $state(logsProp)

  let includedTrackable = $derived.by(() => {
    return $IncludedTrackableStore.get(widget?.id || '')
  })

  $effect(() => {
    trackable = trackableProp
  })

  $effect(() => {
    widget = widgetProp
  })

  $effect(() => {
    usage = usageProp
  })

  $effect(() => {
    logs = logsProp
  })

  $effect(() => {
    if (trackable && usage) {
      usage.trackable = trackable || $TrackableStore?.trackables[usage.trackable.tag] || usage.trackable
    }
  })
</script>
{#if widget}
  {#if ['barchart', 'linechart'].indexOf(widget.type) > -1 && usage}
  <WidgetBarChart {trackable} {widget} {usage} />
  {:else if widget.type == 'value'}
  <WidgetValue {widget} {trackable} {usage} />
  {:else if widget.type == 'note' && usage}
  <WidgetNote {widget} {trackable} {usage} />
  {:else if widget.type == 'what-time'}
  <WidgetWhatTime {widget} {trackable} {usage} />
  {:else if widget.type == 'last-used'}
  <WidgetLastUsed {widget} {trackable} {usage} />
  {:else if widget.type == 'focus'}
  <WidgetFocus {widget} {logs} />
  {:else if widget.type == 'positivity'}
  <WidgetPositivityPie {widget} {trackable} {logs} {usage} />
  {:else if widget.type == 'min-max' && usage}
  <WidgetMinMax {widget} {trackable} {usage} />
  {:else if widget.type == 'map' && usage}
  <WidgetMap {widget} {trackable} {usage} />
  {:else if widget.type == 'streak' && usage}
  <WidgetStreak {widget} {trackable} {usage} />
  {:else if widget.type == 'todos' && logs.length}
  <WidgetTodos {widget} {logs} />
  {:else if widget.type == 'plugin'}
  <WidgetPlugin {widget} />
  {:else if widget.type == 'insight'}
  <WidgetInsight {widget} />
  {:else if widget.type == 'habit'}
  <WidgetHabit {widget} {trackable} {usage} />
  {:else if widget.type == 'pointer'}
  <WidgetPointer {widget} {trackable} {usage} {logs} />
  {:else}
  <div class="value -mt-2 text-xs text-gray-300 flex w-full justify-center items-center h-full dark:text-gray-500">
    Not enough data
  </div>
  {/if}

{/if}