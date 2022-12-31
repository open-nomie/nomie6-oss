<script lang="ts">
  import { onMount } from 'svelte'
  import config from '../../config/appConfig'
  import LogList from './log-list.svelte'

  import { LedgerStore } from '../../domains/ledger/LedgerStore'
  import tick from '../../utils/tick/tick'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  // vendor
  import dayjs from 'dayjs'

  import Spinner from '../spinner/spinner.svelte'
  import Button from '../button/button.svelte'
  import { Lang } from '../../store/lang'
  import { getDateFormats } from '../../domains/preferences/Preferences'

  export let term = null
  export let limit = 20
  export let className = ''
  export let compact = false
  export let fullDate = true
  export let results = []
  export let showTimeDiff = false

  let loading = false
  let logs = []

  let lastFrom
  let lastTo

  const dtFormat = getDateFormats()

  // React to Term Change
  let lastTerm

  $: if (term && lastTerm !== term) {
    lastTerm = term
    reset()
    search()
  }

  function reset() {
    logs = []
    lastTo = null
    lastFrom = null
    lastTerm = null
  }

  async function search() {
    // Set from and to date
    loading = true
    const unit: any = config.book_time_unit
    const from: any = !lastFrom ? dayjs().subtract(limit, unit) : dayjs(lastFrom).subtract(limit, unit)
    const to: any = !lastTo ? dayjs() : dayjs(lastTo).subtract(limit, unit)

    // Query the ledger
    let book = await LedgerStore.query({
      start: from.toDate(),
      end: to.toDate(),
      search: term,
      caller: 'log-list-loader',
    })
    //
    logs = [...logs, ...book].sort((a, b) => {
      return a.end > b.end ? 1 : -1
    })
    lastFrom = from
    lastTo = to
    await tick(12)
    loading = false
    results = logs
  }

  // function cancelSearch() {
  //   cancelled = true;
  // }

  onMount(() => {
    reset()
  })
</script>

<div class="log-list-loader">
  <LogList
    {fullDate}
    className="bg-transparent mb-4 {className}"
    {compact}
    {logs}
    {showTimeDiff}
    on:trackerClick={(event) => {
      dispatch('trackerClick', event.detail)
    }}
    on:locationClick={(event) => {
      dispatch('locationClick', event.detail)
    }}
    on:textClick={(event) => {
      dispatch('textClick', event.detail)
    }}
    on:moreClick={(event) => {
      dispatch('moreClick', event.detail)
    }}
  />
  {#if !loading && logs.length == 0}
    <div class="px-4 py-10 text-center text-gray-800 dark:text-gray-100">
      Nothing found since now and <strong>{lastFrom.format(dtFormat.date)}</strong>
    </div>
  {/if}
  {#if !loading && lastTo}
    <Button
      block
      className="mx-auto bg-primary-500 focus:ring-2 ring-yellow-500  text-white"
      style="max-width:300px;"
      on:click={search}
    >
      {Lang.t('general.continue', 'Continue Looking')}...
    </Button>
    <div class="text-center px-4 py-4">
      <p class="text-xs  pb-2 text-gray-500">
        Point in time: ({lastFrom.fromNow()})
        <br />{lastFrom.format(dtFormat.date)}
      </p>
    </div>
  {:else if loading}
    <div class="px-4 pb-4 text-center">
      <p class="text-xs font-bold pb-2 text-gray-700 dark:text-gray-300">Going back in time...</p>
      <Button block className="mx-auto bg-primary-500 text-white" style="max-width:300px;" disabled>
        <Spinner size={18} />
        <span class="ml-2">{Lang.t('general.searching', 'Searching...')}</span>
      </Button>
    </div>
  {/if}
</div>

<style lang="postcss">
  .log-list-loader {
    position: relative;
  }
</style>
