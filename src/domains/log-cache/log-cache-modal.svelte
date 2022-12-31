<script lang="ts">
  import dayjs from 'dayjs'
  import { onMount } from 'svelte'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'

  import Button from '../../components/button/button.svelte'
  import Empty from '../../components/empty/empty.svelte'
  import HScroller from '../../components/h-scroller/h-scroller.svelte'

  import ListItemLog from '../../components/list-item-log/list-item-log.svelte'

  import { showToast } from '../../components/toast/ToastStore'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  import { wait } from '../../utils/tick/tick'
  import {
    deleteAllFromCache,
    deleteLogFromCache,
    getLogChaseDates,
    getLogsFromCacheByDay,
  } from '../ledger/ledger-cache'
  import { LedgerStore } from '../ledger/LedgerStore'
  import type NLog from '../nomie-log/nomie-log'
  import { getDateFormats } from '../preferences/Preferences'

  export let id: string

  let dateFormats = getDateFormats()
  const close = () => {
    closeModal(id)
  }
  const clearAll = async () => {
    const confirmed = await Interact.confirm('Clear your Log Cache?')
    if (confirmed) {
      Interact.blocker('Deleting Cache...')
      await deleteAllFromCache()
      Interact.stopBlocker()
      showToast({ message: 'Cache Deleted' })
      init()
    }
  }

  let date: Date = new Date()
  let availableDates: Array<Date> = []

  let logs: Array<NLog> = []
  let activeLog: NLog | undefined

  const setLogs = async () => {
    logs = await getLogsFromCacheByDay(date)
  }

  const init = async () => {
    availableDates = (await getLogChaseDates()).reverse()
    setLogs()
  }

  const newDate = (_date) => {
    date = _date
    setLogs()
  }

  const importLog = async (log: NLog) => {
    activeLog = log
    LedgerStore._saveLog(log)
    await wait(100)
    activeLog = undefined

    return true
  }

  onMount(() => {
    init()
  })

  const deleteLog = async (log) => {
    await deleteLogFromCache(log)
    init()
  }
</script>

<BackdropModal>
  <header slot="header">
    <ToolbarGrid>
      <Button slot="left" primary clear on:click={close}>{Lang.t('general.close', 'Close')}</Button>
      <h1 class="ntitle">Log Cache</h1>
      <Button slot="right" className="whitespace-nowrap" primary clear on:click={clearAll}
        >{Lang.t('general.clear', 'Clear All')}</Button
      >
    </ToolbarGrid>
    <Toolbar>
      <HScroller wrapperClass="pl-2 space-x-4 pb-2 pt-1 py-2  w-full flex-nowrap">
        {#each availableDates as ldate}
          <Button
            size="sm"
            primary
            clear
            className="stiff {ldate.toDateString() != date.toDateString()
              ? 'text-gray-500'
              : 'bg-white dark:bg-black'} whitespace-nowrap"
            on:click={() => {
              newDate(ldate)
            }}>{dayjs(ldate).format(dateFormats.shortDate)}</Button
          >
        {/each}
      </HScroller>
    </Toolbar>
  </header>
  <main class="px-4 py-2">
    {#if !logs.length && !availableDates.length}
      <Empty className="text-gray-500">Cache Empty</Empty>
    {:else if !logs.length && availableDates.length}
      <Empty className="text-gray-500">Select a date above</Empty>
    {/if}
    {#each logs as log}
      <ListItemLog className="mb-2" {log} on:more={() => alert('more')}>
        <div
          class="flex space-x-2 justify-between items-center pt-4  border-t border-gray-500 border-opacity-20"
          slot="item-footer"
        >
          <Button on:click={() => deleteLog(log)} confirm clear size="sm" className=" text-red-500">Delete</Button>

          <Button
            size="sm"
            disabled={log == activeLog}
            className="bg-gray-200 dark:bg-gray-800"
            on:click={() => {
              importLog(log)
            }}
          >
            {#if log === activeLog}
              Importing...
            {:else}
              Import
            {/if}
          </Button>
        </div>
      </ListItemLog>
    {/each}
  </main>
</BackdropModal>

<style lang="postcss" global>
  .day-button.active {
    @apply bg-white dark:bg-black;
    @apply text-primary-400;
    @apply py-1 px-2 rounded-lg;
    @apply shadow-md;
  }
</style>
