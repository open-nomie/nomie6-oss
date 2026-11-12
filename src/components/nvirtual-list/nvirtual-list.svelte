<svelte:options runes={true} />

<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list'
  import { createEventDispatcher, onMount } from 'svelte'
  import { getElementPosition } from '../../modules/html-elements/position'

  let { items, className, start = $bindable(), end = $bindable(), height = $bindable() } = $props()

  let wrapper: HTMLElement
  let lastDispatchedEnd: number | undefined = $state(undefined)

  const dispatch = createEventDispatcher()

  $effect(() => {
    if (items && items.length > 0) {
      // Only dispatch 'end' if we newly reached the end (not already dispatched for this position)
      if (end === items.length && lastDispatchedEnd !== end) {
        lastDispatchedEnd = end
        dispatch('end')
      }
      if (start !== undefined) {
        dispatch('topItem', items[start])
      }
    }
  })

  const calculateHeight = () => {
    const size = getElementPosition(wrapper)
    if (size && size.eleHeight) {
      height = `${size.eleHeight}px`
    }
  }

  onMount(() => {
    requestAnimationFrame(() => {
      calculateHeight()
    })
  })
</script>

<div class="virtual-list-wrapper overflow-hidden {className}" bind:this={wrapper} style={height ? `height: ${height}` : 'height: 100vh'}>
  <VirtualList {items} bind:start {height} let:item bind:end>
    <slot {item} />
  </VirtualList>
</div>
