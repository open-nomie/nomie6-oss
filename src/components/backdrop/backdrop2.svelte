<script lang="ts">
  import { quadInOut } from 'svelte/easing'
import type { SvelteComponentDev } from 'svelte/internal';

  import { fade, fly } from 'svelte/transition'

  import { BackdropStore2 } from './BackdropStore2'
  import ScrollStopper from './scroll-stopper.svelte'

  const zIndex: number = 5000
  let focusedId: string;
  let last = $BackdropStore2[$BackdropStore2.length - 1]
  $: last = $BackdropStore2[$BackdropStore2.length - 1];

  
  
  // Monitor the Opening and closing of this modal
  // We do this because we use fly:out -
  // this keeps the component alive, so we need 
  // to manually $destroy it. 
  let modalComponent:SvelteComponentDev;
  $: if(last && focusedId !== last.id) {
    focusedId = last.id;
  } else if(!last && focusedId) {
    try {
      modalComponent.$destroy();
    } catch(e) {}
  }
  
</script>

{#if $BackdropStore2.length}
  <ScrollStopper />
{/if}

<div
  on:click|self={() => {
    
    if (last.tappable) {
      $BackdropStore2 = $BackdropStore2.slice(0, -1)
    }
  }}
  class="backdrop2 {last.transparent ? 'bg-transparent' : 'bg-nnormal'}"

  style="--zIndex: {zIndex}"
>
<!-- -->

  {#each $BackdropStore2 as modal, index (modal.id)}
    <div
      in:fly|global={{ y: 200, duration: 60, easing: quadInOut }}
      out:fly|global={{ y: 200, duration: 60, easing: quadInOut }}
      class:in-background={index < $BackdropStore2.length - 1}
      class:in-forground={index == $BackdropStore2.length - 1}
      class="backdrop-modal modal-{modal.position || 'fullscreen'}"
      id={modal.id}
      style="--zIndex:{zIndex + (index + 2)}; --index:{index + 2}"
    >
      <svelte:component bind:this={modalComponent} this={modal.component} id={modal.id} {...modal.componentProps} />
    </div>
    {#if index < $BackdropStore2.length - 1}
      <div
        transition:fade|global
        class="background-cover pointer-events-none absolute top-0 right-0 left-0 bottom-0 bg-black bg-opacity-10 backdrop-filter backdrop-blur-sm"
        style="z-index:{zIndex + (index + 3)}"
      />
    {/if}
  {/each}
</div>

<style lang="postcss" global>
  .backdrop2 {
    @apply fixed;
    @apply top-0;
    @apply left-0;
    @apply right-0;
    @apply bottom-0;
    @apply flex;
    @apply flex-col;
    @apply justify-center;
    @apply items-center;
    @apply bg-gray-500;
    @apply bg-opacity-50;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    @apply backdrop-filter backdrop-saturate-150 backdrop-blur-sm;
    padding-bottom: calc(env(safe-area-inset-bottom));
    z-index: var(--zIndex);
  }
  .backdrop2 .backdrop-modal {
    z-index: var(--zIndex);
    @apply w-screen;
    @apply max-w-xl;
    @apply absolute;
    @apply transition-all duration-200;
    @apply flex justify-center;
    @apply p-2;
    @apply max-h-full;
    @apply flex-grow;
  }
  .backdrop2 .backdrop-modal.modal-fullscreen {
    max-height: 900px;
    height: 95%;
    @apply p-0 rounded-none pb-0;
    @apply my-0 lg:my-2;
    @apply relative;
  }
  .backdrop2 .backdrop-modal.in-background.modal-fullscreen {
    @apply absolute;
  }
  .backdrop2 .backdrop-modal.modal-real-fullscreen {
    @apply h-screen;
    @apply min-h-screen;
    min-width: 100vw;
    @apply w-screen;
    @apply p-0 rounded-none pb-0;
    @apply my-0;
  }
  .backdrop2 .modal-bottom {
    @apply bottom-2;
  }
  .backdrop2 .modal-top {
    @apply top-2;
  }

  .backdrop2.bg-transparent {
    background:transparent !important;
    @apply backdrop-filter-none;
  }

  .backdrop2 .backdrop-modal {
    @apply transition-all duration-200 ease-in-out;
  }

  .backdrop2 .backdrop-modal.in-background {
    /* transform: scale(0.97); */
    /* transition: all 0.2s ease-in-out;
    @apply rounded-3xl;
    @apply overflow-hidden;
    @apply p-0; */
    @apply translate-y-20;
  }
  .backdrop2 .backdrop-modal.in-background > * {
    /* z-index: 10;
    @apply p-0; */
  }
  .backdrop2 .backdrop-modal::before {
    content: '';
    @apply transition-all duration-200 transform-gpu ease-in-out;
  }
  .backdrop2 .backdrop-modal.in-background::before {
    /* content: '';
    @apply bg-red-500 bg-opacity-40 backdrop-blur-sm backdrop-filter;
    @apply absolute -top-2 -left-4 right-0 bottom-0;
    box-shadow: none;
    z-index: 20; */
  }
</style>
