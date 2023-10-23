<script lang="ts">
  import dayjs from 'dayjs'
  import { onMount } from 'svelte'
  import Empty from '../../components/empty/empty.svelte'
  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { wait } from '../../utils/tick/tick'

  import type { TrackableUsage, TrackableUsageMap } from '../usage/trackable-usage.class'

  import math from '../../utils/math/math'
  import { showTrackablePopmenu } from '../board/boardActions'

  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  import logsToTrackableUsage from '../usage/usage-utils'

  import ProgressBar from '../../components/progress-bar/progress-bar.svelte'

  

  import UsageChart from '../usage/usage-chart.svelte'
  

  import Spinner from '../../components/spinner/spinner.svelte'

  

  import RelatedWorker from './related-worker?worker'
  import { BarChartOutline } from '../../components/icon/nicons'
  import BarChartSolid from '../../n-icons/BarChartSolid.svelte'
  

  export let className: string = ''
  export let style: string = ''

  // export let id: string

  export let trackable: Trackable

  let usagesForChart: Array<TrackableUsage> = []
  // let allowed: boolean = true

  let mounted = false
  let loading: boolean = false
  let results: Array<{
    trackable: Trackable
    score: number
    percent: number
    usage: TrackableUsage
  }> = []

  let lastTrackable: Trackable
  let selfUsage: TrackableUsage // this gets normalized
  let originalSelfUsage: TrackableUsage // lets keep this one untouched

  // How Far Back should we look?
  let START_DATE = dayjs().subtract(1.5, 'month')

  /**
   * When Mounted and Ready
   */
  $: if (mounted && lastTrackable !== trackable) {
    lastTrackable = trackable
    main()
  }

  type scoreType = {
    score: number
    percent: number
    negative: boolean
    trackable: Trackable
    usage: TrackableUsage
  }
  // type ScoreMapType = {
  //   [key: string]: scoreType
  // }

  /**
   * Holder of the Scores
   */
  // let scores: ScoreMapType = {}

  /**
   * React to when scores changes -
   * this way we can do it in chunks
   * and have the UI responde for slower
   * devices
   */
  const scoresToResults = (scores) => {
    
    // Get the Max from all the Scores
    const scoresArray = Object.keys(scores).map((d) => scores[d].score)
    let max = math.max(scoresArray)
    let min = math.min(scoresArray)

    // Loop Over the Keys and get the percentage
    Object.keys(scores).map((tag, index) => {
      let score = scores[tag].score
      if (score > 0) {
        scores[tag].percent = math.percentage(max, score)
      } else if (score < 0) {
        scores[tag].percent = math.percentage(max, -score)
      }
    })

    // Create Results mpa from the scores
    results = Object.keys(scores)
      .map((tag) => {
        return scores[tag]
      })
      .sort((a: any, b: any) => {
        return a.score < b.score ? 1 : -1
      })
      .filter((a: any) => {
        if (a.score > 0) {
          return math.percentage(max, a.score) > 50
        } else if (a.score < 0) {
          return math.percentage(min, a.score) > 50
        } else {
          return false
        }
        // if (a.score > 0.1) {
        //   // remove low
        //   return true
        // } else if (a.score < -0.1) {
        //   // remove low
        //   return true
        // } else {
        //   return false
        // }
        // return true
      })
    
  }

  let usages: TrackableUsageMap

  /**
   * Main Find the Correlates
   */
  async function main() {
    loading = true
    // Clear Results
    results = []

    // Get All Trackables
    const trackables = $TrackableStore.trackables

    // Query
    const logs = await LedgerStore.query({
      start: START_DATE,
      end: dayjs(new Date()),
    })

    // Convert to TrackableUsagesMap
    usages = logsToTrackableUsage(logs, { trackables: trackables })

    // Let's remove anything with less than 7 values
    Object.keys(usages).map((tag: string) => {
      let usage = usages[tag]
      if (usage.values.length < 7) {
        delete usages[tag]
      }
    })

    // Prepare a Score Map

    // const workerResponse = await findRelatedUsage(trackable.tag, usages)

    try {
      /**
       * Get base Trackable
       * Backfill by Day
       */

      // START_DATE = usages[trackable.tag].dates[usages[trackable.tag].dates.length - 1]

      /**
       * Get the Self Usage
       * And usage Count of this comparing Trackable
       */
      let selfUsageCount = usages[trackable.tag]?.values.filter((s) => !isNaN(s)).length
      if (selfUsageCount) {
        originalSelfUsage = usages[trackable.tag]

        // originalSelfUsage
        selfUsage = normalizeUsage(usages[trackable.tag], originalSelfUsage.firstDate, originalSelfUsage.lastDate)
        addToChart(selfUsage)
      } else {
        loading = false
      }

      const compareSettings = {
        tag: trackable.tag,
        values: selfUsage?.values || [],
        dates: selfUsage?.dates.map((d) => d.toJSON()),
        compareTo: {} as { [key: string]: Array<Number> },
      }

      /**
       * Isolated Function to get the usage data
       * @param trackableTag
       */
      const prepareTrackables = (trackableTag: string): Promise<scoreType | undefined> => {
        const compareUsageCount = usages[trackableTag].values.filter((s) => !isNaN(s)).length
        const compareUsage = usages[trackableTag]
        const diff = math.percentage(selfUsageCount, compareUsageCount)

        // Run the CorrelateUsage on self and this one
        if (trackableTag !== trackable.tag && diff > 20) {
          // Get the Scores from the Correlation Algo

          const normalizedCompare = normalizeUsage(
            compareUsage,
            originalSelfUsage.firstDate,
            originalSelfUsage.lastDate
          )
          compareSettings.compareTo[trackableTag] = normalizedCompare.values
        }
        return undefined
      }

      /**
       * Get Tracker Tags
       */
      const keys = Object.keys(usages)

      /**
       * If we have Self Usage (and we better!)
       * Use it to compare to the other trackables
       */
      if (selfUsage) {
        keys.forEach((tag) => {
          prepareTrackables(tag)
        })

        // await taskQueue.runTasks()

        let relatedWorker = new RelatedWorker()
        relatedWorker.onmessage = (message) => {
          let data = message.data
          let newScoreMap = {}

          data.map((payload: { tag: string; score: any }, i) => {
            let score = payload.score
            // let score = (payload.score.r2 * payload.score.slope) / payload.score.intercept
            newScoreMap[payload.tag] = {
              score: score,
              percent: 0,
              negative: score < 0,
              trackable: usages[payload.tag].trackable,
              usage: usages[payload.tag],
            }
          })
          scoresToResults(newScoreMap)
        }

        relatedWorker.postMessage(compareSettings)
      }
    } catch (e) {
      console.error(e)
      results = []
    }

    loading = false
  }

  const addToChart = (tu: TrackableUsage) => {
    const tuNormalized = tu.byDay.averaged
    usagesForChart.push(tuNormalized)
    usagesForChart = usagesForChart
  }

  const normalizeUsage = (tu: TrackableUsage, start?: Date, end?: Date): TrackableUsage => {
    let startDate = start || START_DATE.toDate()
    let endDate = end || new Date()
    return tu.byDay.backfill(startDate, endDate)
  }

  let chartLoading = false
  const toggleChartItem = async (trackableRes) => {
    chartLoading = true
    if (usagesForChart.find((tu) => tu.trackable.tag === trackableRes.trackable.tag) ? true : false) {
      usagesForChart = usagesForChart.filter((t) => t.trackable.tag !== trackableRes.trackable.tag)
      usagesForChart = usagesForChart
    } else {
      addToChart(trackableRes.usage.byDay.backfill())
    }
    await wait(100)
    chartLoading = false
  }

  onMount(() => {
    loading = true
    mounted = true
  })
