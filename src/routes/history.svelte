<script lang="ts">
  import Container from './../components/container/container.svelte'

  /**
   * History Tab
   * A big collection of all things history
   *
   * TODO: Have it react when the ledger change, not a hard refresh
   */

  // svelte

  import { onMount, onDestroy } from 'svelte'

  // components

  import IonIcon from '../components/icon/ion-icon.svelte'

  import Spinner from '../components/spinner/spinner.svelte'
  import LogItem from '../components/list-item-log/list-item-log.svelte'

  import OfflineQueue from '../components/offline-queue/offline-queue.svelte'

  // Containers

  import NLayout from '../domains/layout/layout.svelte'
  // Utils
  import dayjs from 'dayjs'
  import tick from '../utils/tick/tick'

  // Stores

  import { Interact } from '../store/interact'
  import { LedgerStore } from '../domains/ledger/LedgerStore'
  import { Lang } from '../store/lang'

  import { Device } from '../store/device-store'

  import Button from '../components/button/button.svelte'
  import NextPrevCal from '../components/next-prev-cal/next-prev-cal.svelte'

  import NLog from '../domains/nomie-log/nomie-log'
  // import Location from '../modules/locate/Location'
  import Empty from '../components/empty/empty.svelte'
  import { ActiveLogStore } from '../domains/capture-log/CaptureLogStore'
  import ButtonGroup from '../components/button-group/button-group.svelte'
  import Toolbar from '../components/toolbar/toolbar.svelte'
  import type { OTDViewOption } from '../domains/on-this-day/on-this-day-helpers'
  import { OTDViews } from '../domains/on-this-day/on-this-day-helpers'
  import OnThisDayViews from '../domains/on-this-day/on-this-day-views.svelte'

  import { getDateFormats, Prefs } from '../domains/preferences/Preferences'
  import { tokenToTrackable } from '../modules/tokenizer/tokenToTrackable'
  import { TrackableStore } from '../domains/trackable/TrackableStore'
  import { showTrackablePopmenu } from '../domains/board/boardActions'
  import { openStats2 } from '../domains/stats2/Stats2Store'
  import { Trackable } from '../domains/trackable/Trackable.class'
  import { ChevronForwardOutline, SearchIcon } from '../components/icon/nicons'
  import { selectFuzzyDate } from '../domains/timeline/select-date-fuzzy'
  import { openUnisearch } from '../domains/search/UnisearchStore'

  export const location = undefined
  export let style = undefined

  let appTitle = null
  let showSearch = false

  const dateFormats = getDateFormats()

  const state = {
    date: dayjs(new Date()),
    // time_format: config.book_time_format,
    logs: [],
    ledger: null,
    locations: [],
    showAllLocations: false,
  } // Assign State to compiled history page

  let refreshing = false
  let logs = [] // holder of the logs
  let loading = true
  // let locations = []

  /// Watchers for when we're in edit mode
  // and when we have selected more than one.

  let isToday = true
  let view: OTDViewOption = 'all'

  // If the date changes - check to see if it's still today
  let activeDate
  $: if (state.date && state.date !== activeDate) {
    activeDate = state.date
    isToday = new Date().toDateString() == state.date.toDate().toDateString()
  }

  $: appTitle = `History ${state.date.format('YYYY-MM-DD')}`

  function composeHere() {
    let logConfig = { end: undefined }
    if (!isToday) {
      logConfig.end = state.date.hour(dayjs().hour()).toDate().getTime()
    }
    let log = new NLog(logConfig)
    ActiveLogStore.journal(log)
  }

  // Methods
  const methods = {
    async textClick(event) {
      let token = event.detail
      let trackable = tokenToTrackable(token, $TrackableStore.trackables)
      showTrackablePopmenu(trackable)
    },
    async getLogs(fresh?: boolean) {
      fresh = fresh === false ? false : true
      loading = true
      // Query the Ledger for Posts on this day.
      logs = await LedgerStore.query({
        start: state.date.startOf('day'),
        end: state.date.endOf('day'),
        fresh: fresh,
      })

      logs = logs || []
      // locations = logs
      //   .filter((log: NLog) => {
      //     return log.lat
      //   })
      //   .map((log: NLog) => {
      //     return new Location({
      //       lat: log.lat,
      //       lng: log.lng,
      //       name: log.location,
      //       log: log,
      //     })
      //   })
      loading = false
      return logs || []
    },

    previous() {
      methods.getDate(state.date.subtract(1, 'day'))
    },
    getDate(date) {
      state.date = date
      methods.getLogs()
      methods.scrollTop()
    },
    next() {
      methods.getDate(state.date.add(1, 'day'))
    },
    scrollTop() {
      document.getElementById('nomie-main').scrollTo({ top: 0 })
    },
    goto(date) {
      state.date = date
      methods.getLogs()
      methods.scrollTop()
    },
    search() {
      // SearchStore.view('history')
      openUnisearch()
    },
    trackerTapped(tracker, log) {
      openStats2(tracker.toTrackable())
    },
    personTapped(person, log) {
      openStats2(person.toTrackable())
    },
    contextTapped(context, log) {
      openStats2(new Trackable({ type: 'context', context }))
    },
    showLogOptions(log) {
      Interact.logOptions(log)
    },
    async selectDate() {
      const date = await selectFuzzyDate(state.date, isToday)
      methods.goto(date)
    },
  }

  async function refresh() {
    refreshing = true
    await tick(500)
    await methods.getLogs(true)
    await LedgerStore.getMemories()
    refreshing = false
  }

  // If a new Log is added, or changed update the list.
  let onLogUpdate
  let onLogSaved
  let onLogsDeleted

  // WHen mounted.
  onMount(() => {
    Device.scrollToTop()

    refresh()

    onLogUpdate = LedgerStore.hook('onLogUpdate', async (log) => {
      await tick(600)
      refresh()
    })

    onLogSaved = LedgerStore.hook('onLogSaved', async (log) => {
      await tick(600)
      refresh()
    })

    onLogsDeleted = LedgerStore.hook('onLogsDeleted', async () => {
      await tick(600)
      refresh()
    })
  })
  onDestroy(() => {
    // Unsubscribe
    onLogSaved()
    onLogUpdate()
    onLogsDeleted()
  })
