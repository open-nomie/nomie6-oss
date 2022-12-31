<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import type { Trackable } from '../../domains/trackable/Trackable.class'
  import TrackableAvatar from '../avatar/trackable-avatar.svelte'

  export let date: Date | undefined
  export let trackable: Trackable
  export let value: number

  const emit = createEventDispatcher()
</script>

<button class="tiny-trackable" on:click={() => emit('click')}>
  <TrackableAvatar className="items-center self-center" {trackable} size={23} />
  <span class="label line-clamp-1">{trackable.label}</span>
  {#if value}
    <span class="value">{trackable.formatValue(value)}</span>
  {/if}
</button>

<style lang="postcss" global>
  .tiny-trackable {
    @apply flex items-center;
    @apply whitespace-nowrap;
    @apply space-x-1;
    @apply text-base;
    @apply flex-shrink;
    @apply w-auto;
    @apply mr-1 mt-1;
    @apply bg-gray-100 dark:bg-gray-900 rounded-lg;

    @apply py-1 px-2;
    @apply transform-gpu transition-all duration-100 ease-in-out;
    @apply max-w-full;
  }
  .tiny-trackable:hover {
    @apply scale-105;
  }
  .tiny-trackable:active {
    @apply scale-90;
  }

  .tiny-trackable .label {
    @apply pl-1;
    @apply font-semibold;
    @apply text-black dark:text-white;
  }
  .tiny-trackable .value {
    @apply text-gray-600 dark:text-gray-400;
  }
</style>
