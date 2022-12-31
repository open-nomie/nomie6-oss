<script lang="ts">
  import { onMount } from 'svelte'

  import HScroller from '../../../../components/h-scroller/h-scroller.svelte'
  import IonIcon from '../../../../components/icon/ion-icon.svelte'

  import { getWidgetTypes, IWidgetType, widgetTypes } from '../widget-types'
  import { PluginStore } from '../../../plugins/PluginStore'

  import Avatar from '../../../../components/avatar/avatar.svelte'
import type { WidgetClass } from '../widget-class';
  export let widget: WidgetClass;

  let mounted = false
  $: if (widget && widget.type && mounted) {
    setTimeout(() => {
      const ele = document.querySelector('.widget-type-selector .active-type')
      if (ele) {
        ele.scrollIntoView()
      }
    }, 300)
  }

  const select = (selectedType: IWidgetType) => {
    widget.type = selectedType.id
    widget.data = selectedType.data;
  }

  let allWidgetTypes: Array<IWidgetType> = []

  $: if (mounted && !allWidgetTypes.length) {
    allWidgetTypes = getWidgetTypes($PluginStore)
  }

  onMount(() => {
    mounted = true
  })
</script>

<HScroller
  className="items-start justify-start"
  wrapperClass="snap-scroll-x flex   space-x-4 px-4 widget-type-selector py-2 "
>
  {#each allWidgetTypes as widgetType}
    <button
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl"
      aria-label={`${widgetType.label} widget`}
      on:click={() => {
        select(widgetType)
      }}
    >
      <div
        class="{widget.type === widgetType.id && widget.data == widgetType.data
          ? 'active-type scale-110'
          : ''} w-20 h-14 lg:h-20 mb-1 lg:w-20 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl"
      >
        {#if widgetType.icon}
          <IonIcon icon={widgetType.icon} size={40} />
        {:else if widgetType.emoji}
          <Avatar size={40} emoji={widgetType.emoji} />
        {/if}
      </div>
      <div class="text-gray-700 filler w-full line-clamp-2 dark:text-gray-300 text-center text-xs pt-2 leading-tight">
        {widgetType.label}
      </div>
    </button>
  {/each}
</HScroller>

<style lang="postcss" global>
  .widget-type-selector .active-type {
    @apply bg-primary-500 text-white;
    @apply ring ring-inset ring-white;
  }
</style>
