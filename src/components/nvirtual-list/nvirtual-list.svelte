<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list'
  import { createEventDispatcher, onMount } from 'svelte'
  import { getElementPosition } from '../../modules/html-elements/position'

  export let items: Array<any> = []
  export let className: string = ''

  export let start: number = undefined
  export let end: number = undefined

  export let height: string = '100vh'

  let wrapper: HTMLElement

  const dispatch = createEventDispatcher()

  $: {
    if (end === items.length) {
      dispatch('end')
    }
    dispatch('topItem', items[start])
  }
  const calculateHeight = () => {
    const size = getElementPosition(wrapper)
    height = `${size.eleHeight}px`
  }

  onMount(() => {
    calculateHeight()
  })
</script>

<div class="virtual-list-wrapper overflow-hidden  {className}" bind:this={wrapper}>
  <VirtualList {items} bind:start {height} let:item bind:end>
    <slot {item} />
  </VirtualList>
</div>
