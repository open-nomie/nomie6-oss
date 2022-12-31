<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  import type { Trackable } from './Trackable.class'

  export let trackable: Trackable
  export let size: number = 40
  export let className: string = ''
  export let transparent: boolean = false
  export let outlined: boolean = false
  export let value: string | number | undefined = undefined
  export let hideValue: boolean = false
  export let solid: boolean = false

  const dispatch = createEventDispatcher()
</script>

{#if trackable}
  <button
    type="button"
    on:click={(evt) => {
      dispatch('click', evt)
    }}
    class:solid={solid}
    class="trackable-pill {className} {transparent
      ? 'transparent shadow-none'
      : outlined
      ? 'outlined'
      : 'filled shadow-md'}"
    style="--pill-size: {size}px"
  >
    <TrackableAvatar {trackable} size={size * 0.8} />
    <div class="title-value">
      {#if !hideValue && (value || trackable.value)}
        <h3 class="font-semibold line-clamp-1" style="font-size:80%; margin-bottom:{size * 0.08}px">
          {trackable.label}
        </h3>
        <div class="font-bold line-clamp-1" style="font-size:110%;">{value || trackable.value}</div>
      {:else}
        <h3 class="font-semibold line-clamp-1" style="font-size:110%">{trackable.label}</h3>
      {/if}
      <slot />
    </div>
  </button>
{/if}

<style lang="postcss" global>
  .trackable-pill {
    min-height: var(--pill-size);
    font-size: calc(var(--pill-size) * 0.37);
    padding-top: calc(var(--pill-size) * 0.15);
    padding-bottom: calc(var(--pill-size) * 0.15);
    @apply flex items-center justify-start flex-grow-0 flex-shrink-0;
    @apply text-left;
    @apply w-auto;

    @apply text-black dark:text-white;
    @apply space-x-2;
    @apply pl-1 pr-2;
    @apply rounded-lg;
    @apply max-w-xs;
    @apply leading-none;
    @apply focus:ring-primary-500 ring-opacity-60 focus:ring-2;
    @apply focus:outline-none;
  }
  .trackable-pill.filled {
    @apply bg-gray-100 dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-60;
  }
  .trackable-pill.solid {
    @apply bg-white dark:bg-gray-900;
  }
  .trackable-pill.outlined {
    @apply border-gray-200 dark:border-gray-800 border;
  }
  .trackable-pill.transparent {
    @apply bg-opacity-0 dark:bg-opacity-0;
  }
  .trackable-pill:active {
    @apply ring ring-primary-500 ring-opacity-100;
  }
</style>
