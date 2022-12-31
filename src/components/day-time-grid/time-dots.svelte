<script lang="ts">
  import dayjs from 'dayjs'
  import type { Trackable } from '../../domains/trackable/Trackable.class'
  import type { TrackableUsage } from '../../domains/usage/trackable-usage.class'
  export let usage: TrackableUsage
  export let trackable: Trackable

  export let size: number = 4
  export let base: Array<number> = Array.from(Array(24), (d, i) => i)
  export let format: string = 'H'
  export let className: string = ''
  export let style: string = ''

  let timeMap: any = {}
  let units: Array<any> = []
  $: if (usage.dates && usage.dates.length) {
    timeMap = {}
    usage.dates.forEach((date: Date) => {
      let key = dayjs(date).format(format)
      timeMap[key] = timeMap[key] || { key, count: 1 }
    })
    units = Object.keys(timeMap)
  }

  $: if (usage.hours && usage.hours.length) {
    timeMap = {}
    usage.hours.forEach((hour: number) => {
      const unit = dayjs().hour(hour).format(format)
      timeMap[`${unit}`] = timeMap[`${unit}`] || { hour: unit, count: 1 }
    })
    units = Object.keys(timeMap)
  }
</script>

<div
  class="time-dots {className}"
  style="--timedot-size:{size || 10}px; {trackable.color ? `--timedot-color:${trackable.color};` : ''} {style}"
>
  {#each base as hour}
    <div class="unit">
      {#if units.indexOf(`${hour}`) > -1}
        <div class="active" />
      {/if}
    </div>
  {/each}
</div>

<style global>
  .time-dots {
    --timedot-color: 'rgba(0,0,0,0.4)';
    --timedot-radius: calc(var(--timedot-size) * 0.5);
    --timedot-size: 10px;

    @apply flex;
    @apply items-center;
    @apply relative;
    @apply w-full;
    @apply bg-white;
    @apply bg-opacity-20;
    height: calc(var(--timedot-size) * 2.1);
    @apply rounded-full;
    @apply mx-auto;
    /* box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.1); */
    width: calc(100% - 24px);
    @apply px-2;
    @apply mb-2;
  }

  .time-dots .unit {
    @apply relative;
    width: calc(100% / 24);
    @apply flex-shrink-0;
    @apply rounded-full;
    overflow: visible;
    height: var(--timedot-size);
    /* margin-top: -2px; */
  }
  .time-dots .unit .active {
    @apply z-10;
    @apply bg-white;
    @apply rounded-full;
    width: var(--timedot-size);
    height: var(--timedot-size);
    border-radius: 50%;
    @apply flex-shrink-0;
  }
</style>
