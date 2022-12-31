<script lang="ts">
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import math from '../../utils/math/math'
  import { showTrackablePopmenu } from '../board/boardActions'
  import type { UsageComparedType } from './TrendingModalStore'

  export let uct: UsageComparedType
</script>

<ListItem
  clickable
  on:click={() => {
    showTrackablePopmenu(uct.trackableUsage.trackable)
  }}
>
  <TrackableAvatar size={42} className="mr-2 flex items-center" trackable={uct.trackableUsage.trackable} slot="left" />
  <main class="flex space-x-2 flex-nowrap items-center">
    <div class="w-full">
      <h2 class="leading-tight mb-1 space-x-2 flex items-center">
        <div class="font-semibold filler">{uct.trackableUsage.trackable.label}</div>
        <div class="text-sm opacity-80 stiff text-black dark:text-white font-semibold mb-1">
          <span class="text-primary-500">
            {#if uct.compared.value.direction === 'up'}
              ↑
            {:else}
              ↓
            {/if}
          </span>
          {math.round(uct.compared.value.change * 100)}%
          {uct.compared.value.direction}
        </div>
      </h2>
      <div class="w-full change {uct.compared.value.direction}  text-right pr-2">
        <div class="text-lg  text-left text-gray-600 dark:text-gray-400 whitespace-nowrap">
          <span class="whitespace-nowrap">{uct.trackableUsage.formatValue(uct.compared.value.from)}</span>
          <span class="opacity-50">→</span>
          <span class="whitespace-nowrap">{uct.trackableUsage.formatValue(uct.compared.value.to)}</span>
        </div>
      </div>
    </div>
  </main>
</ListItem>
<Divider left={72} />
