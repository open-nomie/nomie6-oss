<script lang="ts">
  import dayjs from 'dayjs'

  import { onMount } from 'svelte'
  import Badge from '../../../components/badge/badge.svelte'

  import ListItem from '../../../components/list-item/list-item.svelte'
  import List from '../../../components/list/list.svelte'

  import { openDateOptionPopMenu } from '../../../components/pop-menu/usePopmenu'

  import nid from '../../../modules/nid/nid'

  import { objectHash } from '../../../modules/object-hash/object-hash'

  import { getEmojiFromScore } from '../../../utils/positivity/positivity'

  import { wait } from '../../../utils/tick/tick'

  import { LedgerStore } from '../../ledger/LedgerStore'
  import { openLogDisplay } from '../../nomie-log/log-display-modal/LogDisplayStore'

  import { getDateFormats } from '../../preferences/Preferences'

  import type { Trackable } from '../../trackable/Trackable.class'
  import { TrackerStore } from '../../tracker/TrackerStore'
  import type { TrackableLastUsedType } from '../../usage/UsageStore'

  import { TrackableUsage } from '../../usage/trackable-usage.class'
  import UsageChart from '../../usage/usage-chart.svelte'

  import { getDateRange, Stats2Store } from '../Stats2Store'
  // import OverviewRange from './overview-range.svelte'
  // import OverviewTimer from './overview-timer.svelte'
  // import OverviewValue from './overview-value.svelte'

  export let trackable: Trackable
  export let usage: TrackableUsage
  export let className: string = ''

  const dateFormats = getDateFormats()

  let usageByDay: TrackableUsage
  let lastUsageData: TrackableLastUsedType

  const openLatest = async (usage: TrackableLastUsedType) => {
    const date = usage.last.d
    const logId = usage.logId
    const logs = await LedgerStore.query({ start: dayjs(date).startOf('day'), end: dayjs(date).endOf('day') })
    const found = logs.find((l) => l._id === logId)
    if (found) {
      openLogDisplay(found)
    }
  }

  const renderChart = async () => {
    localUsage = undefined
    await wait(10)
    let chartUsage = new TrackableUsage({ ...usage, ...{ trackable } })
    usageByDay = chartUsage.byDay
    if ($Stats2Store.time === '1y') {
      chartUsage = chartUsage.groupBy('month', 'YYYY-MM-W')
    // } else if ($Stats2Store.time === '6m') {
      // chartUsage = chartUsage.groupBy('day', 'YYYY-MM-W')
    } else {
      chartUsage = chartUsage.byDay
    }

    const dateRange = getDateRange($Stats2Store.endDate, $Stats2Store.time)
    chartUsage = chartUsage.backfill(dateRange.start.toDate(), dateRange.end.toDate())
    localUsage = chartUsage

    // const timeDetails = expandStats2TimeType($Stats2Store.time)
    // localUsage = chartUsage.groupBy(timeDetails.unit, timeDetails.groupByFormat)
  }

  let lastUsageHash = ''
  let mounted: boolean = false
  let localUsage: TrackableUsage
  $: if (objectHash(usage) !== lastUsageHash && mounted) {
    lastUsageHash = objectHash(usage)
    // totalScore =
    renderChart()
  }

  // let unsub
  onMount(() => {
    mounted = true
  })
  // onDestroy(() => unsub())
</script>

<div class="bg-white p-2 dark:bg-black  relative {className}">
  {#if localUsage}
    <UsageChart
      id={`usage-${nid(localUsage.trackable.tag)}`}
      hideValues={false}
      className="h-40 max-h-40 lg:max-h-42 "
      usages={[localUsage]}
      type="bar"
    />
  {:else if $Stats2Store.loading}
    <div class="skeleton-item h-40 w-full bg-white rounded-lg dark:bg-gray-900" />
  {:else}
    <div class="h-40 flex items-center justify-center text-gray-500">No Data</div>
  {/if}
</div>

<main class="grid grid-cols-2 gap-2 dark:text-white">
  <div class="h-auto text-center">
    <strong class="text-sm font-semibold">Daily Avg </strong>
    <div class="text-2xl line-clamp-1 font-semibold bg-white shadow-md dark:bg-black rounded-md px-4 py-2 mt-1">
      {#if usageByDay}
        {usageByDay.trackable.formatValue(usageByDay.average)}
      {:else}
        <span class="text-gray-500">Loading...</span>
      {/if}
    </div>
  </div>
  <div class="text-center">
    <strong class="text-sm font-semibold">Total </strong>
    <div class="text-2xl line-clamp-1 font-semibold bg-white shadow-md dark:bg-black rounded-md px-4 py-2 mt-1">
      {#if usage}
        {usage.displayValue}
      {:else}
        <span class="text-gray-500">Loading...</span>
      {/if}
    </div>
  </div>
</main>

{#if usage && usageByDay}
  <List solo className="w-full bright">
    {#if lastUsageData}
      <ListItem
        bottomLine={18}
        className="dark:bg-black bg-white shadow-md h-24 rounded-xl"
        on:click={() => {
          openLatest(lastUsageData)
        }}
      >
        Latest: {dayjs(lastUsageData.last.d).format(dateFormats.mmm_d_yyyy)}
        <div slot="right">{trackable.formatValue(lastUsageData.last.v, true)}</div>
      </ListItem>
    {/if}
    <ListItem
      bottomLine={18}
      detail
      on:click={() => {
        let date = usageByDay.max.date
        openDateOptionPopMenu(date.toDate())
      }}
    >
      <strong>Max </strong>
      <div slot="right" class="item-center space-x-2 flex">
        {#if usageByDay.max}
          <Badge className="pad">{dayjs(usageByDay.max.date).format(dateFormats.mmm_d_yyyy)}</Badge>
        {/if}
        <span>{usageByDay.max ? trackable.formatValue(usageByDay.max.value) : '0'}</span>
      </div>
    </ListItem>

    <ListItem
      bottomLine={18}
      detail
      on:click={() => {
        openDateOptionPopMenu(usageByDay.min.date.toDate())
      }}
    >
      <strong>Min </strong>
      <div slot="right" class="item-center space-x-2 flex">
        <Badge className="pad">{usageByDay.min ? dayjs(usageByDay.min.date).format(dateFormats.mmm_d_yyyy) : ''}</Badge>
        <span>{usageByDay.min ? trackable.formatValue(usageByDay.min.value) : ''}</span>
      </div>
    </ListItem>

    <ListItem>
      <strong>Score</strong>

      <div slot="right">
        {usage.getTotalScore($TrackerStore)}
        {getEmojiFromScore(
          usage.getTotalScore($TrackerStore) > 0 ? 1 : usage.getTotalScore($TrackerStore) < 0 ? -1 : 0,
          true
        )}
      </div>
    </ListItem>
  </List>
{:else}
  <div class="skeleton-item w-full h-14" />
  <div class="skeleton-item w-full h-14" />
{/if}
