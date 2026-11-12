<svelte:options runes={true} />

<script lang="ts">
  import dayjs from 'dayjs'

  import { createEventDispatcher, onMount } from 'svelte'
  import Spinner from '../../components/spinner/spinner.svelte'

  import { LedgerStore, queryToTrackableUsage } from '../ledger/LedgerStore'

  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { TrackableUsage } from '../usage/trackable-usage.class'

  import Calendar3 from './calendar3.svelte'

  const dispatch = createEventDispatcher()
  let { trackable, date = $bindable() } = $props()

  let loading = $state(true)
  let tu = $state<TrackableUsage>(undefined)

  const loadData = async () => {
    try {
      loading = true
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve(null)
        }, 5000) // 5 second timeout
      })

      const result = await Promise.race([
        queryToTrackableUsage(
          trackable,
          {
            start: dayjs(date).startOf('month'),
            end: dayjs(date).endOf('month'),
          },
          $TrackableStore.trackables
        ),
        timeoutPromise
      ])

      if (result) {
        tu = result
        dispatch('usage', tu)
      }
    } catch (e) {
      console.error('loadData error:', e)
    } finally {
      loading = false
    }
  }

  // Disabled to prevent infinite loop with LedgerStore updates
  // let lastHash = $state('')
  // $effect(() => {
  //   if (date && trackable && $LedgerStore.hash && `${date?.toDateString()}${trackable.tag}` !== lastHash) {
  //     lastHash = `${date.toDateString()}${trackable.tag}`
  //     loadData()
  //   }
  // })

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
