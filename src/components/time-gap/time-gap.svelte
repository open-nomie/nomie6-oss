<script lang="ts">
  import { onMount } from 'svelte'
  import type NLog from '../../domains/nomie-log/nomie-log'

  import math from '../../utils/math/math'

  export let log1: NLog
  export let log2: NLog

  let diff: number = 0
  let display: string = ``

  async function main() {
    diff = log1.endDayjs().startOf('day').diff(log2.endDayjs().startOf('day'), 'day')
    if (diff > 365) {
      display = `${math.round(diff / 365, 2)} years later`
    } else if (diff > 30) {
      display = `${math.round(diff / 30, 2)} months later`
    } else {
      display = `${diff} ${diff === 1 ? 'day' : 'days'} later`
    }
  }

  onMount(main)
</script>

{#if diff > 1}
  <div class="time-gap">
    <span class="buffer filler" />
    <span class="label">{display}</span>
    <span class="buffer filler" />
  </div>
{/if}

<style lang="postcss">
  .time-gap {
    @apply flex items-center space-x-2;
  }
  .time-gap .buffer {
    @apply border-b border-gray-300 dark:border-gray-700;
  }
  .time-gap .label {
    @apply text-gray-500;
  }
</style>
