<script lang="ts">
  import type { Dayjs } from 'dayjs'
  import dayjs from 'dayjs'

  import { createEventDispatcher } from 'svelte'

  import HScroller from '../../components/h-scroller/h-scroller.svelte'
  import TimeSelect from '../../components/time-select/time-select.svelte'
  import { TodayStore } from '../usage/today/TodayStore'

  export let time: any = new Date().getTime()
  export let is24Hour: boolean = false

  const dispatch = createEventDispatcher()

  $: activeDate = dayjs(new Date(time))

  const days: Array<Dayjs> = Array(30)
    .fill(0)
    .map((zero, daysBack) => {
      return dayjs(new Date()).subtract(daysBack, 'day')
    })
    .reverse()

  $: selectedDayIndex = days.findIndex((d) => d.format('YYYY-MM-DD') === $TodayStore.date.format('YYYY-MM-DD'))

  const onDayMonthSelected = (day: Dayjs, index: number) => {
    selectedDayIndex = index
    const newDate = day.hour(activeDate.hour()).minute(activeDate.minute()).toDate()
    dispatch('change', newDate)
  }
</script>

<section aria-label="date-time-setting" class="flex items-center justify-items-stretch">
  <div class="filler">
    <HScroller activeIndex={selectedDayIndex} wrapperClass="space-x-2 pr-1 snap-scroll-x" className="mr-2">
      {#each days as day, index}
        <button
          on:click={() => {
            onDayMonthSelected(day, index)
          }}
          class="snap-end {selectedDayIndex == index
            ? 'selected active bg-primary-500 my-1 px-2 text-white font-bold '
            : ' text-primary-500'}  text-xs p-1 stiff rounded-full "
        >
          {day.format('MMM')}
          {day.format('D')}
        </button>
      {/each}
    </HScroller>
  </div>

  <!-- <div class="stiff">
    <TimeSelect
      className="stiff"
      {is24Hour}
      time={activeDate.toDate().getTime()}
      on:change={(evt) => {
        dispatch('change', evt.detail)
      }}
    />
  </div> -->
</section>
