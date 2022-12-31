<script lang="ts">
  import dayjs from 'dayjs'
  import { createEventDispatcher } from 'svelte'

  import { Prefs } from '../../domains/preferences/Preferences'

  const dispatch = createEventDispatcher()

  export let value = dayjs()
  export let className = ''
  export let style = ''

  let lastValue // Value to hold last reaction
  let hour // local hour
  let minute // local minute
  let ampm // local ampm

  $: is24Hour = $Prefs.use24hour

  // 24 Hour Array
  let hours24 = Array(24)
    .fill(0)
    .map((t, i) => {
      return i
    })
  // 12 Hour Array
  let hours12 = Array(12)
    .fill(0)
    .map((t, i) => {
      return i + 1
    })
  // 60 minute Array
  let minutes = Array(60)
    .fill(0)
    .map((t, i) => {
      return i
    })

  // Reactively Set Hours
  $: hours = is24Hour ? hours24 : hours12

  $: if (value && value.format('hh:mm a') !== dayjs(lastValue || '2010-01-01T01:01:01').format('hh:mm a')) {
    lastValue = value
    hour = parseInt(value.format('HH'))
    // hour12 = ((hour + 11) % 12) + 1
    minute = parseInt(value.format('mm'))
    ampm = value.format('a')
    // lastAMPM = ampm
  }

  function onChange(evt) {
    let ogDate = dayjs(value)
    let ogDay = ogDate.get('day')
    let newHour = hour

    if (!is24Hour) {
      if (newHour == 12 && ampm == 'am') {
        newHour = 0
      } else if (ampm == 'am' && newHour > 12) {
        newHour = newHour - 12
      } else if (ampm == 'pm' && newHour < 12) {
        newHour = newHour + 12
      }
    }
    const updatedDate = ogDate.set('hour', newHour).set('minute', minute).set('day', ogDay)
    dispatch('change', updatedDate)
  }
</script>

{#if value}
  <div class="time-select-wrapper {className}" {style}>
    <div class="time-select">
      <!-- Loop over hours -->
      {#if is24Hour}
        24
        <select bind:value={hour} class=" hour" on:change={onChange}>
          {#each hours as h}
            <option value={h} selected={h == hour} style="text-align:center;">{`${h}`.length == 1 ? `0${h}` : h}</option
            >
          {/each}
        </select>
      {:else}
        {hour}
        <select bind:value={hour} class="hour" on:change={onChange}>
          {#each hours as h}
            <option value={h} style="text-align:center;">{`${h}`.length == 1 ? `0${h}` : h}</option>
          {/each}
        </select>
      {/if}
      <span class="blinker">:</span>
      <!-- Loop over minutes -->
      <select bind:value={minute} class="minutes" on:change={onChange}>
        {#each minutes as m}
          <option value={m}>{`${m}`.length == 1 ? `0${m}` : m}</option>
        {/each}
      </select>
      <!-- If is not 24 hour - show ampm -->
      {#if !is24Hour}
        <select bind:value={ampm} class="filler ampm" on:change={onChange} style="margin-left:4px">
          <option value="am" selected={ampm === 'am'}>AM</option>
          <option value="pm" selected={ampm === 'pm'}>PM</option>
        </select>
      {/if}
    </div>
  </div>
{/if}

<style lang="postcss" global>
  /* .time-select {
    @apply px-2 py-1;
    @apply mr-1;
    @apply flex;
    @apply items-center;
    @apply justify-end;
    @apply flex-grow flex-shrink;
    @apply text-gray-500;
    @apply bg-white dark:bg-black;
    @apply rounded-lg;
    @apply h-6;
    @apply text-xs;
  } */
  /* select {
    @apply text-xs;
    flex-shrink: 0;
    flex-grow: 0;
    @apply appearance-none;
    @apply bg-gray-100 dark:bg-gray-800;
    text-align: center;
    -webkit-appearance: none;
    @apply p-1;
    @apply rounded-md;
  } */
</style>
