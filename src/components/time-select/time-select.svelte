<script lang="ts">
  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'
  import { createEventDispatcher } from 'svelte'
import { getDateFormats } from '../../domains/preferences/Preferences';
  

  const dispatch = createEventDispatcher()

  export let time: number = new Date().getTime()
  export let className: string = ''
  export let style: string = ''
  export let is24Hour: boolean
  export let showDateButton: boolean = false;
  export let dateButtonClass: string = "";
  export let value: Dayjs | undefined = undefined;

  let lastValue: any // Value to hold last reaction
  let hour: number // local hour
  let minute: number // local minute
  let ampm: any // local ampm

  let hour12: number


  $: if (time) {
    value = dayjs(new Date(time))
  }

  // 24 Hour Array
  let hours24 = Array(24)
    .fill(0)
    .map(({}, i) => {
      return i
    })
  // 12 Hour Array
  let hours12 = Array(12)
    .fill(0)
    .map(({}, i) => {
      return i + 1
    })
  // 60 minute Array
  let minutes = Array(60)
    .fill(0)
    .map(({}, i) => {
      return i
    })

  // Reactively Set Hours
  $: hours = is24Hour ? hours24 : hours12

  $: if (value && value.format('hh:mm a') !== dayjs(lastValue || '2010-01-01T01:01:01').format('hh:mm a')) {
    lastValue = value
    hour = parseInt(value.format('HH'))
    hour12 = ((hour + 11) % 12) + 1
    minute = parseInt(value.format('mm'))
    ampm = value.format('a')
  }

  const dateFormats = getDateFormats();

  function onChange(evt?: Event) {
    let ogDate = value

    let ogDay = ogDate.get('day')
    let newHour = hour
    if (!is24Hour) {
      newHour = hour12
      if (newHour == 12 && ampm == 'am') {
        newHour = 0
      } else if (ampm == 'am' && newHour > 12) {
        newHour = newHour - 12
      } else if (ampm == 'pm' && newHour < 12) {
        newHour = newHour + 12
      }
    }
    const updatedDate = ogDate.set('hour', newHour).set('minute', minute).set('day', ogDay)
    dispatch('change', updatedDate.toDate())
  }
</script>

{#if value}
  <div class="time-picker-wrapper {className}" {style}>
    <div class="time-picker">
      <!-- Loop over hours -->
      <div class="flex items-center time-parts">
        {#if showDateButton}
          <div class="section {dateButtonClass} border-r border-gray-500 border-opacity-30 mr-1">
            <button on:click={()=>{
              dispatch('dateClick');
            }} class="text-sm font-bold px-2 uppercase">{value.format(dateFormats.tinyDate)}</button>
          </div>
        {/if}
        {#if is24Hour}
          <select on:blur bind:value={hour} class=" hour" on:change={onChange}>
            {#each hours as h}
              <option value={h} selected={h === hour} style="text-align:center;">
                {`${h}`.length == 1 ? `0${h}` : h}
              </option>
            {/each}
          </select>
        {:else}
          <select on:blur bind:value={hour12} class="hour" on:change={onChange}>
            {#each hours as h}
              <option
                data-hour12={hour12}
                data-mmatch={`${h}` == `${hour12}`}
                value={h}
                selected={`${h}` == `${hour12}`}
                style="text-align:center;"
              >
                {`${h}`.length == 1 ? `0${h}` : h}
              </option>
            {/each}
          </select>
        {/if}
        <span class="blinker">:</span>
        <!-- Loop over minutes -->
        <select on:blur bind:value={minute} class="minutes" on:change={onChange}>
          {#each minutes as m}
            <option value={m} selected={m == minute}>
              {`${m}`.length == 1 ? `0${m}` : m}
            </option>
          {/each}
        </select>
      </div>
      <!-- If is not 24 hour - show ampm -->
      {#if !is24Hour}
        <select bind:value={ampm} on:change={() => onChange()}>
          <option value="am">AM</option>
          <option value="pm">PM</option>
        </select>
        <!-- <ButtonGroup
          style="min-width:80px; "
          className="ampm shadow-none"
          size="xs"
          buttons={[
            {
              label: 'A',
              active: ampm == 'am',
              click() {
                ampm = 'am'
                onChange()
              },
            },
            {
              label: 'P',
              active: ampm == 'pm',
              click() {
                ampm = 'pm'
                onChange()
              },
            },
          ]}
        /> -->
      {/if}
    </div>
  </div>
{/if}

<style global lang="postcss">
  .time-picker-wrapper {
    @apply rounded-xl;
    @apply bg-white dark:bg-black;
  }
  .time-picker {
    @apply overflow-hidden;
    @apply px-1;
    @apply rounded-sm;
    @apply flex;
    @apply items-center;
    @apply justify-end;
    @apply flex-shrink;
    @apply flex-grow;
    @apply pr-2;
    @apply text-black dark:text-white;
    @apply shadow-md;
  }
  .time-picker select {
    @apply h-7;
    @apply text-sm;
    @apply font-semibold;
    padding-left:4px; 
    padding-right: 4px;
    @apply bg-transparent;
    @apply appearance-none;
    @apply rounded-md;
    @apply focus:outline-none ring-inset focus:ring-2 ring-primary-500;
  }
  .time-picker .ampm {
    border: none;
    box-shadow: none !important;
  }

  .time-picker .time-parts {
    @apply rounded-md;
    @apply text-black dark:text-white;

    @apply shadow-none;
  }
</style>
