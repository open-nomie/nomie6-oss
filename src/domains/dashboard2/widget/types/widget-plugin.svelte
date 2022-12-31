<script lang="ts">
  import { Lang } from '../../../../store/lang'

  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'
  import type { WidgetClass } from '../widget-class'
  import { PluginStore } from '../../../plugins/PluginStore'
  import type { PluginClass } from '../../../plugins/plugin-helpers'
  import PluginFrame from '../../../plugins/plugin-frame.svelte'
  export let widget: WidgetClass
  // export let trackable: Trackable
  let plugin: PluginClass
  $: if (widget && widget.data?.pluginId) {
    plugin = $PluginStore.find((p) => p.id == widget.data.pluginId && p.active == true)
  }
</script>

{#if plugin}
  <PluginFrame lid="widget-{widget.id}" openAction="onWidget" {plugin} />
{:else}
  <div class="w-full h-full flex text-xs text-gray-500 items-center justify-center">
    Plugin not found or disabled
  </div>
{/if}

<style global lang="postcss">
  .widget-note.value {
    max-height: 120px;
    overflow-y: auto;
  }
  .widget-note .n-note-textualized {
    @apply text-lg;
  }
  .widget-note.value {
    @apply text-black dark:text-white;
  }
</style>
