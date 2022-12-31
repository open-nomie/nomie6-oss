<script lang="ts">
  import { ToastStore } from './ToastStore'
  import { fly } from 'svelte/transition'

  import Toast from './toast.svelte'
</script>

<div in:fly={{ y: 100 }} out:fly={{ y: 100 }} class="toasts">
  {#each $ToastStore as toast, index (index)}
    <Toast {toast} />
  {/each}
</div>

<style global lang="postcss">
  .toasts {
    @apply pointer-events-none;
    @apply p-10;
    @apply flex flex-col space-y-2;
    @apply items-center justify-end;
    @apply fixed;
    @apply bottom-20 left-2 right-2;
    @apply h-60;
    @apply transition-all duration-200;
    z-index: 6000;
  }
  .toasts .toast-wrapper {
    @apply transition-all duration-200;
    @apply relative;
    @apply bg-black  text-white dark:bg-gray-700;
    @apply ring-2 ring-gray-500 ring-opacity-10;
    @apply px-4 py-2 pr-2 pb-3;
    @apply rounded-lg;
    @apply shadow-2xl;
    @apply pointer-events-auto;
    @apply w-64 md:w-72 lg:w-96;
  }
  .toasts .toast {
    @apply flex items-center space-x-4;
  }
</style>
