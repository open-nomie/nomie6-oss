<script lang="ts">
  // Port and modification from vue-n-calendar
  // https://github.com/maryayi/vue-sweet-calendar/blob/master/src/components/Calendar.vue

  // svelte
  import { onMount, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  // Local
  import math from '../../utils/math/math'

  // vendors
  import dayjs from 'dayjs'

  // Utils & modules
  import Logger from '../../utils/log/log'
  import calcTrackerScore from '../../modules/scoring/score-tracker'

  // Components
  import NPositivityBar from '../../components/positivity-bar/positivity-bar.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'

  import NextPrevCal from '../../components/next-prev-cal/next-prev-cal.svelte'
  import appConfig from '../../config/appConfig'
  import { Prefs, PrefsWeekStartTypes } from '../../domains/preferences/Preferences'

  const console = new Logger('📅 calendar/calendar')
  const dispatch = createEventDispatcher()

  // Props
  export let initialDate = dayjs()
  export let size = 'md'
  export let className = ''
  export let style = ''
  export let height: any = undefined
  export let width: any = undefined

  let firstDayOfWeek: 'sunday' | 'monday' = 'sunday'

  // Updating to be react...
  $: firstDayOfWeek = $Prefs.weekStarts

  // export let eventCategories = [];
  export let events = []
  export let offDays = [[1, 7]]
  export let showHeader = true
  export let showControls = true
  export let showCalControl = true
  export let showDetails = true
  export let tracker = null
  export const color: string = appConfig.primary_color
  export let compact: boolean = false

  // Data
  export let state = {
    date: initialDate.format ? initialDate : dayjs(initialDate),
    selectedDate: undefined, //initialDate.format ? initialDate : dayjs(initialDate)
    today: new Date(),
    weekdays: null,
    percentage: null,
    totals: {
      positive: 0,
      negative: 0,
      neutral: 0,
    },
  }

  let mounted = false

  onMount(() => {
    mounted = true
  })

  onDestroy(() => {
    mounted = false
  })

  let days: Array<any>

  let displayMonthFormat = 'MMMM'

  $: if (compact) {
    displayMonthFormat = 'MMM'
  } else {
    displayMonthFormat = 'MMMM'
  }

  let startWeekDayOfMonth = state.date.startOf('month').toDate().getDay() + 1
  let numberOfDays = state.date.daysInMonth()

  let selectedMonthName = state.date.format(displayMonthFormat)
  let selectedYear = state.date.format('YYYY')
  let monthStartDate = dayjs(state.date).startOf('month')

  // If the initial date is set, convert to dayjs date
  $: if (initialDate) {
    state.date = dayjs(initialDate)
    state.weekdays = methods.generateWeekdayNames(firstDayOfWeek)
  }

  function init() {
    lastDate = state.date

    state.totals.neutral = 0
    state.totals.positive = 0
    state.totals.negative = 0

    startWeekDayOfMonth = state.date.startOf('month').toDate().getDay() + 1

    numberOfDays = state.date.daysInMonth()
    // selectedMonth = state.date.month()
    selectedMonthName = state.date.format(displayMonthFormat)
    selectedYear = state.date.format('YYYY')
    monthStartDate = dayjs(state.date).startOf('month')

    // Create array of empty days previous month calendar bleed over
    const daySub = firstDayOfWeek === 'sunday' ? 1 : 2
    let emptyDays = Array((startWeekDayOfMonth - daySub + 7) % 7).fill(null)
    // Create array of days for this month
    let nonEmptyDays = Array(numberOfDays)
      .fill(0)
      .map((item, index) => dayjs(monthStartDate).add(index, 'day'))
    // Merge the arrays
    days = emptyDays.concat(nonEmptyDays)
    state.percentage = nonEmptyDays.length / (emptyDays.length + nonEmptyDays.length)
  }

  // If date change - do the magic.

  let lastDate = null
  $: if (state.date && state.date != lastDate) {
    init()
  }

  // Methods
  const methods = {
    prevMonth() {
      state.date = state.date.subtract(1, 'month')
    },
    nextMonth() {
      state.date = state.date.add(1, 'month')
    },
    generateWeekdayNames(firstDayOfWeek: PrefsWeekStartTypes) {
      let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      if (firstDayOfWeek === 'monday') {
        let first = weekdays.shift()
        weekdays.push(first)
      }
      return weekdays
    },
    // Refresh the view
    refresh() {
      // refreshing = true
      // setTimeout(() => {
      //   refreshing = false
      // }, 1)
    },
    // Go to Today
    goToday(withClick: boolean = true) {
      state.date = dayjs()
      if (withClick) {
        dispatch('dayClick', state.date)
      }
    },
    /**
     * Generate the Style for the Provided Day
     */
    getDayStyle(day) {
      let total = 0
      let score = undefined
      // Filter values, get only this days
      let values = events
        .filter((row) => {
          return day.toDate().toDateString() === new Date(row.end).toDateString()
        })
        // Map the tracker - and return the sum or avg values
        .map((row) => {
          if (!row.trackers) {
            row.getMeta()
          }
          if (tracker.math == 'sum') {
            return math.sum(row.getTrackerValues(tracker.tag))
          } else {
            return math.average(row.getTrackerValues(tracker.tag))
          }
        })
      // If we have values
      if (values.length) {
        // If it's a sum
        if (tracker.math == 'sum') {
          total = math.sum(values)
        } else {
          total = math.average(values)
        }
      }
      // If we have a total - figure the score
      if (total) {
        score = calcTrackerScore(total, tracker)
      }
      // Lets extract the score for this tracker
      if (values.length) {
        // Did we pass in a tracker?
        if (score == 0) {
          state.totals.neutral = state.totals.neutral + 1
        } else if (score > 0) {
          state.totals.positive = state.totals.positive + 1
        } else if (score < 0) {
          state.totals.negative = state.totals.negative + 1
        }
        return methods.getDayBorder(score)
      } else {
        return ``
      }
    },
    getDayBorder(score) {
      if (score) {
        if (score > 0) {
          return `font-weight:bold; border:solid 2px var(--color-green); color:#FFF; background-color:var(--color-green)`
        } else {
          return `font-weight:bold; border:solid 2px var(--color-red); color:#FFF; background-color:var(--color-red)`
        }
      } else {
        return `font-weight:bold; border:solid 2px var(--color-primary-bright); color:#FFF; background-color:var(--color-primary-bright);`
      }
    },
    getDayClass(day) {
      try {
        const dayFormat = day.format('YYYY-MM-DD')
        const stateDateFormat = state.date.format('YYYY-MM-DD')
        const selectedDateFormat = (state.selectedDate || dayjs()).format('YYYY-MM-DD')
        const todayFormat = dayjs().format('YYYY-MM-DD')
        const activeToday = events.find((row) => {
          if (dayFormat === stateDateFormat) {
            return true
          } else {
            return false
          }
        })
        let classes = [
          'day',
          `day-${day.format('D')}`,
          `weekday-${day.toDate().getDay()}`,
          activeToday ? 'selected' : 'not-selected',
          offDays.includes(day.toDate().getDay()) ? 'off-day' : null,
          dayFormat === todayFormat ? `today` : null,
          // Todo figure out how to deal with this
          dayFormat === selectedDateFormat ? 'active' : 'inactive',
        ]
        return classes.join(' ')
      } catch (e) {
        console.error(e)
        return 'error-generating-classes'
      }
    },
  }
</script>

{#if state.date && mounted}
  <div
    class="n-calendar {className}
    {size}
    {compact ? 'compact' : ''}"
    style="{`${width ? `width:${width};` : ''} ${height ? `height:${height};` : ''} outline:none;  ${style}`};"
  >
    <div class="n-calendar-container calendar">
      {#if showHeader}
        <div class="header flex">
          <div class="month filler pr-3">
            <span class="text-black dark:text-white text-sm">{selectedMonthName} {selectedYear}</span>
          </div>
          {#if showControls && !compact}
            <NextPrevCal
              hideCal={!showCalControl}
              on:previous={methods.prevMonth}
              on:next={methods.nextMonth}
              on:calendar={() => {
                methods.goToday(false)
              }}
            />
          {/if}
        </div>
      {/if}

      <div class="body">
        {#each state.weekdays || [] as day, index}
          <div class="day-name" aria-label={day}>{day[0]}</div>
        {/each}
        {#each days || [] as day}
          <div class="day-container clickable">
            {#if day}
              <div
                data-date={day.format('YYYY-MM-DD')}
                data-day={day.format('DD')}
                on:click={(event) => {
                  state.selectedDate = day
                  dispatch('dayClick', day)
                }}
                class={methods.getDayClass(day)}
                style={methods.getDayStyle(day)}
              >
                <span>{day.format('D')}</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
  {#if showDetails && !compact}
    <NPositivityBar positive={state.totals.positive} neutral={state.totals.neutral} negative={state.totals.negative} />
  {/if}
{:else}
  <div class="loading flex w-full h-auto justify-center items-center">
    <Spinner />
  </div>
{/if}

<style lang="postcss">
  .n-calendar.sm {
    --cal-font-size: 0.6em;
    --cal-day-size: 16px;
  }
  .n-calendar.md {
    --cal-font-size: 1em;
    --cal-day-size: 20px;
  }
  .n-calendar.lg {
    --cal-font-size: 0.8em;
    --cal-day-size: 24px;
  }
  .n-calendar .active {
    position: relative;
  }
  .n-calendar .active:before {
    content: '';

    @apply border border-green-500;
    @apply border-2;
    top: -4px;
    right: -4px;
    bottom: -4px;
    left: -4px;
    @apply rounded-full;
    position: absolute;
  }
  .n-calendar .today {
    position: relative;
  }
  .n-calendar .today:after {
    content: '';
    height: 4px;
    width: 4px;
    border-radius: 2px;

    @apply bg-primary-500;
    bottom: -5px;
    position: absolute;
  }
  .n-calendar .n-calendar-container .header {
    padding: 6px 12px;
  }
  .n-calendar .n-calendar-container .body {
    align-items: center;
    display: grid;
    grid-row-gap: 4px;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(7, 1fr);
    justify-items: center;
  }
  .n-calendar .n-calendar-container .body .day-name {
    color: var(--color-inverse);
    @apply text-gray-200 dark:text-gray-800;
    @apply font-extrabold;
    @apply text-xs;

    height: 18px;
  }
  .n-calendar .n-calendar-container .body .day-container {
    @apply flex items-center justify-center;
    height: 28px;
    position: relative;
    width: 100%;
  }
  .n-calendar .n-calendar-container .body .day-container .day {
    @apply flex items-center justify-center;
    @apply leading-none;
    border-radius: 32%;
    box-sizing: content-box;
    @apply text-gray-500;
    height: var(--cal-day-size);
    min-width: var(--cal-day-size);
  }
  .n-calendar .n-calendar-container .body .day-container .day.selected {
    border: 3px solid var(--color-solid-2);
    @apple border border-3 border-pink-500;
  }
  .n-calendar .n-calendar-container .body .day-container .day.off-day {
    background-color: #e5e5e5;
    font-weight: bold;
  }
  .n-calendar .n-calendar-container .body .day-container .day:active {
    font-weight: bold;
    @apply dark:bg-gray-700 bg-gray-200;
  }
  .n-calendar .n-calendar-container .body .day-container .day span {
    font-size: var(--cal-font-size);
    margin: 0;
    padding: 0;
    align-self: center;
  }
  .n-calendar.compact {
    --cal-font-size: 0.4em;
    --cal-day-size: 6px;
    min-width: 90px;
    margin: 2px;
    line-height: var(--cal-font-size);
    flex-grow: 0;
  }
  .n-calendar.compact .n-calendar-container .header {
    padding: 0px 0px 2px 0px !important;
    display: block;
    font-size: 0.9rem;
    margin: 0 !important;
  }
  .n-calendar.compact .n-calendar-container .body {
    grid-row-gap: 0px;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(7, 1fr);
  }
  .n-calendar.compact .n-calendar-container .body .day-name {
    font-size: 0.5em;
    height: auto;
    padding-top: 1px;
    padding-bottom: 1px;
  }
  .n-calendar.compact .n-calendar-container .body .day-container {
    height: auto;
    padding: 1px 0px !important;
  }
  .n-calendar .calendar {
    background-color: inherit;
  }
  .n-calendar .calendar .body .day-container .before,
  .n-calendar .calendar .body .day-container .after {
    height: 28px;
  }
  .n-calendar .date-picker {
    background-color: inherit;
  }
  .n-calendar .date-picker .body .day-container .day:hover {
    background-color: rgba(153, 66, 66, 0.5);
    border: 2px solid #994242;
    cursor: pointer;
  }
  .n-calendar .date-picker .body .day-container .day.selected {
    border: 2px solid #994242;
    color: #994242;
  }
  .n-calendar .day.unfilled {
    background-color: transparent;
  }
</style>