</script>

{#key usagesForChart}
  <div
    class="chart sticky dark:bg-gray-900 bg-gray-100 top-0  pb-2 flex items-center justify-center w-full"
    style="min-height:180px;"
  >
    {#if !chartLoading}
      <UsageChart className="w-full h-32" hideValues id="related-chart" usages={usagesForChart} isstatsview={true} />
    {:else}
      <div class="w-full h-32" />
    {/if}
  </div>
{/key}

<div class="compare-view px-2 pt-2 {className}" {style}>
  {#if loading}
    <div class="p-4 text-center text-gray-500 flex items-center space-x-2">
      <Spinner size={26} />
      <span
        >Comparing {Math.abs(results?.length || 0 - Object.keys(usages || {}).length)} of {Object.keys(usages || {})
          .length} ...</span
      >
    </div>
  {/if}

  {#if !results.length && !loading}
    <Empty emoji={'🧢'} title={'Not enough data'} description={`Unable to find enough data to look at relations.`} />
  {/if}

  {#each results as trackableRes, index (trackableRes.trackable.tag)}
    <div class="flex items-center w-full">
      <button
        on:click={() => {
          showTrackablePopmenu(trackableRes.trackable, {
            title: `${trackableRes.trackable.label}`,
          })
        }}
        class="w-full flex flex-col items-center justify-center px-4 py-2"
      >
        <div class="flex items-center justify-center mb-1 w-full">
          <TrackableAvatar trackable={trackableRes.trackable} size={20} />
          <span class="ml-2 w-full line-clamp-1 text-xs font-semibold text-black dark:text-white">{trackableRes.trackable.tag}</span>
          <div class="filler" />
          <span class="text-gray-500 text-sm">{(trackableRes.score * 100).toFixed(1)}</span>
        </div>
        <ProgressBar
          className="w-full h-2 dark:bg-gray-900 bg-gray-200"
          barClass="mx-auto"
          percentage={trackableRes.percent}
          color={trackableRes.score > 0 ? 'green' : 'red'}
        />
      </button>
      {#key usagesForChart}
        <button class="" on:click={() => toggleChartItem(trackableRes)}>
          {#if usagesForChart.find((tu) => tu.trackable.tag === trackableRes.trackable.tag) ? true : false}
            <span class="text-primary-500 fill-current">
              <BarChartSolid />
            </span>
          {:else}
            <span class="text-gray-500 dark:text-gray-500 fill-current">
              <BarChartOutline />
            </span>
          {/if}
        </button>
      {/key}
      <!-- <ToggleSwitch
        title={'Toggle this cart'}
        className="stiff"
        on:change={async (evt) => {
          loading = true
          if (evt.detail === true) {
            addToChart(trackableRes.usage.byDay.backfill())
          } else {
            usagesForChart = usagesForChart.filter((t) => t.trackable.tag !== trackableRes.trackable.tag)
            usagesForChart = usagesForChart
          }
          await wait(10)

          loading = false
        }}
        value={usagesForChart.find((tu) => tu.trackable.tag === trackableRes.trackable.tag) ? true : false}
      /> -->
    </div>
  {/each}
</div>

<!-- <div class="list-note">
  How does this work? Using at least 5 months of data, Nomie will compare this trackable to all others. Using a Sample
  Correlation function, Nomie will calucate a correlation score.
</div> -->
<style global lang="postcss">
  .progress-bar {
    @apply flex;
    @apply w-full;
    @apply justify-start;
  }

  .progress-bar .bar {
    @apply rounded-full;
    @apply flex-grow-0;
    @apply flex-shrink-0;
    @apply justify-start;
    @apply items-center;
    @apply flex;
  }
</style>
