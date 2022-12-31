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

  import type { WidgetClass } from './widget-class'
  import type { Trackable } from '../../trackable/Trackable.class'
  import type { TrackableUsage } from '../../usage/trackable-usage.class'
  import { onMount } from 'svelte'
  import { TrackableStore } from '../../trackable/TrackableStore'
  import type NLog from '../../nomie-log/nomie-log'
import WidgetTodos from './types/widget-todos.svelte';
import WidgetPlugin from './types/widget-plugin.svelte';

  export let trackable: Trackable | undefined = undefined
  export let widget: WidgetClass
  export let usage: TrackableUsage
  export let logs: Array<NLog>

  onMount(() => {
    if (trackable && usage) {
      usage.trackable = trackable || $TrackableStore?.trackables[usage.trackable.tag] || usage.trackable
    }
  })
</script>
{#if widget}
  {#if ['barchart', 'linechart'].indexOf(widget.type) > -1 && usage}
  <WidgetBarChart bind:trackable bind:widget bind:usage />
  {:else if widget.type == 'value'}
  <WidgetValue bind:widget bind:trackable bind:usage />
  {:else if widget.type == 'note' && usage}
  <WidgetNote bind:widget bind:trackable bind:usage />
  {:else if widget.type == 'what-time'}
  <WidgetWhatTime bind:widget bind:trackable bind:usage />
  {:else if widget.type == 'last-used'}
  <WidgetLastUsed bind:widget bind:trackable bind:usage />
  {:else if widget.type == 'focus'}
  <WidgetFocus bind:widget bind:logs />
  {:else if widget.type == 'positivity'}
  <WidgetPositivityPie bind:widget bind:trackable bind:logs bind:usage />
  {:else if widget.type == 'min-max' && usage}
  <WidgetMinMax bind:widget bind:trackable bind:usage />
  {:else if widget.type == 'map' && usage}
  <WidgetMap bind:widget bind:trackable bind:usage />
  {:else if widget.type == 'streak' && usage}
  <WidgetStreak bind:widget bind:trackable bind:usage />
  {:else if widget.type == 'todos' && logs.length}
  <WidgetTodos bind:widget {logs} />
  {:else if widget.type == 'plugin'}
  <WidgetPlugin bind:widget />
  {:else}
  <div class="value -mt-2 text-xs text-gray-300 flex w-full justify-center items-center h-full dark:text-gray-500">
    Not enough data
  </div>
  {/if}

{/if}