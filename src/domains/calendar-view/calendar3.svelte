<script lang="ts">
  import dayjs, { Dayjs } from 'dayjs'
  import { createEventDispatcher } from 'svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronBackOutline, ChevronForwardOutline } from '../../components/icon/nicons'

  import { Lang } from '../../store/lang'
  import { parseNumber } from '../../utils/parseNumber/parseNumber'
  import type { TrackableUsage } from '../usage/trackable-usage.class'

  export let date: Date = new Date()
  export let weekStarts: 'monday' | 'sunday' = 'sunday'
  export let trackableUsage: TrackableUsage | undefined = undefined
  export let size: 'sm' | 'base' = 'base'
  export let loading: boolean
  export let hidePrevNext: boolean = false;

  let now = dayjs().format('YYYY-MM-DD')

  const dispatch = createEventDispatcher()

  let weekDays = [
    Lang.t('days.monday', 'Monday'),
    Lang.t('days.tuesday', 'Tuesday'),
    Lang.t('days.wednesday', 'Wednesday'),
    Lang.t('days.thursday', 'Thursday'),
    Lang.t('days.friday', 'Friday'),
    Lang.t('days.saturday', 'Saturday'),
    Lang.t('days.sunday', 'Sunday'),
  ]

  $: datejs = dayjs(date).startOf('month')
  $: daysInMonth = datejs.daysInMonth()
  $: daysInPreviousMonth = datejs.subtract(1, 'month').daysInMonth()
  $: firstDayColumn = datejs.day() - (weekStarts === 'monday' ? 1 : 0)
  $: lastDayColumn = datejs.endOf('month').day() + (weekStarts === 'monday' ? 0 : 1)
  $: month = datejs.month()
  $: year = parseNumber(datejs.format('YYYY'))
  $: if (weekStarts == 'sunday') {
    const sunday = weekDays.pop()
    weekDays.unshift(sunday)
  }

  const nextPrev = (dir: 'next' | 'previous') => {
    if (dir === 'next') {
      date = dayjs(date).add(1, 'month').toDate()
    } else {
      date = dayjs(date).subtract(1, 'month').toDate()
    }
    dispatch('dateChange', date)
  }

  const getDayClass = (date: Dayjs): string => {
    let classArr = []
    if (!trackableUsage) return ''
    const dateIndex = trackableUsage.dates.findIndex((d) => d.format('YYYY-MM-DD') === date.format('YYYY-MM-DD'))
    if (dateIndex > -1) {
      classArr.push('has-value')
    }
    if (trackableUsage.positivity[dateIndex] > 0) {
      classArr.push('is-positive')
    } else if (trackableUsage.positivity[dateIndex] < 0) {
      classArr.push('is-negative')
    }
    return classArr.join(' ')
  }

  const dayClicked = (d: Dayjs) => {
    dispatch('input', d.toDate())
  }
</script>

