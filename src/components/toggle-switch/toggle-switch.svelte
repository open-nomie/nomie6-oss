<svelte:options runes={true} />

<script lang="ts">
  //utils
  import { createEventDispatcher } from 'svelte'

  // consts
  const dispatch = createEventDispatcher()

  let { value = $bindable(false), locked, className, title } = $props()

  const methods = {
    onChange() {
      if (locked === undefined) {
        value = !value
        dispatch('change', value)
      }
    },
  }
</script>

<div class="onoffswitch {value ? 'on' : 'off'} {className}">
  <button
    type="button"
    class="onoffswitch-btn"
    aria-label={title || 'Toggle'}
    on:click={methods.onChange}
  >
    <span class="sr-only">{title || 'Toggle'}</span>
    <span class="ball w-5 h-5 block bg-white rounded-full" />
  </button>
</div>

<style lang="postcss" global>
  .onoffswitch-btn {
    @apply w-11 h-6;
    @apply rounded-full;
    @apply p-0.5;
    @apply transform transition-all duration-100;
    @apply inline-flex;
    @apply focus:outline-none focus:ring-2 ring-green-500 ring-inset;
    @apply border-none cursor-pointer;
  }

  .onoffswitch {
    @apply transform transition-colors duration-100 inline-block;
  }
  .onoffswitch.on .onoffswitch-btn {
    @apply bg-green-500 dark:bg-green-500;
  }

  .onoffswitch-btn .ball {
    @apply transition-all duration-100;
  }
  .onoffswitch.on .onoffswitch-btn .ball {
    @apply transform translate-x-5;
  }
  .onoffswitch.off .onoffswitch-btn {
    @apply bg-gray-300 dark:bg-gray-700;
  }
</style>
