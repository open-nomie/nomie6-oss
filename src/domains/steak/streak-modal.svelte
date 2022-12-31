<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list'
  import type { Dayjs } from 'dayjs'
  import dayjs from 'dayjs'

  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'
  import Calendar from '../../components/calendar/calendar.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import ListItemSingleTrackable from '../../components/list-item-log/list-item-single-trackable.svelte'
  import { openDateOptionPopMenu } from '../../components/pop-menu/usePopmenu'
import Spinner from '../../components/spinner/spinner.svelte'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import CloseOutline from '../../n-icons/CloseOutline.svelte'
import { wait } from '../../utils/tick/tick';
  import Calendar3 from '../calendar-view/calendar3.svelte'

  import { queryToTrackableUsage } from '../ledger/LedgerStore'
  import NLog from '../nomie-log/nomie-log'

  import { getDateFormats } from '../preferences/Preferences'

  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { TrackableUsage } from '../usage/trackable-usage.class'

  import { UsageStore } from '../usage/UsageStore'
import { streakSummary, StreakSummaryResults } from './streak-helper';

  

  export let trackable: Trackable
  export let date: Date
  export let id: string

  let usage: TrackableUsage
  let endDate: Dayjs
  let startDate: Dayjs
  let _startDate: Date
  let max: number = 0

  let values: Array<{ date: Dayjs; value: number; index?: number; logs: Array<NLog> }> = []
  let dateFormats = getDateFormats()

  const DAYS_BACK = 30

  let lastTrackable
  $: if (trackable && trackable !== lastTrackable) {
    lastTrackable = trackable
    values = []
  }
  $: if (date) {
    endDate = dayjs(date)
    startDate = endDate.subtract(DAYS_BACK, 'days')
    _startDate = startDate.toDate()
    loadUsage()
  }

  let rawUsage: TrackableUsage
  let loading: boolean = false;
  const loadUsage = async () => {
    loading = true;
    rawUsage = await queryToTrackableUsage(
      trackable,
      {
        start: startDate,
        end: endDate,
      },
      $TrackableStore.trackables
    )

    max = rawUsage.max?.value > max ? rawUsage.max.value : max
    usage = rawUsage.byDay.backfill(startDate.toDate(), endDate.toDate())

    // Loop over Dates
    usage.dates.forEach((date, i) => {
      // Get Index of the current Date from Raw Usage
      let rawIndex = rawUsage.dates.findIndex((d) => d.format('YYYY-MM-DD-HH') === date.format('YYYY-MM-DD-HH'))

      // If Values DOES NOT have this date
      if (!values.find((d) => d.date.format('YYYY-MM-DD') == date.format('YYYY-MM-DD'))) {
        let log = rawIndex > -1 ? rawUsage.logs[rawIndex] : undefined
        values.push({
          date,
          value: usage.values[i],
          logs: log ? [log] : [],
        })
      }
    })
    values = values
      .sort((a, b) => {
        return a.date < b.date ? 1 : -1
      })
      .map((item, index) => {
        //@ts-ignore
        item.index = index
        return item
      })
    wait(500).then(()=>{
      loading = false;
    })
  }

  const close = () => {
    closeModal(id)
  }

  let lastKnownEnd: number
  let listEndIndex: number
  let listStartIndex: number

  let streak: StreakSummaryResults;

  $: if (lastKnownEnd !== listEndIndex && listEndIndex === values.length - 1 && values.length > 0) {
    lastKnownEnd = listEndIndex
    startDate = startDate.subtract(DAYS_BACK, 'day')
    _startDate = startDate.toDate()
    endDate = endDate.subtract(DAYS_BACK, 'day')
    loadUsage()
    let knownDates:Array<Date> = values.filter((v)=>{
      return v.value > 0 || v.value < 0
    }).map(v=>{
      return v.date.toDate()
    });
    streak = streakSummary(knownDates)
    
  }
</script>

