<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte'
  // Utils
  import time from '../../utils/time/time'
  // export let started = undefined;
  export let className = ''
  export let value = 0
  export let size: 'sm' | 'default' = 'default'

  // Consts
  const dispatch = createEventDispatcher()

  // methods
  const methods = {
    // +ADD to unit
    add(unit) {
      switch (unit) {
        case 'hours':
          value = value + 60 * 60
          break
        case 'minutes':
          value = value + 60
          break
        case 'seconds':
          value = value + 1
          break
      }
      dispatch('change', value)
    },
    // -SUBTRACT from Unit
    subtract(unit) {
      switch (unit) {
        case 'hours':
          if (value > 60 * 60) {
            value = value - 60 * 60
          }
          break
        case 'minutes':
          if (value > 60) {
            value = value - 60
          }
          break
        case 'seconds':
          if (value > 1) {
            value = value - 1
          }
          break
      }
      // Fire off change event
      dispatch('change', value)
    },
    // Get Unit Value - for select value
    getUnitValue(unit) {
      return data[unit] || '00'
    },
    // Set unit value by select box action
    setUnitValue(event, unit) {
      // Set to init
      let selected = parseInt(event.target.value)
      // Set temp time chunks
      let dateChunks = {
        hours: data.hours,
        minutes: data.minutes,
        seconds: data.seconds,
      }
      // Set new unit
      dateChunks[unit] = time.padTime(selected)
      // New Set of the value to Seconds
      value = time.unitsToSeconds(dateChunks.hours, dateChunks.minutes, dateChunks.seconds)
      // Fire off change
      dispatch('change', value)
    },
    // Takes 00:00:00 and converts it to seconds
    timeStringToNode(str) {
      let initialTime = time.secondsToTime(str).split(':')
      let payload = {
        hours: initialTime[0],
        minutes: initialTime[1],
        seconds: initialTime[2],
      }
      return payload
    },
  }

  // Data
  let data = {
    ...methods.timeStringToNode(value),
    computed: {
      totalSeconds: 0,
    },
    localValue: value,
  }

  // Watch for Value Change
  $: if (value > -1) {
    // Get the Chunks from Seconds
    let dateChunks = methods.timeStringToNode(value)
    // Set local data chunks to new value
    data.hours = time.padTime(dateChunks.hours)
    data.minutes = time.padTime(dateChunks.minutes)
    data.seconds = time.padTime(dateChunks.seconds)
  }

  // On Mount
</script>

<div class="n-counter-manual size-{size} {className}">
  <div class="unit hours">
    <select
      name="hours"
      id="hours"
      value={methods.getUnitValue('hours')}
      on:change={(event) => {
        methods.setUnitValue(event, 'hours')
      }}
    >
      {#each time.getNumberedArray(300) as unit (unit)}
        <option value={unit}>{unit}</option>
      {/each}
    </select>

    <label for="hours" aria-controls="hours">Hour</label>
  </div>
  <!-- Minutes -->
  <div class="unit hours">
    <select
      id="minutes"
      name="minutes"
      value={methods.getUnitValue('minutes')}
      on:change={(event) => {
        methods.setUnitValue(event, 'minutes')
      }}
    >
      {#each time.getNumberedArray(59) as unit (unit)}
        <option value={unit}>{unit}</option>
      {/each}
    </select>
    <!-- <NIcon icon={ChevronDown} className="fill-solid" /> -->
    <label for="minutes" aria-controls="minutes">Min</label>
  </div>
  <!-- SEconds -->
  <div class="unit seconds">
    <select
      id="seconds"
      name="seconds"
      value={methods.getUnitValue('seconds')}
      on:change={(event) => {
        methods.setUnitValue(event, 'seconds')
      }}
    >
      {#each time.getNumberedArray(59) as unit (unit)}
        <option value={unit}>{unit}</option>
      {/each}
    </select>
    <!-- <NIcon icon={ChevronDown} className="fill-solid" /> -->
    <label for="seconds" aria-controls="seconds">Sec</label>
  </div>
</div>

<style lang="postcss" global>
  .n-counter-manual .unit svg {
    position: absolute;
    top: 20px;
    right: 2px;
    height: 16px;
    pointer-events: none;
  }
  .n-counter-manual {
    @apply grid;
    @apply grid-cols-3;
    @apply gap-2;
  }
  .n-counter-manual span {
    line-height: 40px;
    font-size: 40px;
  }
  .n-counter-manual .unit {
    @apply rounded-lg;
    @apply overflow-hidden;
    @apply text-center;
    @apply relative;
    @apply flex;
    @apply flex-col;
  }

  .n-counter-manual .unit select {
    @apply appearance-none;
    @apply rounded-lg;
    @apply bg-white dark:bg-black;
    @apply text-black dark:text-white;
    @apply border border-gray-300 dark:border-gray-700;
    @apply h-14;
    @apply text-4xl;
    @apply font-bold;
    @apply outline-none;
    @apply focus:ring-2 ring-primary-500 ring-inset;
  }
  .n-counter-manual .unit select option {
    text-align: center;
  }
  .n-counter-manual .unit label {
    @apply font-bold;
    @apply text-gray-500;
    @apply text-sm;
    @apply p-1;
  }

  .n-counter-manual.size-sm {
    @apply w-auto;
    @apply pt-2;
  }

  .n-counter-manual.size-sm .unit {
    @apply w-full;
  }

  .n-counter-manual.size-sm .unit select {
    @apply h-7;
    @apply text-base;
    @apply text-center;
    @apply border-none;
    @apply bg-gray-100 dark:bg-gray-900;
    @apply m-0;
  }

  .n-counter-manual.size-sm .unit label {
    @apply text-xs;
    @apply font-medium;
  }
</style>
