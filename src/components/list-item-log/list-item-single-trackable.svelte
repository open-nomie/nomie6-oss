<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import type NLog from '../../domains/nomie-log/nomie-log'
  import { getDateFormats } from '../../domains/preferences/Preferences'
  import type { Trackable } from '../../domains/trackable/Trackable.class'
  import math from '../../utils/math/math'
  import TrackableAvatar from '../avatar/trackable-avatar.svelte'

  import ProgressBar from '../progress-bar/progress-bar.svelte'
  import TimeRangeText from '../time-range/time-range-text.svelte'
  export let log: NLog
  export let trackable: Trackable
  export let max: number = undefined
  export let className: string = ''
  export let hideTime: boolean = false;

  let value: number = 0
  const dateFormats = getDateFormats()
  const dispatch = createEventDispatcher()

  $: if (log || trackable) {
    value = trackable.tracker ? log.getTrackerValue(trackable.tracker?.tag) : 1
  }
</script>

<button
  on:click={() => {
    dispatch('click', { log, trackable })
  }}
  type="menu"
  class="rounded-md mock-item flex pl-1 items-start w-full text-left focus:ring-2 focus:ring-primary-500 {className}"
  id="log-{log._id}"
>
  <TrackableAvatar {trackable} size={42} className="mr-2 mt-4" />
  <main class="flex py-3 items-start  flex-col w-full space-y-1">
    <div class="flex item-center space-y-1 filler items-center justify-between w-full">
      <h3 class="text-base leading-tight font-bold w-full dark:text-white">
        {trackable.label}
        <span class="text-base font-normal text-gray-500">{log.endDayjs().format(dateFormats.tinyDate)}</span>
      </h3>
      <p class="text-black dark:text-white font-bold text-xl text-right mr-4 leading-none whitespace-nowrap">
        {trackable.formatValue(value)}
      </p>
    </div>

    {#if trackable.tracker?.type == 'timer' && !hideTime}
      <TimeRangeText date={log.end} seconds={value} className=" dark:text-gray-300 leading-tight" />
    {/if}
    {#if max && trackable.tracker}
      <div class="pr-2 pt-2 w-full">
        <ProgressBar percentage={math.percentage(max, value)} className="h-1 w-full" color={trackable.color} />
      </div>
    {:else}
      <div class="text-sm text-gray-500 pr-2 pt-px w-full line-clamp-5">
        {log.note}
      </div>
    {/if}
  </main>
</button>
