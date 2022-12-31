<script lang="ts">
  import dayjs from 'dayjs'
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CaretDown, ChevronForwardOutline } from '../../components/icon/nicons'

  import { LedgerStore } from '../ledger/LedgerStore'
  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { TrackableUsage } from '../usage/trackable-usage.class'
  import logsToTrackableUsage from '../usage/usage-utils'
  import { openOnThisDayModal } from '../on-this-day/useOnThisDayModal'
  import { trackOnThisDay } from './StreakStore'

  import type { LastUsedStoreState } from '../usage/UsageStore'

  import math from '../../utils/math/math'
  import { UsageStore } from '../usage/UsageStore'
  import Scroller from '../../components/scroller/scroller.svelte'
  import { getDateFormats } from '../preferences/Preferences'
  import { openDateOptionPopMenu } from '../../components/pop-menu/usePopmenu'
  import LetterTicker from '../../components/letter-ticker/letter-ticker.svelte'

  const dispatch = createEventDispatcher()

  // TODO: See why it's not adding all the them .

  let selectedIndex
  let selectedLabel: string | undefined = undefined
  let unsubLastUsedStore: Function
  let lastUsedState: LastUsedStoreState

  export let endDate: Date = new Date()
  export let trackable: undefined | Trackable = undefined
  export let loading: boolean = true

  let trackableUsage: TrackableUsage

  let trackableMaxUsed: number = 10
  $: if (lastUsedState && (trackable || endDate)) {
    getData()
  }

  let getDataTimeout
  const getData = async () => {
    clearTimeout(getDataTimeout)
    getDataTimeout = setTimeout(() => {
      loadLogs()
    }, 200)
  }

  let dateFormats = getDateFormats();

  onMount(async () => {
    await loadLogs()

    unsubLastUsedStore = UsageStore.subscribe((lus) => {
      lastUsedState = lus
    })
  })

  onDestroy(() => {
    unsubLastUsedStore()
  })

  

  /**
   * Track an event on a given day
   * when the user taps the a date that has nothing in it
   * @param date
   * @param existingLogCount
   */

  /**
   * Load logs for a given tracker
   */

  const loadLogs = async () => {
    loading = true
    const endDayjs = dayjs(endDate).endOf('day')
    const startDayjs = dayjs(endDayjs).subtract(30, 'days').startOf('day')

    let usage = new TrackableUsage({ trackable, values: [], dates: [] })
    trackableUsage = usage.byDay.backfill(startDayjs.toDate(), endDayjs.toDate())

    const queryOptions = {
      end: endDayjs,
      start: startDayjs,
      search: trackable.tag,
      fuzzy: true,
      caller: 'streak2.svelte',
    }

    const items = await LedgerStore.query(queryOptions)

    const allUsage = logsToTrackableUsage(items, { trackables: $TrackableStore.trackables })
    if (allUsage[trackable.tag]) {
      usage = allUsage[trackable.tag]
    } else {
      usage = new TrackableUsage({ trackable, values: [], dates: [] })
    }
    trackableUsage = usage.byDay.backfill(startDayjs.toDate(), endDayjs.toDate())
    trackableMaxUsed = math.max(trackableUsage.values)
    loading = false
    return true
  }

  const showDateOptions = (date:Date, trackable:Trackable)=>{
    openDateOptionPopMenu(date, [{
      title: 'Track on this Day',
      click() {
        trackOnThisDay(trackable, dayjs(date).hour(dayjs().hour()).toDate(), $TrackableStore.trackables)
      }
    }])
  }
</script>

