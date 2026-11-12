<svelte:options runes={true} />

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

  let { goal = $bindable() } = $props<{ goal: GoalClass }>()

  let usage: TrackableUsage | undefined = $state(undefined)

  let scores: Array<GoalScoreType> = $state([])
  let loading: boolean = $state(true)
  let showLoading: boolean = $state(true)


  let years: Array<Array<GoalScoreType>> = $state([])


  let totalMonths: number | undefined = $state(undefined)
  let totalSuccess: number | undefined = $state(undefined)

  let startDate: Date = $state(new Date())

  let trackable: Trackable | undefined = $state(undefined)

  $effect(() => {
    if (goal && goal.tag) {
      trackable = $TrackableStore.trackables[goal.tag]
    }
  })

  const generateYearsFromScores = () => {
    
    let yearMap: any = {}
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
        let startOfYear = `${score.date.startOf('year').format('YYYY-MM-DD')}`
        yearMap[startOfYear] = yearMap[startOfYear] || []
        yearMap[startOfYear].push(score)
      })
    
    return Object.keys(yearMap)
      .map((id) => {
        return yearMap[id]
      })
      .sort((a, b) => {
        return a[0].date.toDate() > b[0].date.toDate() ? -1 : 1
      })
  }

  const getPast = async () => {
    
    showLoading = true
    const start = dayjs(startDate).subtract(2, 'year')
    const end = dayjs(startDate).endOf('day')

    usage = await getTrackableUsage(trackable, start, end, $TrackableStore.trackables)
    let backFilled = usage.byDay.backfill(start.toDate(), end.toDate())
    scores = [...scores, ...goal.calculateScores(backFilled)]

    
    totalMonths = scores.length
    totalSuccess = scores.filter((s) => s.success).length

    years = generateYearsFromScores()
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
  let lastDate: any = $state(undefined)

  $effect(() => {
    if (startDate && startDate !== lastDate) {
      lastDate = startDate
      getPast()
    }
  })

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

{#if goal && totalMonths}
  <div class="bg-white  dark:bg-black px-4 pb-4  flex flex-col space-y-2">
    <h1 class="text-xl font-bold text-black dark:text-white leading-tight mt-4 pb-">
      {trackable.label}
      {getGoalComparisonSymbol(goal.comparison)}
      {trackable.formatValue(goal.target)}
    </h1>
    {#if scores}
      <p class="text-gray-600 dark:text-gray-400 leading-snug pb-2">
        Goal hit <strong class="text-black dark:text-white"
          >{math.round(math.percentage(totalMonths, totalSuccess))}%</strong
        >
        <strong>{totalSuccess}</strong> out of {totalMonths} months.
        <br />
      </p>
      <ProgressBar
        color={trackable.color}
        className="h-2"
        barClass="h-1 "
        percentage={math.round(math.percentage(totalMonths, totalSuccess))}
      />
    {/if}
  </div>
{:else if !loading && !totalMonths}
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
    items={years}
    let:item
    on:end={() => {
      startDate = dayjs(startDate).subtract(2, 'year').toDate()
    }}
  >
    {#if item[0]}
      <div class="month">
        <h2>
          {item[0].date.format(dateFormats.monthYear)} → {item[item.length - 1].date.format(dateFormats.monthYear)}
        </h2>
        {#if item.length < 4}
         <div class="goal-balls">
          
          {#each item as month, i}
          {#if i < 1}
          <button
              on:click={() => openDateOptions(month.date.toDate())}
              style="transform: scale({getPad(month.percent)})"
              class="goal-ball-month transition-all  {month.success == true ? 'bg-green-500' : ''} {month.failure == true
                ? 'bg-red-500'
                : ''}"
            >
              {month.date.format('MMM')}
            </button>

          {:else if item[i].date.format('MMM') != item[i-1].date.format('MMM')}
          
            <button
              on:click={() => openDateOptions(month.date.toDate())}
              style="transform: scale({getPad(month.percent)})"
              class="goal-ball-month transition-all  {month.success == true ? 'bg-green-500' : ''} {month.failure == true
                ? 'bg-red-500'
                : ''}"
            >
              {month.date.format('MMM')}
            </button>
            {/if}
            
          {/each}
        </div>
        {:else}
        <div class="goal-balls">
          
          {#each item as month, i}
          {#if i < 1}
          <button
              on:click={() => openDateOptions(month.date.toDate())}
              style="transform: scale({getPad(month.percent)})"
              class="goal-ball-month transition-all  {!Number.isNaN(month.og) && month.success == true ? 'bg-green-500' : ''} {!Number.isNaN(month.og) && month.failure == true
              ? 'bg-red-500'
              : ''} {Number.isNaN(month.og) ? 'bg-gray-500' : ''}"
          >
              {month.date.format('MMM')}
            </button>

          {:else if item[i].date.format('MMM') != item[i-1].date.format('MMM')}
          
            <button
              on:click={() => openDateOptions(month.date.toDate())}
              style="transform: scale({getPad(month.percent)})"
              class="goal-ball-month transition-all  {!Number.isNaN(month.og) && month.success == true ? 'bg-green-500' : ''} {!Number.isNaN(month.og) && month.failure == true
                ? 'bg-red-500'
                : ''} {Number.isNaN(month.og) ? 'bg-gray-500' : ''}"
            >
              {month.date.format('MMM')}
            </button>
           
            {/if}
          { /each}
        </div>
        {/if}
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
  .goal-scroller .month {
    @apply px-4;
  }
  .goal-scroller .month h2 {
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
  .goal-ball-month {
    @apply rounded-full;
    @apply m-px lg:m-1;
    @apply text-xs font-bold;
    @apply flex items-center justify-center text-center;
    @apply h-9 w-9;
    @apply flex-grow-0 flex-shrink-0;
    @apply text-white;
    @apply transition-all duration-100 ease-in-out;
    width:7%;
    font-size: .500rem;
    flex-shrink: 1;
    flex-grow: 1;

  }
  .day-score-button {
    @apply relative;
    @apply bg-white dark:bg-gray-900;
    @apply flex flex-col items-center justify-center;
    @apply py-1 px-3 rounded-2xl;
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

