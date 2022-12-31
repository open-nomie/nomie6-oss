<script lang="ts">
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'

  import Map from '../../../map/map.svelte'
  import type { WidgetClass } from '../widget-class'

  export let widget: WidgetClass
  // export let trackable: Trackable
  export let usage: TrackableUsage
</script>

{#if widget}
  <div class="map-value relative h-full" style="width:100%;">
    <Map height={190} records={usage.logs} />
  </div>
{/if}
