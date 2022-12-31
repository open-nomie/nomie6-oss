<script lang="ts">
  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'
  import { createEventDispatcher } from 'svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronBackOutline, ChevronForwardOutline } from '../../components/icon/nicons'

  import { Lang } from '../../store/lang'
  import { parseNumber } from '../../utils/parseNumber/parseNumber'
  import type NLog from '../../domains/nomie-log/nomie-log'

  import { objectHash } from '../../modules/object-hash/object-hash'
  import math from '../../utils/math/math'
  import ProgressBar from '../progress-bar/progress-bar.svelte'
  import type { CalendarDayUnit } from './calendar-utils'

  export let date: Date = new Date()
  export let weekStarts: 'monday' | 'sunday' = 'sunday'

  export let days: Array<CalendarDayUnit> = []

  export let size: 'sm' | 'base' = 'base'

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

  type DayMapType = {
    [key: string]: CalendarDayUnit
  }
  let daysMap: DayMapType = {}

  $: if (objectHash(days)) {
    days.forEach((day) => {
      daysMap[day.date.toDateString()] = day
    })
  }

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
    const day = days.find((d) => {
      return d.date.toDateString() === date.toDate().toDateString()
    })
    if (day) {
    }
    // if (!trackableUsage) return ''
    // const dateIndex = trackableUsage.dates.findIndex((d) => d.format('YYYY-MM-DD') === date.format('YYYY-MM-DD'))
    // if (dateIndex > -1) {
    //   classArr.push('has-value')
    // }
    // if (trackableUsage.positivity[dateIndex] > 0) {
    //   classArr.push('is-positive')
    // } else if (trackableUsage.positivity[dateIndex] < 0) {
    //   classArr.push('is-negative')
    // }
    return classArr.join(' ')
  }

  const dayClicked = (d: Dayjs) => {
    dispatch('input', d.toDate())
  }
</script>

<div class="calendar-4" style="">
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

      <button class="nselect clear" class:sm={size == 'sm'} on:click={() => nextPrev('previous')}>
        <IonIcon icon={ChevronBackOutline} size={22} />
      </button>
      <button class="nselect clear" class:sm={size == 'sm'} on:click={() => nextPrev('next')}>
        <IonIcon icon={ChevronForwardOutline} size={22} />
      </button>
      {#if date.toDateString() !== new Date().toDateString()}
        <button
          class:sm={size == 'sm'}
          class="nselect"
          on:click={() => {
            date = new Date()
          }}>Today</button
        >
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
    <!-- Loop over Month Before days  -->
    {#each Array(firstDayColumn).fill(0) as c, index}
      <button
        data-positivity={daysMap[datejs.toDate().toDateString()]?.positivity}
        data-value={daysMap[datejs.toDate().toDateString()]?.value}
        data-max={daysMap[datejs.toDate().toDateString()]?.max}
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
        const d = datejs.date(index + 1)
        let dateMap = daysMap[d.toDate().toDateString()]

        return { date: d, key: d
            .toDate()
            .toDateString(), value: dateMap?.value, positivity: dateMap?.positivity > 0 ? 'positive' : dateMap?.positivity < 0 ? 'negative' : 'neutral', percentage: dateMap?.percentage || math.percentage(dateMap?.max || 10, dateMap?.value || 0) }
      }) as dayItem, index}
      <button
        class="cell day day-{index} positivity-{dayItem.positivity}"
        class:today={dayItem.date.format('YYYY-MM-DD') === now}
        on:click={() => {
          dayClicked(dayItem.date)
        }}
      >
        <span> {index + 1}</span>
        {#if dayItem.percentage}
          <ProgressBar
            className=" h-1 absolute bottom-1 left-1 right-1"
            barClass="h-1 {dayItem.positivity === 'positive'
              ? 'bg-green-500'
              : dayItem.positivity == 'negative'
              ? 'bg-red-500'
              : 'bg-primary-500'}"
            percentage={dayItem.percentage}
          />
        {/if}
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
  </main>
</div>

<style lang="postcss" global>
  .calendar-4.sm {
  }
  .calendar-4.xs {
  }
  .calendar-4 header {
    @apply bg-gray-200 dark:bg-gray-800;
    @apply text-gray-600 dark:text-gray-400;
  }
  .calendar-4 .header-days .cell {
    @apply px-3 py-1;
    @apply text-sm;
    @apply flex justify-center items-center;
  }
  .calendar-4 .calendar-days .day.past-month,
  .calendar-4 .calendar-days .day.next-month {
    @apply opacity-30;
  }
  .calendar-4 .calendar-days .day {
    @apply relative;
    @apply text-sm;
    @apply p-1;
    @apply flex items-center justify-center;
    @apply border-b border-l border-gray-200 dark:border-gray-700;
    @apply h-10;
    @apply focus:outline-none;
  }
  .calendar-4 .calendar-days .day span {
    @apply block;
    @apply relative;
    @apply text-black dark:text-white;
  }
  .calendar-4 .calendar-days .day:focus {
    @apply ring-2 ring-primary-300 ring-inset;
  }
  .calendar-4 .calendar-days .day.today span {
    @apply text-green-500 font-bold;
    @apply bg-primary-500 text-white;
    @apply rounded-full;
    @apply h-6 w-6;
    @apply flex items-center justify-center;
  }

  .calendar-4 .calendar-days .day.has-value::after {
    content: '';
    @apply absolute;
    @apply bottom-1;
    @apply left-2;
    @apply right-2;
    @apply h-1;
    @apply rounded-full;
    background-color: var(--trackable-color);
  }

  .calendar-4 .calendar-days .day.has-value.is-positive::after {
    @apply bg-green-500;
  }
  .calendar-4 .calendar-days .day.has-value.is-negative::after {
    @apply bg-red-500;
  }
</style>
