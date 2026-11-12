<svelte:options runes={true} />

<script lang="ts">
  import HScroller from '../../../../components/h-scroller/h-scroller.svelte'
  import IonIcon from '../../../../components/icon/ion-icon.svelte'
  import NomieAiButton from '../../../../components/aibutton2/NomieAiButton2.svelte'

  import { getWidgetTypes, type IWidgetType, widgetTypes } from '../widget-types'
  import { PluginStore } from '../../../plugins/PluginStore'
  import { Prefs } from '../../../preferences/Preferences'

  import Avatar from '../../../../components/avatar/avatar.svelte'
import type { WidgetClass } from '../widget-class';
  const { widget = $bindable(), onWidgetTypeChange, updateTrigger = 0 } = $props();

  function isAiConfigured(): boolean {
    return !!($Prefs.ai?.enabled && $Prefs.ai?.services?.[
      $Prefs.ai?.selectedService || 'claude'
    ]?.apiKey)
  }

  let mounted = $state(false)
  $effect(() => {
    if (widget && widget.type && mounted) {
      setTimeout(() => {
        const ele = document.querySelector('.widget-type-selector .active-type')
        if (ele) {
          ele.scrollIntoView()
        }
      }, 300)
    }
  })

  const isWidgetTypeActive = (widgetType: IWidgetType): boolean => {
    // For regular widgets, just check the type
    if (widgetType.id !== 'plugin') {
      return widget.type === widgetType.id
    }
    // For plugin widgets, check both type AND plugin ID
    return widget.type === 'plugin' && widget.data?.pluginId === widgetType.data?.pluginId
  }

  const select = (selectedType: IWidgetType) => {
    // Mutate directly - parent will handle reassignment for reactivity
    widget.type = selectedType.id
    widget.data = selectedType.data
    // Notify parent of change
    if (onWidgetTypeChange) {
      onWidgetTypeChange(selectedType)
    }
  }

  let allWidgetTypes = $state<Array<IWidgetType>>([])

  $effect(() => {
    if (mounted && !allWidgetTypes.length) {
      allWidgetTypes = getWidgetTypes($PluginStore)
    }
  })

  $effect(() => {
    if (!mounted) {
      mounted = true
    }
  })
</script>

<HScroller
  className="items-start justify-start"
  wrapperClass="snap-scroll-x flex   space-x-4 px-4 widget-type-selector py-2 "
>
  {#each allWidgetTypes as widgetType}
    {@const isInsightDisabled = widgetType.id === 'insight' && !isAiConfigured()}
    <button
      disabled={isInsightDisabled}
      class="flex flex-col self-start focus:outline-none p-1 rounded-xl {isInsightDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
      aria-label={`${widgetType.label} widget${isInsightDisabled ? ' (requires AI configuration)' : ''}`}
      title={isInsightDisabled ? 'Enable AI in settings and add your API key to use this widget' : ''}
      on:click={() => {
        select(widgetType)
      }}
    >
      <div
        class="{isWidgetTypeActive(widgetType)
          ? 'active-type scale-110'
          : ''} w-20 h-14 lg:h-20 mb-1 lg:w-20 transition-all duration-100 transform stiff flex items-center justify-center dark:bg-gray-900 dark:text-gray-400 shadow-md rounded-xl {isInsightDisabled ? 'opacity-60' : ''}"
      >
        {#if widgetType.id === 'insight'}
          <NomieAiButton size="40px" />
        {:else if widgetType.icon}
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

  /* Blend NomieAiButton colors with background for light/dark themes */
  .widget-type-selector :global(.nomie-ai-btn .sphere) {
    /* Light mode: lighter, more desaturated blues */
    background: radial-gradient(
      circle at 38% 32%,
      #d4e8f5 0%,
      #b5d9ed 18%,
      #8ab8d9 42%,
      #6ba3c8 68%,
      #5a94b8 88%,
      #4a7a9a 100%
    );
  }

  @media (prefers-color-scheme: dark) {
    .widget-type-selector :global(.nomie-ai-btn .sphere) {
      /* Dark mode: darker, more muted blues blending with gray background */
      background: radial-gradient(
        circle at 38% 32%,
        #6b7a8a 0%,
        #5a6d7f 18%,
        #4a5f75 42%,
        #3a5067 68%,
        #2a4659 88%,
        #1a3c4b 100%
      );
    }
  }
</style>
