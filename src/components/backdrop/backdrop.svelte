<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade, fly } from 'svelte/transition'

  // import flyin from "../../modules/actions/flyin";

  import { BackdropStore } from './backdrop-store'
  import ScrollStopper from './scroll-stopper.svelte'
  // import { pan } from "svelte-hammer";

  export let visible: boolean = true
  export let stopPropagation: boolean = true
  export let tappable: boolean = true
  export let opacity: number = 0.75
  export let className: string = ''
  export let position: 'center' | 'bottom' | 'top' | 'bottom-center' = 'center'
  export let id: string

  const dispatch = createEventDispatcher()

  let activeId: string

  let indexLevel: number = 0
  let scale: number = 100
  let translateY: number = 0

  function remove() {
    BackdropStore.remove(activeId)
    activeId = undefined

    dispatch('closed')
  }

  function emitTap(ev: Event) {
    if (stopPropagation) {
      ev.preventDefault()
      ev.stopPropagation()
    }
    if (tappable) {
      dispatch('tap')
      remove()
    }
  }

  let windowChangeListener: boolean = false

  $: if (visible && !activeId) {
    activeId = id
    BackdropStore.add(id)
    if (!windowChangeListener) {
      window.addEventListener('popstate', windowPathChanged)
      windowChangeListener = true
    }
  } else if (!visible && activeId) {
    remove()
  } else if (!visible && !activeId) {
    window.removeEventListener('popstate', windowPathChanged)
    windowChangeListener = false
  }

  const windowPathChanged = () => {
    remove()
  }

  $: {
    indexLevel = $BackdropStore.findIndex((b) => b == id)
    scale = (98 - (indexLevel + 2)) / 100
    translateY = -20 / scale
  }
</script>

{#if activeId}
  <ScrollStopper />
  <!-- Back Drop -->
  {#if $BackdropStore && $BackdropStore.length && $BackdropStore[$BackdropStore.length - 1] == id}
    <div
      id={`bd-${$BackdropStore.length}`}
      transition:fade={{ duration: 100 }}
      style="--tw-bg-opacity:{opacity}; z-index:4000;"
      class="nui-backdrop open nui-pos-{position}
      {className}"
      on:click|self={emitTap}
    />
  {/if}
  <!-- Back Drop Children -->
  <div
    id={`child-bd-${indexLevel}`}
    style="z-index:401{indexLevel + 1}; margin-top: {(indexLevel || 1) * 10}px;
    --layer-scale: {scale}; --layer-index: {indexLevel}; --layer-y: {translateY}"
    on:click|self={emitTap}
    class="nui-backdrop--children nui-pos-{position}
    {className}"
    class:in-background={indexLevel < $BackdropStore.length - 1}
    transition:fly|local={{ y: 300, duration: 200 }}
  >
    <slot />
    <div class="safe-bottom" />
  </div>
{/if}

<style global lang="postcss">
  .nui-backdrop {
    @apply fixed;
    @apply top-0;
    @apply left-0;
    @apply right-0;
    @apply bottom-0;
    @apply flex;
    @apply flex-col;
    @apply justify-center;
    @apply bg-gray-700;
    @apply bg-opacity-50;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    @apply backdrop-filter backdrop-saturate-150 backdrop-blur-sm;
    padding-bottom: calc(env(safe-area-inset-bottom));
 
  }
  .nui-backdrop.nui-pos-center {
    @apply justify-center;
    @apply items-center;
  }

  .nui-backdrop--children {
    @apply pt-1;
    @apply fixed;
    @apply top-0;
    @apply left-0;
    @apply right-0;
    @apply bottom-0;
    @apply flex;
    @apply flex-col;
    @apply items-center;
    @apply justify-center;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    background-color: transparent;
    
    @apply transition-all;
  }
  .nui-backdrop--children.nui-pos-bottom {
    @apply justify-end;
    @apply items-center;
  }
  .nui-backdrop--children.nui-pos-top {
    @apply justify-start;
    @apply items-center;
  }

  .nui-backdrop--children.nui-pos-bottom-center {
    @apply justify-end lg:justify-center;
    @apply lg:rounded-b-2xl;
    @apply items-center;
  }

  .nui-backdrop--children .swipe-bar {
    @apply p-2;
    @apply flex;
    @apply items-center;
    @apply justify-center;
    @apply w-full;
    @apply outline-none;
  }

  .nui-backdrop--children.in-background::after {
    content: '';
    @apply absolute -top-10 -bottom-10 -left-10 -right-10;
    @apply bg-gray-400 bg-opacity-50 dark:bg-gray-600 dark:bg-opacity-50;
    @apply backdrop-blur-sm backdrop-filter;
    @apply z-40;
  }
  .nui-backdrop--children.in-background {
    transform: scale(var(--layer-scale)) translateY(calc(var(--layer-y) * 1px));
    @apply z-0;
  }
  .nui-backdrop--children .swipe-bar .swipe-bar--visual {
    background-color: var(--color-solid-100);
    @apply h-2;
    @apply rounded-full;
    @apply w-20;
  }
</style>
