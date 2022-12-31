<script lang="ts">
  import type { Dayjs } from 'dayjs'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let percentage: number
  export let value: string
  export let color: string
  export let size: number
  export let className: string = ''
  export let wrapperClass: string = ''
  export let date: Dayjs
  export let topLabel: string
</script>

<div class="value-button-wrapper {wrapperClass}" style="--size:{size}px">
  <div class="top-label">
    {topLabel}
  </div>
  <button
    type="button"
    title={`${topLabel} ${date.toISOString()}`}
    on:click={() => {
      dispatch('click')
    }}
    class="value-button {className}"
    style="background-color:{color}"
  >
    <div class="vb-value">
      {value}
    </div>
    <div class="percent-bar" style="height:{percentage}%;" />
  </button>
</div>

<style global lang="postcss">
  .value-button-wrapper {
    @apply text-center;
    width: calc(var(--size) * 0.8);
    margin: calc(var(--size) * 0.06);
  }
  .value-button .percent-bar {
    @apply rounded-lg;
    background-color: rgba(0, 0, 0, 0.3);
    @apply absolute bottom-0 left-0 right-0;
  }
  .value-button-wrapper button.value-button {
    @apply transition-all duration-200 transform;
    @apply relative;
    @apply shadow-md;
    @apply w-full;
    @apply rounded-lg;
    @apply overflow-hidden;
    height: calc(var(--size) * 0.73);
  }
  .value-button-wrapper button.value-button:focus {
    @apply ring-2 ring-gray-500 dark:ring-white;
    @apply scale-95;
  }
  .value-button-wrapper button.value-button:hover {
    @apply ring-2 ring-gray-500 dark:ring-white dark:ring-offset-black;
    @apply scale-95;
  }
  .value-button-wrapper .top-label {
    font-size: calc(var(--size) * 0.23) !important;
    
    @apply dark:text-white;
    @apply opacity-50;
    @apply lg:pb-1;
  }
  .value-button .vb-value {
    @apply font-semibold text-center absolute bottom-1 left-1 right-1 z-20;

    @apply leading-none;
    @apply p-px;
    @apply text-white;

    text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7);
    font-size: calc(var(--size) * 0.25);
  }
</style>
