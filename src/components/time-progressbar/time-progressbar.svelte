<script lang="ts">
  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'
  import { getDateFormats } from '../../domains/preferences/Preferences'

  export let date: Dayjs = dayjs()
  export let timeClass: string = ''

  const dateFormats = getDateFormats()
  let activeDate: Dayjs = dayjs()
  $: if (date) {
    activeDate = dayjs(date)
  }
</script>

<div class="time-progressbar" aria-label="Progress of time - current position {activeDate}">
  <div class="bar" />
  {#if date}
    <div class="date {timeClass}" style="--index:{activeDate.format('H')}">{activeDate.format(dateFormats.hour)}</div>
  {/if}
</div>

<style lang="postcss" global>
  .time-progressbar {
    @apply my-1;
    @apply pt-1;
    @apply relative;
    @apply w-full;
  }
  .time-progressbar .bar {
    @apply bg-gray-300 dark:bg-black bg-opacity-90 dark:bg-opacity-25;
    @apply h-2;
    @apply rounded-full;
  }
  .time-progressbar .date {
    @apply transition-all duration-100 ease-in-out;
    @apply absolute;
    @apply font-bold;
    text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
    font-size: 11px;
    line-height: 16px;
    @apply whitespace-nowrap;
    @apply px-2 rounded-md;
    @apply text-white;
    top: -2px;
    left: calc(var(--index) * (100% / 24));
  }
</style>
