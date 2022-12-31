<script lang="ts">
  import dayjs from 'dayjs'

  import Divider from '../../components/divider/divider.svelte'
  import { UsageStore, UsageStreak } from './UsageStore'
</script>

<div class="usage-store-vis bg-pink-500 text-white p-4 rounded-lg">
  {#each Object.keys($UsageStore).map((k) => {
    return { key: k, usage: $UsageStore[k] }
  }) as item}
    <div class="py-2 flex items-center space-x-4">
      <span>{item.key}</span>
      <div>
        <div class="font-bold">Last</div>
        <div>
          {#if item.usage.last}
            {dayjs(item.usage.last.d).format('YYYY-MM-DD hh:mm a')}
          {:else}
            No Last
          {/if}
        </div>
        <div class="font-bold">Streak</div>
        <div>
          {#if item.usage.streak}
            {item.usage.streak.v}
            {dayjs(item.usage.streak.d).format('YYYY-MM-DD hh:mm a')}
          {:else}
            No Last
          {/if}
        </div>
      </div>
    </div>
  {/each}
  <Divider left={44} />
  {JSON.stringify($UsageStreak)}
</div>
