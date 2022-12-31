<script lang="ts">
  // import dayjs from 'dayjs'
  // import type { Dayjs } from 'dayjs'
  // import { LedgerStore } from '../ledger/LedgerStore'
  // import NLog from '../nomie-log/nomie-log'
  // import appConfig from '../../config/appConfig'
  // // import StatsV5 from '../stats/statsV5'
  // // import TrackerClass from '../../modules/tracker/TrackerClass'

  // import type { TrackableUsageType, TrackableUsageResponse, GeneralCountsResponse } from './analyticsUtils'
  // import DayOfWeek from '../../components/day-of-week/day-of-week.svelte'
  // import Card from '../../components/card/card.svelte'
  // import TimeOfDay from '../../components/time-of-day/time-of-day.svelte'
  // import TrackablePill from '../trackable/trackable-pill.svelte'

  // import { TrackableStore } from '../trackable/TrackableStore'
  // import { showTrackablePopmenu } from '../board/boardActions'

  // import Spinner from '../../components/spinner/spinner.svelte'
  // import { positivityFromLogs } from '../../utils/positivity/positivity'
  // import type { IPositivityResults } from '../../utils/positivity/positivity'
  // import math from '../../utils/math/math'
  // import Pie from '../../components/charts/pie.svelte'
  // import Map from '../map/map.svelte'
  // import extractLocations from '../../modules/location-extractor/location-extractor'
  // import type { LocationExtractionType } from '../../modules/location-extractor/location-extractor'
  // // import BarChart from '../../components/charts/bar-chart-2.svelte'
  // import ButtonGroup from '../../components/button-group/button-group.svelte'
  // import type { TimeGroupType } from '../../utils/calendar-map/calendar-map'
  // import type { Trackable } from '../trackable/Trackable.class'

  // import Toolbar from '../../components/toolbar/toolbar.svelte'
  // import AnalyticsUsageChart from './analytics-usage-chart.svelte'
  // import { Lang } from '../../store/lang'
  // import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'

  // export let endDate: Dayjs = dayjs()
  // export let startDate: Dayjs = endDate.subtract(180, 'days')

  // let results: Array<NLog> = []

  // let loaded: boolean = false
  // let usage: TrackableUsageResponse | undefined = undefined
  // let counts: GeneralCountsResponse = {
  //   totalNotes: 0,
  //   totalDatapoints: 0,
  //   totalLogs: 0,
  // }
  // let locationDetails: Array<LocationExtractionType> = []
  // let positivity: IPositivityResults = { negative: 0, neutral: 0, positive: 0 }
  // let positivityPercentages: IPositivityResults = { negative: 0, neutral: 0, positive: 0 }
  // let timeGroup: TimeGroupType = 'day'
  // let trackablePositivity: TrackablePositivityResponse

  // const getData = async () => {
  //   results = await LedgerStore.query({ start: startDate, end: endDate })
  //   counts = await getGeneralUsageCounts(results)
  //   usage = getTrackablesUsage(results)
  //   positivity = positivityFromLogs(results, $TrackerStore.trackers)
  //   trackablePositivity = getTrackablePositivityUsage(results)
  //   const averaged: Array<number> = math.percentile([positivity.negative, positivity.neutral, positivity.positive])

  //   // const trackableUsage = logsToTrackableUsage(results, $TrackableStore.trackables)

  //   positivityPercentages = { negative: averaged[0], neutral: averaged[1], positive: averaged[2] }
  //   locationDetails = extractLocations(results)
  //   loaded = true
  // }

  // let topTen: Array<TrackableUsageType> = []
  // let bottomTen: Array<TrackableUsageType> = []

  // let mostPositive: Array<any> = []
  // let leastPositive: Array<any> = []

  // $: if (usage) {
  //   topTen = usage.elements.filter((element, index) => index < 6)
  //   bottomTen = usage.elements.reverse().filter((element, index) => index < 6)
  //   mostPositive = trackablePositivity.positive
  //     .filter((v, index) => index < 6)
  //     .map((v) => {
  //       return {
  //         trackable: v.trackable,
  //         values: [],
  //       }
  //     })
  //   leastPositive = trackablePositivity.negative
  //     .filter((v, index) => index < 6)
  //     .map((v) => {
  //       return {
  //         trackable: v.trackable,
  //         values: [],
  //       }
  //     })
  // }

  // $: trackables = $TrackableStore.trackables

  // const showElementOptions = (trackable: Trackable) => {
  //   showTrackablePopmenu(trackable)
  // }

  // $: if (endDate || timeGroup) {
  //   loaded = false
  //   getData()
  // }

  // const calculateElementTotals = (tusage: TrackableUsageType) => {
  //   const trackable: Trackable = tokenToTrackable(tusage.token, trackables)
  //   if (trackable && trackable.tracker) {
  //     return trackable.tracker.displayValues(tusage.values)
  //   }
  //   return undefined
  // }

  // let trackableUsageView: 'usage' | 'positivity' = 'usage'
  // let trackableUsageViewButtons = [
  //   {
  //     label: 'Usage',
  //     value: 'usage',
  //   },
  //   {
  //     label: 'Positivity',
  //     value: 'positivity',
  //   },
  // ]
