<svelte:options runes={true} />

<script lang="ts">
  // vendors
  import dayjs from 'dayjs'
  // utils
  import { createEventDispatcher } from 'svelte'
  import { Device } from '../../store/device-store'
  import DateTimeBar from '../date-time-bar/date-time-bar.svelte'

  import { Prefs } from '../../domains/preferences/Preferences'

  // data

  //consts
  const dispatch = createEventDispatcher()
  let { date = $bindable(), time = $bindable(), className, style, size } = $props()

  let inputEle = $state<HTMLInputElement>(undefined)
  let localDate = $state<any>(dayjs(new Date()).format('YYYY-MM-DDTHH:mm'))
  let lastTime = $state(time)
  const dtlFormat = 'YYYY-MM-DDTHH:mm'
  let dateTimeFormat = $derived($Prefs.use24hour ? 'dd/mm/yyyy HH:mm' : 'mm/dd/yyyy hh:mm a')

  $effect(() => {
    if (time) {
      if (time !== lastTime) {
        lastTime = time
        localDate = dayjs(new Date(time)).format(dtlFormat)
      }
    } else {
      localDate = dayjs(new Date()).format(dtlFormat)
    }
  })

  function fireChange(evt: any) {
    date = new Date(evt.target.value)
    time = date.getTime()
    dispatch('change', date);
  }
</script>

<div class="n-date-picker {className}">
  {#if Device.is(/(firefox)/gi)}
    <DateTimeBar
      {style}
      bind:date={time}
      on:change={(event) => {
        
        fireChange({ target: { value: event.detail }})
      }}
    />
  {:else}
    <input
      {style}
      type="datetime-local"
      placeholder={dayjs().format(dateTimeFormat)}
      class="native-datetime m-0 size-{size}"
      on:input={fireChange}
      bind:value={localDate}
      bind:this={inputEle}
    />
  {/if}
</div>

<style global lang="postcss">
  .native-datetime,
  .n-date-picker {
    @apply text-sm;
    /* @apply bg-white dark:bg-black; */
    @apply bg-transparent;
    @apply text-black dark:text-white;
    @apply px-2 py-1;
    @apply rounded-md;
    @apply flex-grow flex-shrink flex;
    @apply w-auto;
    @apply mx-auto;
    @apply text-center;
    @apply placeholder-gray-500;
  }
  .native-datetime.size-lg {
    @apply text-lg;
    @apply px-2 py-2;
  }
  .native-datetime.size-sm {
    @apply text-sm;
    @apply px-2 py-2;
  }
</style>
