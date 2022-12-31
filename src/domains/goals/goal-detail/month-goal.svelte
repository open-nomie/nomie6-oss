<script lang="ts">
  import type { Dayjs } from 'dayjs'
  import dayjs from 'dayjs'
  import { onMount } from 'svelte'
  import ListItem from '../../../components/list-item/list-item.svelte'

  import ProgressCircle from '../../../components/progress-circle/progress-circle.svelte'
  import { getTrackableUsage } from '../../ledger/LedgerStore'
  import { TrackableStore } from '../../trackable/TrackableStore'
  import type { TrackableUsage } from '../../usage/trackable-usage.class'

  import type { GoalClass, GoalScoreType } from '../goal-class'

  export let goal: GoalClass

  let usage: TrackableUsage
  let base: Dayjs = dayjs().endOf('month')
  let scores: Array<GoalScoreType>

  const getPast = async () => {
    // getGoalUsage([goal], $TrackableStore.trackables, base);
    usage = await getTrackableUsage(goal.trackable, base.subtract(6, 'months'), base, $TrackableStore.trackables)
    scores = goal.calculateScores(usage)
  }

  onMount(() => {
    getPast()
  })
</script>

{#if scores?.length}
  <div class="flex flex-col space-y-2">
    {#each scores.sort((a, b) => (a.date > b.date ? -1 : 1)) as score}
      <ListItem>
        <div slot="left">
          <div class="status-ball relative flex items-center justify-center">
            {#if score.success}
              <div class="ball h-10 w-10 absolute rounded-full bg-green-500" />
            {:else}
              <div class="ball h-10 w-10 absolute rounded-full bg-red-500" />
            {/if}
            <ProgressCircle value={score.percent || 0} color="#FFF" size={36} />
          </div>
        </div>
        <h1 class="font-medium text-gray-800 dark:text-gray-200 leading-tight">
          {score.date.format('MMMM')}
        </h1>
        <p class="text-black dark:text-white font-semibold">{goal.trackable.formatValue(score.actual)}</p>
        <h1 class="font-medium" slot="right">
          {score.date.format('YYYY')}
        </h1>
      </ListItem>
    {/each}
  </div>
{/if}
