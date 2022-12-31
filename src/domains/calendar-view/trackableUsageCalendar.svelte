<script lang="ts">
  import dayjs from 'dayjs'

  import { createEventDispatcher, onMount } from 'svelte'
  import Spinner from '../../components/spinner/spinner.svelte'

  import { LedgerStore, queryToTrackableUsage } from '../ledger/LedgerStore'

  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { TrackableUsage } from '../usage/trackable-usage.class'

  import Calendar3 from './calendar3.svelte'

  export let trackable: Trackable
  export let date: Date = new Date()

  const dispatch = createEventDispatcher()

  let loading = true
  let tu: TrackableUsage

  let loadClearTimeout
  const loadData = async () => {
    loading = true
    clearTimeout(loadClearTimeout)
    loadClearTimeout = setTimeout(async () => {
      tu = await queryToTrackableUsage(
        trackable,
        {
          start: dayjs(date).startOf('month'),
          end: dayjs(date).endOf('month'),
        },
        $TrackableStore.trackables
      )

      dispatch('usage', tu)
      loading = false
    }, 100)
  }

  let lastHash = ''
  $: if (date && trackable && $LedgerStore.hash && `${date?.toDateString()}${trackable.tag}` !== lastHash) {
    lastHash = `${date.toDateString()}${trackable.tag}`
    loadData()
  }
  onMount(() => {
    loadData()
  })
</script>

{#if tu}
  <Calendar3
    bind:trackableUsage={tu}
    bind:loading
    on:input={(evt) => {
      dispatch('input', evt.detail)
    }}
    on:dateChange={(evt) => {
      date = evt.detail
      dispatch('change', date)
      loadData()
    }}
  />
{/if}
{#if !tu || loading}
  <div class="h-60 flex items-center justify-center">
    <Spinner size={32} />
  </div>
{/if}
