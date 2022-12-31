<script lang="ts">
  import dayjs from 'dayjs'

  import type { TrackableUsage } from '../../../usage/trackable-usage.class'

  import type { Trackable } from '../../../trackable/Trackable.class'

  import type { WidgetClass } from '../widget-class'

  import { getDateFormats } from '../../../preferences/Preferences'
  import { UsageStore } from '../../../usage/UsageStore'

  export let widget: WidgetClass
  export let trackable: Trackable
  export let usage: TrackableUsage

  let dateFormat = getDateFormats()
  let lastUsedDate: Date
  let lastUsedValue: number
  let last: undefined | { d: string; v: number }

  $: if ($UsageStore[trackable.tag]) {
    last = $UsageStore[trackable.tag].last
    if (last) {
      lastUsedDate = new Date(last.d)
      lastUsedValue = last.v
    }
  }
</script>

{#if widget}
  <div class="value last-used h-full flex flex-col items-center justify-center space-y-2">
    <div class="current">
      {#if lastUsedDate}
        <div class="mb-1 dark:text-white break-words leading-tight px-2 text-center">
          <div class="text-2xl font-bold text-solid ml-1">
            {trackable.formatValue(lastUsedValue)}
          </div>
          <div class="text-base line-clamp-1 font-medium">{dayjs(lastUsedDate).fromNow()}</div>
        </div>
        <div class="text-xs font-normal leading-tight text-gray-500">
          {dayjs(lastUsedDate).format(`${dateFormat.mmm_d_yyyy} ${dateFormat.time} `)}
        </div>
      {:else}
        <div>Unknown</div>
      {/if}
    </div>
  </div>
{/if}
