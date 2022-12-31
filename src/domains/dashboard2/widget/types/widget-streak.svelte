<script lang="ts">
  import { onMount } from 'svelte'
  // import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'
  import type { WidgetClass } from '../widget-class'

  // let _elCalendar

  export let widget: WidgetClass
  // export let trackable: Trackable
  // export let usage: TrackableUsage

  let streakCount: number = 0

  // function countDays(): number {
  //   let count = 0
  //   return count
  // }

  async function main() {
    // let days = 0
    // let count = 0
    let streakData: any = widget.stats._stats.getStreakData()
    streakCount = streakData.streak
  }

  onMount(main)
</script>

{#if widget && widget.token.type == 'tracker'}
  <div class="calendar-wrapper">{streakCount}</div>
{:else}Streaks currently only support Trackers{/if}

<style>
  .calendar-wrapper {
    max-width: 120px;
    min-height: 200px;
  }
</style>