<BackdropModal headerClass="glass mb-2" mainClass="bg-white filler dark:bg-black">
  <header slot="header">
    <ToolbarGrid>
      <Button slot="left" primary icon on:click={close}>
        <IonIcon icon={CloseOutline} />
      </Button>
      <h1 class="ntitle capitalize line-clamp-1">
        <TrackableAvatar {trackable} size={22} />
        {trackable.label} Streak
      </h1>
    </ToolbarGrid>
    {#if rawUsage && rawUsage.logs}
      <Calendar3
        hidePrevNext={true}
        loading={false}
        date={_startDate}
        bind:trackableUsage={rawUsage}
        on:input={(evt) => {
          
        }}
        on:dateChange={(evt) => {
          date = new Date(evt.detail)          
        }}
      />
     
    {/if}
    {#if streak}
      <section class="flex w-full  py-2">
        <div class="rounded-full flex space-x-4 items-center mx-auto w-auto">
          <div class="leading-tight text-center flex items-center space-x-2 text-xs text-description">
            <div class="">Current</div>
            <div class="font-bold">{streak.currentStreak} days</div>
          </div>
          <div class="leading-tight text-center flex items-center space-x-2 text-xs text-description">
            <div class="">Longest</div>
            <div class="font-bold">{streak.longestStreak} days</div>
          </div>
        </div>
      </section>
    {/if}
  </header>

  <VirtualList bind:end={listEndIndex} bind:start={listStartIndex} items={values} let:item>
    <div
      class="px-4 flex bg-white dark:bg-black justify-items-stretch  items-center {isNaN(item.value)
        ? 'no-activity'
        : 'has-activity'}"
      style="--trackable-color:{trackable.color}"
    >
      <div
        class="connector-ball {isNaN(item.value) ? 'no-activity' : 'has-activity'} 
        {!isNaN(values[item.index - 1]?.value) ? 'prev-sib-active' : 'prev-sib-inactive'}
        {!isNaN(values[item.index + 1]?.value) ? 'next-sib-active' : 'next-sib-inactive'}"
      />
      {#if isNaN(item.value)}
        <div class="streak-item no-activity relative w-full  text-gray-500 font-semibold ">
          {item.date.format(dateFormats.mmm_d_yyyy)}
        </div>
      {:else}
        <!-- <div class="streak-item space-x-3 has-activity relative w-full">
          <TrackableAvatar {trackable} size={52} slot="left" />
          <main class="w-full">
            <h1 class="font-semibold leading-none flex items-end space-x-2">
              <span class="text-lg text-black dark:text-white">{trackable.label}</span>
              <span
                class="opacity-80 ml-2 font-bold bg-gray-300 dark:bg-gray-700 dark:text-white text-xs rounded-full px-3 py-1 leading-none "
                >{trackable.formatValue(item.value)}</span
              >
            </h1>
            <div class="grid w-full grid-cols-1 lg:grid-2 items-center">
              <div class="text-xl font-bold pt-1 text-black dark:text-white">
                {item.date.format(dateFormats.mmm_d_yyyy)}
              </div>
            </div>
            <ProgressBar
              className="h-2 bg-gray-500 bg-opacity-20"
              barClass="h-2"
              color={trackable.color}
              percentage={math.percentage(max, item.value)}
            />
          </main>
        </div> -->

        <ListItemSingleTrackable
          className="ml-2 has-activity"
          on:click={(evt) => {
            openDateOptionPopMenu(evt.detail.log.end)
            // showLogTrackablePopmenu(evt.detail.log, trackable)
          }}
          hideTime
          {max}
          {trackable}
          log={trackable.type === 'person' && item.logs && item.logs.length
            ? new NLog({ note: item.logs[0].note })
            : item.logs.length == 1
            ? new NLog(item.logs[0])
            : new NLog({ note: `${trackable.tag}(${item.value})`, end: item.date })}
        />
      {/if}
    </div>
  </VirtualList>
  {#if loading}
  <div class="absolute bottom-4 right-4 z-50">
    <Spinner size={20} />
  </div>
  {/if}
</BackdropModal>

<style lang="postcss" global>
  .has-activity .connector-ball {
    background-color: var(--trackable-color);
  }

  .streak-item.no-activity {
    @apply h-12;
  }
  .streak-item.activity {
    @apply h-44;
  }
  .streak-item {
    @apply flex items-center justify-between;
    @apply py-2 px-4;
    @apply relative;
  }

  .no-activity .connector-ball {
    @apply bg-gray-500 bg-opacity-40;
    @apply h-11;
  }

  .connector-ball {
    @apply h-20;
    @apply w-2;
    @apply mr-2;
    @apply rounded-full;
    @apply relative;
  }
  .connector-ball:after {
    content: '';
  }
  .connector-ball.next-sib-active.prev-sib-inactive:after {
    @apply rounded-t-full;
  }
  .connector-ball.next-sib-inactive.prev-sib-inactive:after {
    @apply rounded-full;
  }
  .connector-ball.next-sib-inactive.prev-sib-active:after {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }
  .connector-ball.next-sib-inactive:after {
    @apply rounded-b-full;
  }
  .connector-ball.next-sib-active.prev-sib-active:after,
  .connector-ball.next-sib-inactive.prev-sib-inactive:after {
    border-radius: none !important;
  }
  .connector-ball:after {
    @apply absolute;
    @apply w-full;
    height: calc(100% + 20px);
    @apply -top-2 left-0 right-0 -bottom-2;
  }
  .connector-ball.has-activity:after {
    background-color: var(--trackable-color);
  }
</style>
