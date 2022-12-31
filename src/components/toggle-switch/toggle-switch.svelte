<script lang="ts">
  //utils
  import { createEventDispatcher } from 'svelte'
  import { Switch } from '@rgossiaux/svelte-headlessui'

  // consts
  const dispatch = createEventDispatcher()

  export let value: boolean = false
  export let locked: boolean | undefined = undefined
  export let className: string = ''
  export let title: string

  const methods = {
    onChange(evt) {
      evt.preventDefault()
      evt.stopPropagation()
      if (locked === undefined) {
        value = evt.detail
        dispatch('change', value)
      }
    },
  }
</script>

<div class="onoffswitch {className}">
  <Switch class="onoffswitch {value ? 'on' : 'off'}" checked={value} on:change={methods.onChange}>
    <span class="sr-only">{title || 'Toggle'}</span>
    <span class={`ball w-6 h-6 block bg-white rounded-full`} />
  </Switch>
</div>

<style lang="postcss" global>
  .onoffswitch button {
    @apply w-12 h-8;
    @apply rounded-full;
    @apply p-1;
    @apply transform transition-all duration-100;
    @apply inline-flex;
    @apply focus:outline-none focus:ring-2 ring-green-500 ring-inset;
  }

  .onoffswitch {
    @apply transform transition-colors duration-100;
  }
  .onoffswitch.on {
    @apply bg-green-500 dark:bg-green-500;
  }

  .onoffswitch .ball {
    @apply transition-all duration-100;
  }
  .onoffswitch.on .ball {
    @apply transform translate-x-4;
  }
  .onoffswitch.off {
    @apply bg-gray-300 dark:bg-gray-700;
  }

  .onoffswitch .on {
    @apply ml-auto;
  }
</style>
