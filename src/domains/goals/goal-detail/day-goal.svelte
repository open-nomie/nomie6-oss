<script lang="ts">
  import dayjs from 'dayjs'

  import Empty from '../../../components/empty/empty.svelte'
  import NvirtualList from '../../../components/nvirtual-list/nvirtual-list.svelte'
  import ProgressBar from '../../../components/progress-bar/progress-bar.svelte'
  import Spinner from '../../../components/spinner/spinner.svelte'
  import { getDatePopButtons } from '../../../modules/pop-buttons/pop-buttons'
  
  import { Interact } from '../../../store/interact'
  import math from '../../../utils/math/math'
  import { wait } from '../../../utils/tick/tick'
  import { getTrackableUsage } from '../../ledger/LedgerStore'
  import { getDateFormats } from '../../preferences/Preferences'
  import type { Trackable } from '../../trackable/Trackable.class'
  import { TrackableStore } from '../../trackable/TrackableStore'
  import type { TrackableUsage } from '../../usage/trackable-usage.class'
  import type { GoalClass, GoalScoreType } from '../goal-class'
  import { getGoalComparisonSymbol } from '../goal-utils'

  export let goal: GoalClass

  let usage: TrackableUsage

  let scores: Array<GoalScoreType> = []
  let loading: boolean = true
  let showLoading: boolean = true

  let weeks: Array<Array<GoalScoreType>> = []

  let totalDays: number
  let totalSuccess: number

  let startDate: Date = new Date()

  let trackable: Trackable

  $: if (goal && goal.tag) {
    trackable = $TrackableStore.trackables[goal.tag]
  }

  const generateWeeksFromScores = () => {
    
    let weekMap: any = {}
    scores
      .sort((a, b) => {
        return a.date.toDate() < b.date.toDate() ? -1 : 1
      })
      .filter((score, index) => {
        let found = scores.findIndex((s) => s.date.format('YYYY-MM-DD') === score.date.format('YYYY-MM-DD'))
        if (found && found !== index) {
          return false
        }
        return true
      })
      .forEach((score) => {
        let startOfWeek = `${score.date.startOf('isoWeek').format('YYYY-MM-DD')}`
        weekMap[startOfWeek] = weekMap[startOfWeek] || []
        weekMap[startOfWeek].push(score)
      })
    
    return Object.keys(weekMap)
      .map((id) => {
        return weekMap[id]
      })
      .sort((a, b) => {
        return a[0].date.toDate() > b[0].date.toDate() ? -1 : 1
      })
  }

  const getPast = async () => {
    
    showLoading = true
    const start = dayjs(startDate).subtract(2, 'month')
    const end = dayjs(startDate).endOf('day')

    usage = await getTrackableUsage(trackable, start, end, $TrackableStore.trackables)
    let backFilled = usage.byDay.backfill(start.toDate(), end.toDate())
    scores = [...scores, ...goal.calculateScores(backFilled)]

    totalDays = scores.length
    totalSuccess = scores.filter((s) => s.success).length

    weeks = generateWeeksFromScores()
    loading = false
    wait(200).then(() => {
      showLoading = false
    })
  }

  const openDateOptions = (date: Date) => {
    const dateButtons = getDatePopButtons(date)
    Interact.popmenu({
      id: `date-options-${date.toDateString()}`,
      buttons: dateButtons,
    })
  }

  const dateFormats = getDateFormats()
  let lastDate: any
  $: if (startDate && startDate !== lastDate) {
    
    lastDate = startDate
    getPast()
  }

  const getPad = (num: number): number => {
    // let fixed: number = num
    // if (num > 106) {
    //   fixed = 106
    // } else if (num < 55) {
    //   fixed = 55
    // }
    // return fixed / 100
    return 1
  }
</script>

