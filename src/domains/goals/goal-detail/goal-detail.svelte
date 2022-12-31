<script lang="ts">
  import Empty from '../../../components/empty/empty.svelte'
  import Spinner from '../../../components/spinner/spinner.svelte'
  import type { GoalClass } from '../goal-class'

  import DayGoal from './day-goal.svelte'
  import MonthGoal from './month-goal.svelte'
  import WeekGoal from './week-goal.svelte'

  export let goal: GoalClass
</script>

<div class="goal-detail flex flex-col h-full filler ">
  {#if goal}
    {#if goal.duration === 'day'}
      <DayGoal bind:goal />
    {:else if goal.duration === 'week'}
      <WeekGoal bind:goal />
    {:else if goal.duration === 'month'}
      <MonthGoal bind:goal />
    {/if}
  {:else}
    <Empty>
      <Spinner size={32} />
    </Empty>
  {/if}
</div>
