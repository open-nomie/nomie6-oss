<script lang="ts">
  import dayjs from 'dayjs'

  import { onMount } from 'svelte'
  import { quintOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'
  import HScroller from '../../components/h-scroller/h-scroller.svelte'
  import Scroller from '../../components/scroller/scroller.svelte'
  import { Device } from '../../store/device-store'
  import { getDateFormats } from '../preferences/Preferences'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { loadToday, TodayStore } from './today/TodayStore'

  let dateFormats = getDateFormats()
  let daysBack: number = 30
  const backInTime = (daysBack: number) => {
    loadToday({
      knownTrackables: $TrackableStore.trackables,
      date: dayjs().subtract(daysBack, 'day'),
    })
  }

  const done = () => {
    loadToday({
      knownTrackables: $TrackableStore.trackables,
      date: dayjs(),
      showController: false,
    })
  }

  onMount(() => {
    setTimeout(() => {
      document.querySelector('.date-setting .time-wrapper').scrollTo({ left: 1000000 })
    }, 100)
  })
</script>

<div
  transition:slide={{ delay: 250, duration: 300, easing: quintOut }}
  class="date-setting flex items-center justify-center bg-red-500"
>
  <Scroller
    className="filler min-w-0 py-2"
    start="end"
    snapToItem="center"
    direction="x"
    items={Array(daysBack)
      .fill(0)
      .map((v, i) => i)}
    let:item
  >
    <button
      id="bit-{item}"
      on:click={() => {
        backInTime(daysBack - (item + 1))
        Device.scrollToTop()
      }}
      class="{dayjs()
        .subtract(daysBack - (item + 1), 'day')
        .format('YYYY-MM-DD') === $TodayStore.date.format('YYYY-MM-DD')
        ? 'active ring-2 ring-white'
        : 'inactive'}  bit-button  whitespace-nowrap py-1 my-1 w-auto stiff flex-wrap leading-tight text-sm font-semibold  px-2 rounded-lg"
    >
      {dayjs()
        .subtract(daysBack - (item + 1), 'day')
        .format(dateFormats.tinyDate)}
    </button>
  </Scroller>
  <button class="bg-white text-red-500 py-1 w-auto  leading-tight px-3 rounded-full mx-2 stiff" on:click={done}
    >Done</button
  >
</div>

<style lang="postcss" global>
  .date-setting {
    @apply bg-red-500;
    @apply text-white;
  }
  .date-setting .bit-button:last-child {
    margin-right: 20px !important;
  }
</style>