{#if goal && totalDays}
  <div class="bg-white  dark:bg-black px-4 pb-4  flex flex-col space-y-2">
    <h1 class="text-xl font-bold text-black dark:text-white leading-tight mt-4 pb-">
      {trackable.label}
      {getGoalComparisonSymbol(goal.comparison)}
      {trackable.formatValue(goal.target)}
    </h1>
    {#if scores}
      <p class="text-gray-600 dark:text-gray-400 leading-snug pb-2">
        Goal hit <strong class="text-black dark:text-white"
          >{math.round(math.percentage(totalDays, totalSuccess))}%</strong
        >
        <strong>{totalSuccess}</strong> out of {totalDays} days.
        <br />
      </p>
      <ProgressBar
        color={trackable.color}
        className="h-2"
        barClass="h-1 "
        percentage={math.round(math.percentage(totalDays, totalSuccess))}
      />
    {/if}
  </div>
{:else if !loading && !totalDays}
  <div class="bg-white dark:bg-black flex items-center justify-center h-40 p-10">Not enough data. Keep Tracking!</div>
{/if}
{#if loading}
  <Empty>
    <Spinner size={42} />
  </Empty>
{/if}
{#if !loading}
  <NvirtualList
    className="goal-scroller h-full filler overflow-hidden"
    items={weeks}
    let:item
    on:end={() => {
      startDate = dayjs(startDate).subtract(2, 'month').toDate()
    }}
  >
    {#if item[0]}
      <div class="week">
        <h2>
          {item[0].date.format(dateFormats.tinyDate)} → {item[item.length - 1].date.format(dateFormats.tinyDate)}
          {item[0].date.format('YYYY')}
        </h2>
        <div class="goal-balls">
          {#each item as day}
            <button
              on:click={() => openDateOptions(day.date.toDate())}
              style="transform: scale({getPad(day.percent)})"
              class="goal-ball transition-all  {day.success == true ? 'bg-green-500' : ''} {day.failure == true
                ? 'bg-red-500'
                : ''}"
            >
              {day.date.format('ddd').substring(0, 1)}
              <!-- {day.date.format(dateFormats.tinyNumber)} -->
            </button>
          {/each}
        </div>
      </div>
    {/if}
    <!-- success: boolean
    failure: boolean
    target: number
    actual: number
    og: number
    date?: Dayjs
    percent: number -->
    <!-- <ListItem clickable on:click={() => openDateOptions(item.date.toDate())}>
      <main class="flex flex-col space-y-1">
        <div class="text-sm text-gray-500 leading-none">{item.date.format(`dddd`)}</div>
        <div class="font-semibold text-base">{item.date.format(`${dateFormats.mmm_d_yyyy}`)}</div>
        <div />
        <ProgressBar
          color={item.success ? '#008100' : item.failure ? '#e12000' : trackable.color}
          className="h-1"
          barClass="h-1"
          percentage={item.percent == 0 && item.success ? 100 : item.percent == 0 && item.failure ? 100 : item.percent}
        />
      </main>
      <div class="leading-none font-semibold text-lg" slot="right">{trackable.formatValue(item.actual)}</div>
    </ListItem> -->
  </NvirtualList>
  {#if showLoading}
    <div class="absolute bottom-10 right-10 z-50">
      <Spinner size={22} />
    </div>
  {/if}
{/if}

<style lang="postcss" global>
  .goal-scroller .week {
    @apply px-4;
  }
  .goal-scroller .week h2 {
    @apply text-black dark:text-white;
    @apply text-xs lg:text-lg;
    @apply font-medium;
    @apply mt-4 mb-2 lg:mt-10;
  }
  .goal-balls {
    @apply flex items-center justify-between;
    @apply leading-tight;
    @apply w-full;
    @apply max-w-md;

  }
  .goal-ball {
    @apply rounded-full;
    @apply m-px lg:m-1;
    @apply text-sm font-bold;
    @apply flex items-center justify-center text-center;
    @apply h-9 w-9;
    @apply flex-grow-0 flex-shrink-0;
    @apply text-white;
    @apply transition-all duration-100 ease-in-out;
  }
  .day-score-button {
    @apply relative;
    @apply bg-white dark:bg-gray-900;
    @apply flex flex-col items-center justify-center;
    @apply py-3 px-3 rounded-2xl;
    @apply shadow-xl;
  }
  .day-score-button .success-check {
    @apply absolute;
    @apply bg-white;
    @apply h-5 w-5 rounded-full;
    @apply leading-none;
  }
  .day-score-button .success-check .ion-icon {
    margin-left: -2px;
    margin-top: -2px;
  }
</style>
