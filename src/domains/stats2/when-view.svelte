<script lang="ts">
  import ChartjsEle from '../../components/charts/chartjs.svelte'
  import TimeGrid from '../../components/day-time-grid/time-grid.svelte'

  import { objectHash } from '../../modules/object-hash/object-hash'
  import { wait } from '../../utils/tick/tick'

  import type NLog from '../nomie-log/nomie-log'
  import { Prefs } from '../preferences/Preferences'
  import DayOfWeek, { IDow } from './day-of-week'
  import type { Trackable } from '../trackable/Trackable.class'
  import type { TrackableUsage } from '../usage/trackable-usage.class'

  export let logs: Array<NLog>
  export let usage: TrackableUsage
  export let trackable: Trackable

  let dayOfWeek: IDow
  let loading: boolean = true

  let logHash = ''
  $: if (objectHash(logs) !== logHash) {
    logHash = objectHash(logs)

    main()
  }

  const getDowChartData = () => {
    return {
      labels: [
        $Prefs.weekStarts == 'sunday' ? 'Sun' : null,
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        $Prefs.weekStarts == 'monday' ? 'Sun' : null,
      ].filter((d) => d),
      datasets: [
        {
          backgroundColor: trackable.color,
          barPercentage: 0.9,
          borderRadius: 100,
          minBarLength: 10,
          data: [
            $Prefs.weekStarts == 'sunday' ? dayOfWeek.sun.percent : null,
            dayOfWeek.mon.percent,
            dayOfWeek.tue.percent,
            dayOfWeek.wed.percent,
            dayOfWeek.thu.percent,
            dayOfWeek.fri.percent,
            dayOfWeek.sat.percent,
            $Prefs.weekStarts == 'monday' ? dayOfWeek.sun.percent : null,
          ].filter((d) => d),
        },
      ],
    }
  }

  let rendering: boolean = false
  const main = async () => {
    if (!rendering) {
      rendering = true
      loading = true

      dayOfWeek = DayOfWeek(logs)
      await wait(10)

      loading = false
      rendering = false
    }
  }
</script>

{#if loading}
  <div class="skeleton-item h-36 bg-white dark:bg-black rounded-lg" />
  <div class="skeleton-item h-48 bg-white dark:bg-black rounded-lg" />
{:else}
  <div class="p-2 h-42 bg-white dark:bg-black rounded-lg shadow-md">
    <h2 class="ntitle mb-4 px-2 pt-2 text-center">{trackable.label} by day of week</h2>
    <div class=" stiff">
      <ChartjsEle
        id="dow"
        chartjsPayload={{
          type: 'bar',
          data: getDowChartData(),
          options: {
            scales: {
              y: {
                //@ts-ignore
                beginAtZero: false,
                type: 'logarithmic',
                ticks: {
                  // maxTicksLimit: 6,
                  display: false,
                },
              },
            },
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        }}
      />
    </div>
  </div>

  <div class="p-2 h-40 overflow-hidden bg-white dark:bg-black rounded-lg shadow-md">
    <h2 class="ntitle mb-4 px-2 pt-2 text-center">{trackable.label} by day and hour</h2>
    <div class="overflow-hidden w-full">
      <TimeGrid {usage} {trackable} className="rounded-lg shadow-md" />
    </div>
  </div>
{/if}
