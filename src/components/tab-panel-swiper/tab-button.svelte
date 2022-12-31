<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let className = ''
  export let style = ''
  export let isActive: boolean = false
  export let index: number
  const dispatch = createEventDispatcher()
</script>

<button
  class={`tab-button ${className}`}
  data-child-id={index}
  class:isActive
  {style}
  on:click={(evt) => dispatch('click', evt)}
>
  <slot />
</button>

<style lang="postcss" global>
  .tab-button {
    @apply py-1 px-2;
    @apply text-sm font-semibold;
    @apply text-gray-800 dark:text-gray-400;
  }
  .tab-button.isActive {
    @apply dark:bg-black dark:text-white bg-white text-black rounded-full;
    @apply px-4;
    @apply scale-105;
  }
</style>
