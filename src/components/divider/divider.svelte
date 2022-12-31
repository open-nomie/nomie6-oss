<script lang="ts">
  import { onMount } from 'svelte'

  export let className = ''
  export let center = false
  export let inset = false
  export let pad = false
  export let style = ''
  export let hideLine: boolean = false
  export let left: number | undefined = undefined

  let hasContent: boolean = false

  onMount(() => {
    if (arguments[1].$$slots) {
      hasContent = true
    }
  })
</script>

<div
  style="{left ? `--left: ${left}px;` : ''} {style}"
  class:inset
  class:show-line={!hideLine}
  class:pad
  class:left
  class:center
  class:hasContent
  class="divider {className}"
>
  <slot />
</div>

<style lang="postcss" global>
  .divider {
    position: relative;
    padding: 0;
    margin: 0;
    z-index: 100;
    width: 100%;
    @apply w-full;
    height: 1px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .divider.show-line::after {
    content: '';
    @apply h-px;
    @apply bg-gray-300 dark:bg-gray-800;
    @apply absolute;
    @apply bottom-px;
  }
  .divider.show-line.center::after {
    @apply left-4;
    @apply right-4;
  }

  .divider.show-line.left::after {
    left: var(--left);
    right: 0;
  }

  .divider.show-line.pad {
    @apply my-1;
  }

  .divider.inset {
    margin-left: 16px;
    max-width: calc(100% - 16px);
  }
  .divider.hasContent {
    font-size: 0.9rem;
    color: var(--color-inverse-2);
  }
</style>