<div class="streak-2 bg-white dark:bg-black py-1">
  <!-- {#if `${selectedIndex}`.length}
    <button
      on:click={() => {
        if (selectedIndex) {
          openDateOptionPopMenu(trackableUsage?.dates[selectedIndex].toDate())
          // openOnThisDayModal(trackableUsage?.dates[selectedIndex].toDate())
        }
        dispatch('label-click', selectedIndex)
      }}
      class="text-center w-full  text-black h-12  hover-primary  dark:text-white py-2 text-xl font-bold border-b border-gray-500 border-opacity-20"
    >
      <LetterTicker text={selectedLabel || selectedIndex || ''} />
      <IonIcon icon={ChevronForwardOutline} className="text-gray-500" size={16} />
    </button>
    <div class="flex items-center justify-center -mt-2">
      <IonIcon icon={CaretDown} />
    </div>
  {/if} -->
  <Scroller
    let:item
    start="end"
    snapToItem="center"
    centerPoint
    items={trackableUsage?.dates || []}
    direction="x"
    let:index
    itemsClass="streak-scroller px-2 py-2 space-x-2"
    on:change={(evt) => {
      if (evt.detail.centerPosItem && evt.detail.centerPosItem.item) {
        selectedIndex = evt.detail.centerPosItem?.details?.index
        selectedLabel = evt.detail.centerPosItem?.item.format(`ddd ${dateFormats.mmm_d_yyyy}`)
      }
    }}
  >
    <div
      class="day {selectedIndex === index ? 'active' : ''}"
      data-index={index}
      data-label={item.format('dddd, MMMM D')}
      aria-controls="form"
    >
      <button
        on:click={() => {
          // openDateOptionPopMenu(item.toDate())
          showDateOptions(item.toDate(), trackableUsage.trackable);
        }}
        class="mb-1 text-solid border-dotted border-b border-gray-200 dark:border-gray-800 
        "
      >
        <div class="text-xs opacity-70 leading-none">{item.format('ddd')}</div>
        <div class="leading-tight">{item.format(dateFormats.tinyNumber)}</div>
      </button>
      
      <button
      on:click={() => {
        showDateOptions(item.toDate(), trackableUsage.trackable);
      }}
        class="day-wrapper"
      >
        {#if !isNaN(trackableUsage.values[index])}
          <div class="value {trackable?.formatValue(trackableUsage.values[index])?.length > 3 ? 'xs' : ''}">
            {trackable ? trackable.formatValue(trackableUsage.values[index]) : trackableUsage.values[index]}
          </div>
        {:else}
          <div class="value">
            {trackable ? trackable.formatValue(0) : 0}
          </div>
        {/if}
        <div
          class="progress w-full transition-all duration-75"
          style="height:{`${math.percentage(
            trackableMaxUsed || 0,
            trackableUsage?.values[index] || 0
          )}`}%;background-color:{trackableUsage.trackable.color}"
        />
      </button>
      <button class="track-button" on:click={() => {
        trackOnThisDay(trackableUsage.trackable, item.hour(dayjs().hour()).toDate(), $TrackableStore.trackables)
      }}>
        +
      </button>
    </div>
  </Scroller>
</div>

<style lang="postcss" global>
  .snap-scroll {
    scroll-snap-type: x mandatory;
  }
  .streak-2 .day {
    @apply text-center;

    scroll-snap-align: center;
    @apply transform transition-all duration-100;
    @apply rounded-xl;
    @apply outline-none;
    @apply flex flex-col items-center;
  }

  .streak-2 .day:focus .day-wrapper {
    @apply ring-2 ring-primary-500 ring-offset-1;
    @apply text-center w-full rounded-md;
  }

  .streak-2 .track-button {
    @apply bg-gray-200 dark:bg-gray-800;
    @apply w-full rounded-md;
    @apply mt-1;
  }

  .streak-2 .day-wrapper {
    @apply relative;
    @apply h-full;
    @apply overflow-hidden;
    @apply bg-gray-200 dark:bg-gray-800;
    @apply overflow-hidden;
    @apply w-12 h-14;
    @apply rounded-md;
    @apply flex flex-col items-center justify-end;
    @apply transform transition-all duration-100;
    @apply p-0;
  }
  .streak-2 .day-wrapper .value {
    @apply text-sm;
    @apply leading-none;
    @apply text-white;
    @apply px-1;
    @apply absolute;
    @apply bottom-1;
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.86);
    @apply bg-black bg-opacity-10;
    @apply min-w-0;
    @apply p-1;
    @apply rounded-lg;
    min-width: 20px;
    @apply text-center;
    @apply inline-block;
  }
  .streak-2 .day:focus .wrapper,
  .streak-2 .day.active .day-wrapper {
    @apply ring-primary-600;
  }

  .streak-2 .day.active label {
    @apply font-bold;
  }

  .streak-2 .day .used {
  }

  .streak-2 .progress {
    @apply rounded-sm;
    @apply transition-all duration-500 ease-in-out;
  }

  .streak-2 .day .not-used {
    @apply mt-4;
    @apply bg-gray-500 bg-opacity-25;
  }

  .streak-2 .day label {
    @apply block;
    @apply text-gray-500 text-sm text-center;
    @apply pb-1;
  }
</style>
