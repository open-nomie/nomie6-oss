<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { getElementPosition } from '../../modules/html-elements/position'
  import { Device } from '../../store/device-store'

  let box: HTMLElement

  const dispatch = createEventDispatcher()
  const { className, style, width, height } = $props()

  const refresh = () => {
    if (box) {
      const dems = getElementPosition(box)
      width = dems.eleWidth
      height = dems.eleHeight
      dispatch('width', width)
      dispatch('height', height)
    }
  }

  $effect(() => {
    if ($Device.width) {
      refresh()
    }
  })

  onMount(() => {
    refresh()
  })
</script>

<div bind:this={box} class="width-box {className}" {style}><slot {width} {height} /></div>

<style lang="postcss" global>
  .width-box {
    @apply flex;
    @apply w-full;
    @apply h-full;
    @apply flex-grow;
    @apply flex-shrink;
    @apply min-h-0 max-h-full min-w-0 max-w-full;
    @apply h-full w-full;
    @apply overflow-hidden;
    @apply border-2 border-yellow-500;
  }
</style>
