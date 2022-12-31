<script lang="ts">
  import Text from '../text/text.svelte'

  import { onMount } from 'svelte'
  import NItem from '../list-item/list-item.svelte'
  import LogItem from '../list-item-log/list-item-log.svelte'
  import NSpinner from '../spinner/spinner.svelte'
  import TimeGap from '../time-gap/time-gap.svelte'
  import { createEventDispatcher } from 'svelte'
  import dayjs from 'dayjs'
  const dispatch = createEventDispatcher()

  export let logs = null
  export let compact = false
  export let style = ''
  export let className = ''
  export let fullDate = false
  export let showTimeDiff = false

  let loading = false
  // export let hideMore = false;

  let internalLogs = []

  function sort(logs) {
    return logs
      .map((log, i) => {
        log._key = log._id + i
        return log
      })
      .sort((a, b) => {
        return a.end < b.end ? 1 : -1
      })
  }

  $: if (logs) {
    internalLogs = sort(logs)
  }
</script>

{#if loading}
  <div class="flex-grow n-panel center-all h-100">
    <NSpinner />
  </div>
{:else}
  <div class="space-y-4 {className}" {style}>
    {#each internalLogs as log, index (log._key)}
      <LogItem
        {fullDate}
        className={compact ? 'compact' : ''}
        {log}
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
      {#if showTimeDiff && index !== internalLogs.length - 1}
        <TimeGap log1={log} log2={internalLogs[index + 1]} />
      {/if}
    {/each}
  </div>
{/if}
