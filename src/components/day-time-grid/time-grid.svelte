<script lang="ts">
  import dayjs from 'dayjs'

  import { Prefs } from '../../domains/preferences/Preferences'
  import type { Trackable } from '../../domains/trackable/Trackable.class'
  import type { TrackableUsage } from '../../domains/usage/trackable-usage.class'
  import { Device } from '../../store/device-store'
  import math from '../../utils/math/math'
  import { logsToTimeGrid, TimeGridArray } from './time-grid-utils'
  export let usage: TrackableUsage
  export let trackable: Trackable
  // export let size: number = 4
  export let className: string = ''
  export let style: string = ''

  $: if (usage) {
    render()
  }

  let timeGrid: TimeGridArray = []
  let max: number = 0

  const render = () => {
    const timeGridResponse = logsToTimeGrid(usage.logs, $Prefs.weekStarts, trackable)
    timeGrid = timeGridResponse.grid
    max = timeGridResponse.meta.max
  }

  const formatHour = (hour: number) => {
    if ($Prefs.use24hour) {
      return hour
    } else {
      let formated = dayjs().hour(hour).format('h')
      if ($Device.width < 340) return hour % 2 ? formated : formated
      return formated
    }
  }
</script>

<div class="time-grid {className}" style="--color:{trackable.color}; {style}">
  <div class="time-grid-wrap relative z-40">
    {#each timeGrid as gridDay}
      <div class="day flex row w-full justify-evenly text-xs">
        <div class="day-label">{gridDay.daykey}</div>
        {#each gridDay.day as hour}
          <div
            class="hour bg-white w-full {hour === 0 ? 'empty-hour' : 'active-hour'} "
            style="--percent:{math.percentage(max, hour) / 100};"
          />
        {/each}
      </div>
    {/each}
    <div class="day-legend flex items-center ml-6 mt-1 text-opacity-50 text-black dark:text-white">
      {#each Array(24).fill(0) as count, index}
        <div class="hour-label overflow-hidden">
          {formatHour(index)}
        </div>
      {/each}
    </div>
  </div>
</div>

<style global>
  .time-grid {
    @apply relative;
    @apply flex-grow flex-shrink-0;
    @apply h-full;
  }

  .time-grid .day-label {
    @apply capitalize;
    @apply text-gray-500;
    font-size: 10px;
    @apply text-right;
    @apply pr-1;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    @apply w-7;
  }
  .time-grid .day-legend {
    @apply w-full;
  }
  .time-grid .day-legend .hour-label {
    font-size: 8px;
    width: 3.9%;
  }

  .time-grid .hour-label {
    @apply text-center;
    @apply flex justify-start;
  }
  .time-grid .hour {
    @apply text-center;
    @apply flex justify-start;
    @apply text-xs;

    @apply overflow-hidden;
  }
  .time-grid .hour.active-hour {
    @apply border border-transparent;
    background-color: var(--color);
    opacity: calc(var(--percent) + 0.1);
  }
  .time-grid .hour.empty-hour {
    @apply bg-transparent;
    @apply border border-gray-100 dark:border-gray-900;
  }
</style>
