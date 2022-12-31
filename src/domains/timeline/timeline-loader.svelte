<script lang="ts">
  /**
   * Timeline Loader
   * Mon Jun 13 2022 - Brandon
   * This is now a stand alone component that can load notes from
   * a certain point in time.
   * Timeline Page
   * Mon Feb 21 2022 - Brandon
   * The timeine page will show an infinite scrolling list of your activities
   */

  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'

  import { LedgerStore } from '../../domains/ledger/LedgerStore'
  import type NLog from '../../domains/nomie-log/nomie-log'

  import TimelineView from '../../domains/timeline/timeline-view.svelte'
  import { getDateFormats } from '../../domains/preferences/Preferences'

  import { createEventDispatcher, onDestroy, onMount } from 'svelte/internal'

  import { wait } from '../../utils/tick/tick'

  import type { TimelineFilterProps } from '../../domains/timeline/timeline-utils'

  import Empty from '../../components/empty/empty.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import type { IQueryOptions } from '../ledger/ledger-tools'
  import Button from '../../components/button/button.svelte'

  /**
   * View Base Filters
   * This allows you to show and hide different elements in the timeline
   */

  const baseFilters: TimelineFilterProps = {
    notes: true,
    maps: false,
    trackables: false,
    context: false,
  }

  export let filters: TimelineFilterProps = { ...baseFilters }
  export let daysToLoad: number = 30
  export let startingDate: Date = new Date()

  const maxEmptyCalls = 15 // Number of calls that come back empty before we stop looking

  let logs: Array<NLog> = []
  let date: Dayjs = dayjs(startingDate)
  let lastDate: Dayjs = dayjs(startingDate)

  let loading: boolean = true
  let mounted: boolean

  const emit = createEventDispatcher()

  onMount(() => {
    mounted = true
  })
  onDestroy(() => {
    mounted = false
  })

  let lastStartingDate: Date = new Date()
  $: if (startingDate && startingDate.toDateString() !== lastStartingDate.toDateString()) {
    
    lastStartingDate = startingDate
    logs = []
    date = dayjs(startingDate)
    lastDate = dayjs(startingDate)
    emptyCalls = 0
    loadLogs()
  }

  // let displayDate = dayjs(date)
  const dateFormats = getDateFormats()
  // const emit = createEventDispatcher()

  let emptyCalls = 0 // Current number of empty Calls

  // Determine if we're at the end.
  let atEnd: boolean = false
  $: atEnd = emptyCalls >= maxEmptyCalls

  /**
   * It's a recursive function that loads logs from the database.
   */
  const sequentialLogLoad = async (): Promise<void> => {
    // Go back days
    lastDate = date.subtract(daysToLoad, 'day')

    // Query Log
    const query: IQueryOptions = {
      end: date,
      start: lastDate,
    }
    if (filters.search) {
      
      query.search = filters.search
      query.fuzzy = true
    }
    const queryLogs = await LedgerStore.query(query)

    // If Query is empty - increase emptyCall Count
    if (queryLogs.length === 0) {
      emptyCalls = emptyCalls + 1
    }

    // Merge Logs together and sort / filter
    logs = [...queryLogs, ...logs.filter((l) => !queryLogs.find((lg) => lg._id === l._id))].sort((a, b) => {
      return a.end > b.end ? -1 : 1
    })

    if (logs.length == 0 && emptyCalls <= maxEmptyCalls) {
      date = dayjs(lastDate)
      await sequentialLogLoad()
    }
  }

  /**
   * Get Logs
   * @param clear
   * @param caller
   */
  const loadLogs = async (clear?: boolean, caller: string = 'unknown'): Promise<Array<NLog>> => {
    loading = true
    // Clear out the current Empty Call count?
    if (clear) {
      emptyCalls = 0
      date = dayjs(startingDate || new Date())
      lastDate = dayjs(startingDate || new Date())
    }

    // Do we have too many empty Calls?
    if (emptyCalls <= maxEmptyCalls) {
      await sequentialLogLoad()
    }
    loading = false
    return logs
  }

  /**
   * Load More Items
   * @param caller
   */
  const loadMore = async (caller?: string): Promise<Array<NLog>> => {
    if (emptyCalls < maxEmptyCalls) {
      date = dayjs(lastDate)
      return loadLogs(false, caller || 'loadMore')
    }
    return []
  }

  /**
   * If Date Changes
   * load more logs
   */
  // let hashDate: any

  // $: if (date && date !== hashDate && $TrackableStore.ready) {
  //   hashDate = date
  //   loadLogs(false, 'date reaction')
  // }

  /**
   * Jump to specific point in time
   */
  // const jumpTo = async () => {
  //   const jumpDate = await selectFuzzyDate(dayjs(date), false)
  //   if (jumpDate) {
  //     emptyCalls = 0
  //     date = dayjs(jumpDate)
  //     displayDate = date
  //     lastDate = dayjs(jumpDate)
  //     logs = []
  //     loadLogs()
  //   }
  // }

  /**
   * Clear Logs and Reload
   */
  const clearAndLoad = async () => {
    logs = []
    loadLogs(true, 'clearAndLoad')
  }

  let onLogSaved: Function
  let onLogUpdate: Function
  let onLogsDeleted: Function
  let firstKnownDate: Dayjs

  onMount(async () => {
    // Device.scrollToTop()
    firstKnownDate = await LedgerStore.getFirstDate()
    clearAndLoad()
    onLogUpdate = LedgerStore.hook('onLogUpdate', async (log) => {
      await wait(600)
      loadLogs(true, 'onLogUpdate')
    })

    onLogSaved = LedgerStore.hook('onLogSaved', async (log) => {
      await wait(600)
      loadLogs(true, 'onLogSaved')
    })

    onLogsDeleted = LedgerStore.hook('onLogsDeleted', async (logs) => {
      await wait(200)
      await clearAndLoad()
    })
  })
  onDestroy(() => {
    // Unsubscribe
    onLogSaved()
    onLogUpdate()
    onLogsDeleted()
  })
</script>

<!-- {#if filters.context}
    <Container className="px-4 py-2">
      <ContextChart height={150} bind:date={displayDate} on:item-click={(evt) => {}} />
    </Container>
  {/if} -->
{#if mounted}
  
  {#if logs.length}
    <TimelineView
      {logs}
      bind:filters
      on:scrollItem={(evt) => {
        const item = evt.detail
        emit('topItem', item)
        // topItem = item
      }}
      on:endOfItems={() => {
        if (!atEnd) {
          loadMore()
        }
      }}
    />
  {:else if loading}
    <div class="w-full h-screen -mt-12 flex items-center justify-center">
      <Spinner size={32} />
    </div>
  {:else if !loading}
    <Empty>
      <p class="text-gray-500 text-center leading-tight text-sm">
        No entries found between now and {date.format(dateFormats.date)}
      </p>
    </Empty>
  {/if}


  
  {#if atEnd && lastDate.toDate() > firstKnownDate.toDate()}
  <div class="px-4 py-2 absolute z-40 bottom-10 left-10 right-10 flex items-center justify-center">
    <Button size="sm" className="bg-primary text-white rounded-full"
      on:click={() => {
        emptyCalls = 0
        loadMore()
      }}>Load futher back...</Button
    >
  </div>
  {/if}
{/if}