{#key trackableUsage}
  <div class="calendar-3" style="--trackable-color:{trackableUsage.trackable.color}">
    <header>
      <div class="title py-2 px-2 ntitle flex items-center space-x-1">
        <slot name="header-left" />

        <!-- Month Selector -->
        <div class="divide-x-2 divide-opacity-30 divide-gray-500 flex items-center nselect-group">
          <select
            class="nselect rounded-r-none"
            class:sm={size == 'sm'}
            value={month}
            on:input={(evt) => {
              //@ts-ignore
              let newDate = datejs.month(evt.target.value)
              date = newDate.toDate()
              dispatch('dateChange', newDate.toDate())
            }}
          >
            {#each Array(12)
              .fill(0)
              .map((c, index) => {
                return dayjs().month(index).startOf('month').format('MMM')
              }) as lmonth, index}
              <option value={index}>{lmonth}</option>
            {/each}
          </select>

          <!-- Year Selector -->
          <select
            class="nselect rounded-l-none"
            class:sm={size == 'sm'}
            value={year}
            on:input={(evt) => {
              //@ts-ignore
              let newDate = datejs.year(parseNumber(evt.target.value))
              date = newDate.toDate()
              dispatch('dateChange', newDate)
            }}
          >
            {#each Array(12)
              .fill(0)
              .map((c, index) => {
                return parseNumber(dayjs().format('YYYY')) - index
              }) as lyear, index}
              <option value={lyear}>{lyear}</option>
            {/each}
          </select>
        </div>
        <div class="filler" />
        {#if !hidePrevNext}
        <button class="nselect" class:sm={size == 'sm'} on:click={() => nextPrev('previous')}>
          <IonIcon icon={ChevronBackOutline} size={14} />
        </button>
        {/if}
        <button
          class:sm={size == 'sm'}
          class="nselect "
          on:click={() => {
            date = new Date()
          }}>Today</button
        >
        {#if !hidePrevNext}
        <button class="nselect" class:sm={size == 'sm'} on:click={() => nextPrev('next')}>
          <IonIcon icon={ChevronForwardOutline} size={14} />
        </button>
        {/if}
      </div>
      <div class="header-days grid grid-cols-7 w-full">
        {#each weekDays as weekDay}
          <div class="cell">
            {weekDay.substring(0, 3)}
          </div>
        {/each}
      </div>
    </header>

    <!-- Main View  -->
    <main class="grid grid-cols-7 w-full calendar-days">
      {#if !loading}
        <!-- Loop over Month Before days  -->
        {#each Array(firstDayColumn).fill(0) as c, index}
          <button
            class="past-month day d-{datejs.format('YYYY-MM-DD')}"
            class:today={datejs.format('YYYY-MM-DD') === now}
            on:click={() => {
              let dayindex = daysInPreviousMonth - (firstDayColumn - (index + 1))
              dayClicked(datejs.subtract(1, 'month').date(dayindex))
            }}
          >
            <span>{daysInPreviousMonth - (firstDayColumn - (index + 1))}</span>
          </button>
        {/each}

        <!-- Looop over month days -->
        {#each Array(daysInMonth)
          .fill(0)
          .map((c, index) => {
            return datejs.date(index + 1)
          }) as ldate, index}
          <button
            class="cell day day-${index} d-{ldate.format('YYYY-MM-DD')} {getDayClass(ldate)}"
            class:today={ldate.format('YYYY-MM-DD') === now}
            on:click={() => {
              dayClicked(ldate)
            }}
          >
            <span> {index + 1}</span>
          </button>
        {/each}

        <!-- Loop over month end days -->
        {#each Array(7 - lastDayColumn).fill(0) as c, index}
          <button
            class="next-month day d-{datejs.format('YYYY-MM-DD')}"
            class:today={datejs.format('YYYY-MM-DD') == now}
            on:click={() => {
              dayClicked(datejs.add(1, 'month').date(index + 1))
            }}
          >
            <span>{index + 1}</span>
          </button>
        {/each}
      {/if}
    </main>
  </div>
{/key}

<style global>
  .calendar-3.sm {
  }
  .calendar-3.xs {
  }
  .calendar-3 header {
    @apply bg-gray-200 dark:bg-gray-800;
    @apply text-gray-600 dark:text-gray-400;
  }
  .calendar-3 .header-days .cell {
    @apply px-3 py-1;
    @apply text-sm;
    @apply flex justify-center items-center;
  }
  .calendar-3 .calendar-days .day.past-month,
  .calendar-3 .calendar-days .day.next-month {
    @apply opacity-30;
  }
  .calendar-3 .calendar-days .day {
    @apply relative;
    @apply text-sm;
    @apply p-1;
    @apply flex items-center justify-center;
    /* @apply border-b border-l border-gray-200 dark:border-gray-700; */
    @apply h-8;
    @apply focus:outline-none;
  }
  .calendar-3 .calendar-days .day span {
    @apply block;
    @apply relative;
    @apply text-black dark:text-white;
  }
  .calendar-3 .calendar-days .day:focus {
    @apply ring-2 ring-primary-300 ring-inset;
  }
  .calendar-3 .calendar-days .day.today span {
    @apply text-green-500 font-bold;
    @apply bg-primary-500 text-white;
    @apply rounded-full;
    @apply h-6 w-6;
    @apply flex items-center justify-center;
  }

  .calendar-3 .calendar-days .day.has-value::after {
    content: '';
    @apply absolute;
    @apply bottom-1;
    @apply left-2;
    @apply right-2;
    height: 3px;
    @apply rounded-full;
    background-color: var(--trackable-color);
  }

  .calendar-3 .calendar-days .day.has-value.is-positive::after {
    @apply bg-green-500;
  }
  .calendar-3 .calendar-days .day.has-value.is-negative::after {
    @apply bg-red-500;
  }
</style>
