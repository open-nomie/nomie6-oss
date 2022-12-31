<script lang="ts">
  import { createEventDispatcher, SvelteComponentDev } from 'svelte/internal'
  import Button from '../../components/button/button.svelte'
  import Stepper from '../../components/stepper/stepper.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  export let activeIndex: number = 0
  export let totalSlides: number = 0
  export let nextTitle: string = 'Next'
  export let nextDisabled: boolean = false
  export let hideBack: boolean = false
  export let component: SvelteComponentDev

  const emit = createEventDispatcher()
</script>

<div class="min-h-fill flex flex-col w-full z-50">
  <slot name="header" />
  <svelte:component
    this={component}
    on:next={() => {
      console.log(' On Next')
    }}
  />
  <div class="fixed bottom-0 w-full">
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