</script>

<main class="p-4 analytics-view">
  <!-- <section class="grid grid-cols-1 lg:grid-cols-4 gap-4">
    <AnalyticsUsageChart
      {results}
      loading={!loaded}
      className="lg:col-span-2 xl:col-span-3 h-96 lg:h-auto"
      bodyClass="p-4 flex-grow flex-shrink"
      cardTitle={Lang.t('general.usage', 'Usage')}
    />

    <Card className="lg:col-span-2 xl:col-span-1" bodyClass="p-4 flex-grow flex-shrink" title="What">
      <Toolbar slot="header">
        <ButtonGroup buttons={trackableUsageViewButtons} bind:value={trackableUsageView} />
      </Toolbar>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          {#if trackableUsageView === 'usage'}
            <h1 class="font-bold mb-2">Most Tracked</h1>
          {:else if trackableUsageView === 'positivity'}
            <h1 class="font-bold mb-2">Most Positive</h1>
          {/if}
          {#each trackableUsageView === 'usage' ? topTen : mostPositive as element}
            <TrackablePill
              on:click={() => {
                showElementOptions(element.element)
              }}
              value={trackableUsageView === 'usage' ? calculateElementTotals(element) : undefined}
              className="w-full"
              size={36}
              trackable={element.trackables}
            />
          {/each}
        </div>
        <div class="space-y-2">
          {#if trackableUsageView === 'usage'}
            <h1 class="font-bold mb-2">Least Tracked</h1>
          {:else if trackableUsageView === 'positivity'}
            <h1 class="font-bold mb-2">Least Positive</h1>
          {/if}
          {#each trackableUsageView === 'usage' ? bottomTen : leastPositive as element}
            <TrackablePill
              on:click={() => showElementOptions(element.element)}
              value={trackableUsageView === 'usage' ? calculateElementTotals(element) : undefined}
              className="w-full"
              size={36}
              trackable={element.trackable}
            />
          {/each}
        </div>
      </div>
    </Card>

    <Card title="How much you've created" className="col-span-1" bodyClass="">
      <div class="px-4 pb-4">
        Total Logs: {counts.totalLogs}<br />
        Total Longer Notes: {counts.totalNotes}<br />
        Datapoints: {counts.totalDatapoints}<br />
      </div>
    </Card>

    <Card title="When you use Nomie" className="col-span-1" bodyClass="px-2 pb-4">
      {#if usage}
        <DayOfWeek color={appConfig.primary_color} statsDow={usage.dayOfWeek} height={100} />
        <TimeOfDay color={appConfig.primary_color} statsTod={usage.timeOfDay} height={100} />
      {:else}
        <div class="flex w-full items-center justify-center h-40">
          <Spinner size={30} />
        </div>
      {/if}
    </Card>

    <Card title="Overall Positivity" bodyClass="px-4 pb-4 h-auto flex-grow flex items-center justify-center">
      {#if loaded}
        <div style="max-height:250px;">
          <Pie
            data={[
              { label: 'Negative', value: positivityPercentages.negative, color: appConfig.red_color },
              { label: 'Neutral', value: positivityPercentages.neutral, color: appConfig.primary_color },
              { label: 'Positive', value: positivityPercentages.positive, color: appConfig.green_color },
            ]}
          />
        </div>
      {:else}
        <div class="flex w-full items-center justify-center h-40">
          <Spinner size={30} />
        </div>
      {/if}
    </Card>
    <Card>
      {#if loaded}
        <Map
          records={locationDetails.map((ld) => {
            return new NLog({ lat: ld.lat, lng: ld.lng, note: 'Hi there!' })
          })}
        />
      {:else}
        <div class="flex w-full items-center justify-center h-40">
          <Spinner size={30} />
        </div>
      {/if}
    </Card>
  </section> -->
</main>

<style lang="postcss" global>
  .analytics-view h2 {
    @apply text-lg font-bold text-gray-500;
  }
</style>