</script>

<NLayout pageTitle={appTitle} {style}>
  <header slot="header" class="items-center flex-column z-30">
    <Container>
      <Toolbar className=" px-2 items-center">
        <Button icon on:click={methods.search}>
          <IonIcon className="text-primary-500" icon={SearchIcon} size={24} />
        </Button>
        {#if refreshing}
          <Spinner size={16} />
        {/if}
        <h1 class="leading-none ntitle line-clamp-1 text-left ml-2" aria-label="Current Active Date">
          {state.date.format('ddd')}
          {state.date.format(dateFormats.date)}
        </h1>
        <div class="filler" />
        <NextPrevCal on:previous={methods.previous} on:next={methods.next} on:calendar={methods.selectDate} {isToday} />
      </Toolbar>
      {#if logs.length}
        <Toolbar className="px-4">
          <ButtonGroup
            compact
            bind:value={view}
            buttons={OTDViews.map((otd) => {
              return {
                label: otd.view,
                icon: otd.icon,
                value: otd.view,
              }
            })}
          >
            <!-- {#each OTDViews as loopView}
              <Button
                size="sm"
                className={view === loopView.view ? 'active' : ''}
                icon
                on:click={() => {
                  view = loopView.view
                }}
              >
                <div class="relative pt-1">
                  <IonIcon icon={loopView.icon} size={28} />
                  <div data-count={loopView.reduce(logs)} class="notification-badge" />
                </div>
              </Button>
            {/each} -->
          </ButtonGroup>
        </Toolbar>
      {/if}
    </Container>
  </header>
  <!-- end header-content header -->

  <main slot="content" class="flex flex-col h-full page flex-grow h-75vh page-history">
    <div class="relative flex-grow min-h-full  h-full">
      <OfflineQueue />
      
      {#if loading}
        <div class="flex items-center justify-center w-full max-h-full h-75vh">
          <Spinner />
        </div>
      {:else if !loading && !logs.length}
        <Container className="flex items-center justify-center max-h-full h-75vh">
          <Empty
            emoji="⏳"
            title={state.date.format($Prefs.use24hour ? 'ddd Do MMM YYYY' : 'ddd MMM Do YYYY')}
            description={`${Lang.t('history.empty-day', 'No data was found on this day')}`}
            buttonLabel={Lang.t('history.add-a-note', 'Add a Note...')}
            buttonClick={composeHere}
          />
        </Container>
      {/if}
      <OnThisDayViews {view} {logs} on:date={(evt)=>{
        methods.getDate(dayjs(evt.detail));
      }} />
    </div>
    
    <div class="h-20" />
  </main>
</NLayout>

<style global lang="postcss">
  .history-title {
    transition: all 0.2s ease-in-out;
    padding-left: 16px;
  }

  .scrolled .history-title.hide-scrolled {
    opacity: 0;
  }
  body .history-title.show-scrolled {
    opacity: 0;
  }
  .scrolled .history-title.show-scrolled {
    opacity: 1;
  }

  .close-btn {
    bottom: 20px !important;
    z-index: 10;
    position: absolute !important;
    right: 50%;
    margin-right: -16px;
  }
  .page-history .n-item .n-item:last-child {
    border-bottom: none !important;
  }
  .notification-badge {
    @apply w-4;
    @apply h-4;
    @apply rounded-full;
    @apply bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-50;
    @apply text-gray-700 dark:text-gray-300;
    @apply shadow-sm;
    @apply absolute;
    @apply top-0;
    @apply -right-3;
    @apply flex;
    @apply items-center;
    @apply justify-center;
    font-size: 9px;
    @apply font-bold;
  }
  .active .notification-badge {
    @apply bg-primary-500;
    @apply text-white;
  }
  .notification-badge[data-count='0'] {
    @apply hidden;
  }
  .notification-badge::after {
    content: attr(data-count);
  }
</style>
