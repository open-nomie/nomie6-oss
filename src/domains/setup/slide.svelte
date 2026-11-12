<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Button from '../../components/button/button.svelte'
  import Stepper from '../../components/stepper/stepper.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  const { activeIndex = 0, totalSlides = 0, nextTitle = 'Next', nextDisabled = false, hideBack = false, component = $bindable() } = $props()

  const emit = createEventDispatcher()
</script>

<div class="min-h-fill flex flex-col w-full z-50">
  <slot name="header" />
  <svelte:component
    this={component}
    on:next={() => emit('next')}
  />
  <div class="fixed bottom-0 w-full z-40">
    <ToolbarGrid className="mx-auto max-w-xl py-1">
      <Button
        slot="left"
        on:click={() => emit('back')}
        className="{hideBack ? 'opacity-0' : ''} text-gray-500 whitespace-nowrap"
        clear>← Back</Button
      >
      <Stepper steps={totalSlides} stepClass="primary-bright" current={activeIndex} />
      <Button
        slot="right"
        className="font-bold whitespace-nowrap"
        disabled={nextDisabled}
        on:click={() => emit('next')}
        primary>{nextTitle} →</Button
      >
    </ToolbarGrid>
  </div>
</div>
