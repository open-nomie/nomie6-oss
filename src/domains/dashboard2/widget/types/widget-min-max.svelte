<script lang="ts">
  import dayjs from 'dayjs'
  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  import type { Trackable } from '../../../trackable/Trackable.class'
  // import type { WidgetClass } from '../widget-class'
  import { openOnThisDayModal } from '../../../on-this-day/useOnThisDayModal'
  import { getDateFormats } from '../../../preferences/Preferences'
  import { openDateOptionPopMenu } from '../../../../components/pop-menu/usePopmenu'

  export let trackable: Trackable
  export let usage: TrackableUsage

  $: dateFormat = getDateFormats()
</script>

<div class="min-max-widget">
  <div class="min mm-block">
    <div class="value">{trackable.formatValue(usage.min.value)}</div>
    <div class="label-date">
      <span class="label">Min</span>
      <button on:click={() => openDateOptionPopMenu(usage.min.date.toDate())} class="date"
        >{dayjs(usage.min.date).format(dateFormat.shortDate)}</button
      >
    </div>
  </div>
  <div class="min mm-block">
    <div class="value">{trackable.formatValue(usage.max.value)}</div>
    <div class="label-date">
      <span class="label">Max</span>
      <button on:click={() => openDateOptionPopMenu(usage.max.date.toDate())} class="date"
        >{dayjs(usage.max.date).format(dateFormat.shortDate)}</button
      >
    </div>
  </div>
</div>

<style global lang="postcss">
  .min-max-widget {
    @apply px-4 flex items-center h-full justify-center;
  }
  .widget-size-sm .min-max-widget {
    @apply flex-col;
    @apply space-y-2;
  }
  .mm-block {
    @apply flex flex-col justify-center items-center;
    @apply w-full;
  }
  .widget-size-sm .mm-block .label-date {
    @apply flex-row;
    @apply py-1 px-3 rounded-full;
    @apply bg-gray-200 dark:bg-gray-800;
    @apply items-center justify-center;
  }
  .widget-size-sm .mm-block .date {
    @apply p-0;
  }
  .widget-size-sm .mm-block .label {
    @apply mb-0;
  }
  .mm-block .value {
    @apply text-xl lg:text-3xl;
    @apply font-bold;
    @apply text-black dark:text-white;
  }
  .mm-block .label-date {
    @apply flex items-center justify-center;
    @apply space-x-2;
    @apply flex flex-col items-center justify-center;
  }
  .mm-block .date {
    @apply text-gray-500;
    @apply text-xs;
    @apply py-1 px-3 rounded-full;
    @apply bg-gray-200 dark:bg-gray-800;
  }
  .mm-block .label {
    @apply text-gray-600 dark:text-gray-400;
    @apply text-sm font-bold;
    @apply mb-1;
  }
</style>
