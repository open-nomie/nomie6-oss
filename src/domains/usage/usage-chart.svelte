<script lang="ts">
  import type { ChartConfiguration, ChartDataset } from 'chart.js'
  import type { Dayjs } from 'dayjs'
  import { onMount } from 'svelte'

  import Chartjs from '../../components/charts/chartjs.svelte'
  import { openDropMenu } from '../../components/menu/useDropmenu'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CheckmarkCircle, OptionsOutline } from '../../components/icon/nicons'
  import Spinner from '../../components/spinner/spinner.svelte'
  import { hex2rgba } from '../../modules/colors/colors'
  import { Lang } from '../../store/lang'

  import { parseNumber } from '../../utils/parseNumber/parseNumber'
  import { wait } from '../../utils/tick/tick'

  import { queryToTrackableUsage } from '../ledger/LedgerStore'
  import { getDateFormats } from '../preferences/Preferences'
  import { selectTrackable } from '../trackable/trackable-selector/TrackableSelectorStore'

  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { saveChartOptions, getChartOption } from './ChartOptionsStore'

  import type { TrackableUsage } from './trackable-usage.class'
  import { openDateOptionPopMenu, openPopMenu, PopMenuButton } from '../../components/pop-menu/usePopmenu'
import Badge from '../../components/badge/badge.svelte'
import CloseOutline from '../../n-icons/CloseOutline.svelte'

  export let usages: Array<TrackableUsage> = []
  export let style: string = ''
  export let className: string = ''
  export let type: 'bar' | 'line' = 'bar'
  export let hideLabels: boolean = false
  export let hideValues: boolean = false

  export let id: string
  export let stacked: boolean = false

  let dateFormats = getDateFormats()
  let usage: TrackableUsage

  let activeDate: Dayjs | undefined = undefined
  let activeFormatedValue: string

  $: if (usages && usages.length) {
    usage = usages[0].backfill()
  }

  onMount(() => {
    initChartOptions()
  })

  let localType: 'bar' | 'line' = type
  let showChart: boolean = true
  let chartScale: 'linear' | 'logarithmic' = 'linear'

  let startWithZero: boolean = true

  const setChartType = async (type, swz, save: boolean = true) => {
    showChart = false
    localType = type
    startWithZero = swz
    if (save) {
      saveChartOptions(id, { type, startWithZero })
    }
    await wait(60)
    showChart = true
  }

  const initChartOptions = () => {
    let options: any = getChartOption(id) || {}

    let t = (options.type || type) == 'line' ? 'line' : 'bar'
    let swz = options.startWithZero === undefined || options.startWithZero === false ? false : true
    setChartType(t, swz, false)
  }

  const alsoInclude = async () => {
    const selected: Trackable = await selectTrackable()
    const usage = await queryToTrackableUsage(
      selected,
      {
        start: usages[0].dates[0],
        end: usages[0].dates[usages[0].dates.length - 1],
      },
      $TrackableStore.trackables
    )
    usages.push(usage)

    return usage
  }

  export const showOptionsMenu = async (caller: HTMLElement) => {
    const buttons = [
      {
        title: Lang.t('general.line-chart', 'Line Chart'),
        icon: localType === 'line' ? CheckmarkCircle : undefined,
        click() {
          setChartType('line', startWithZero)
        },
      },
      {
        title: Lang.t('general.bar-chart', 'Bar Chart'),
        icon: localType === 'bar' ? CheckmarkCircle : undefined,
        click() {
          setChartType('bar', startWithZero)
        },
      },
      {
        title: `Scale: ${chartScale}`,
        divider: true,
        click() {
          const buttons: Array<PopMenuButton> = [
            {
              id: 'linear',
              title: 'Linear Scale',
              checked: chartScale === 'linear',
              click() {
                chartScale = 'linear'
                initChartOptions()
              },
            },
            {
              id: 'log',
              title: 'Log Scale',
              checked: chartScale === 'logarithmic',
              click() {
                chartScale = 'logarithmic'
                initChartOptions()
              },
            },
          ]
          openPopMenu({ id: 'chart-scale', buttons })
        },
      },
      {
        title: Lang.t('general.start-with-zero', 'Start with Zero'),
        icon: startWithZero ? CheckmarkCircle : undefined,
        divider: true,
        click() {
          startWithZero = !startWithZero
          setChartType(localType, startWithZero)
        },
      },
      {
        title: Lang.t('general.also-include', 'Also Include...'),
        icon: usages.length > 1 ? CheckmarkCircle : undefined,
        async click() {
          await wait(10)
          await alsoInclude()
          setChartType(localType, startWithZero)
        },
      },
    ]
    openDropMenu(caller, buttons)
  }

  const usageToDataset = (_usage: TrackableUsage): ChartDataset => {
    const usageByDay = _usage
    // Generate the Chart Data
    const dates = usageByDay.dates
    const values = usageByDay.values

    const data = dates.map((date, index) => {
      return values[index]
    })

    let dataset: ChartDataset = {
      type: localType,
      label: usageByDay.trackable.label,
      data,
    }

    const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined)

    // Setup Line of Bar differences
    if (localType === 'line') {
      //@ts-ignore
      dataset = {
        ...dataset,
        ...{
          pointRadius: 1,
          pointHitRadius: 10,
          borderColor: usageByDay.trackable.color,

          spanGaps: true,
          borderWidth: 1.5,
          backgroundColor: hex2rgba(usageByDay.trackable.color, 0.1),
          fill: 'origin',
          segment: {
            borderColor: (ctx) => skipped(ctx, 'rgb(140,140,140,0.5)'),
            borderDash: (ctx) => skipped(ctx, [2, 2]),
          },
          tension: 0.4,
        },
      }
    } else {
      dataset = {
        ...dataset,
        ...{
          backgroundColor: usageByDay.trackable.color,
          barPercentage: 0.9,
          borderRadius: 100,
          minBarLength: 10,
        },
      }
    }

    return dataset
  }

  const generateChartConfig = (): ChartConfiguration => {
    // Get usage by day and backfill it
    const datasets = usages.map((usage) => {
      return usageToDataset(usage)
    })

    // Setup Config
    const config: ChartConfiguration = {
      type: localType,

      options: {
        animation: false,
        elements: {
          bar: {
            borderRadius: 100,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return usage.trackable.formatValue(parseNumber(`${tooltipItem.raw}`))
              },
            },
          },
        },
        layout: {
          padding: 6,
        },
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          x: {
            display: !hideLabels,
            ticks: {
              autoSkip: true,
              maxRotation: 0,
              font: {
                size: 10,
              },
            },
          },
          y: {
            stacked: stacked,
            display: !hideValues,
            beginAtZero: startWithZero,
            type: chartScale,
            ticks: {
              font: {
                size: 10,
              },
              callback: function (value: any, index, ticks) {
                return usage.trackable.formatValue(value)
              },
            },
          },
        },
      },
      data: {
        labels: usages[0].dates.map((d) => d.format(dateFormats.tinyNumber)),
        datasets: datasets,
      },
    }

    return config
  }

  const itemClicked = (index: number) => {
    if(index) {
      activeDate = usage.dates[index]
      activeFormatedValue = usage.trackable.formatValue(usage.values[index])
    } else {
      activeDate = undefined;
    }
  }

  // const openAroundThisDay = () => {
  //   let focal: ATTFocalUnit = 'day'
  //   if (usages[0].groupedBy === 'month') focal = 'month'
  //   if (usages[0].groupedBy === 'week') focal = 'week'
  //   openTrendingModal(activeDate.toDate(), focal)
  // }
</script>

{#if usage}
  <div {id} class="usage-chart pt-2 {className}" style="min-height:120px; {style}">
    {#if activeDate}
      <div  class="active-date-holder z-40 flex items-center space-x-2 justify-center px-4 text-center absolute top-1 left-0 right-0">
        <button class="flex items-center" on:click={() => openDateOptionPopMenu(activeDate.toDate())}>
          <div style="font-size:0.7rem;" class=" line-clamp-1 py-px px-2 rounded-md bg-gray-200 dark:bg-gray-800 text-black dark:text-white">
            <span class="lg:hidden">
              {activeDate.format(dateFormats.tinyDate)}
            </span>
            <span class="hidden lg:block">
              {activeDate.format(dateFormats.dateDay)}
            </span>
          </div>
          <div class="font-extrabold ml-2" style="font-size:0.8rem; color:{usage?.trackable?.color}">{activeFormatedValue}</div>
        </button>
        <button 
          on:click={()=>{
            itemClicked(undefined);
          }}
          class="flex items-center justify-center text-sm text-black dark:text-white"><IonIcon size={12} icon={CloseOutline} /></button>
      </div>
    {/if}
    {#if showChart}
      <Chartjs
        on:click={(evt) => {
          itemClicked(evt.detail)
        }}
        id="chart-{id}"
        chartjsPayload={generateChartConfig()}
      />
    {/if}
    <div class="usage-chart-tools flex items-center space-x-2 absolute top-0 left-3 justify-between right-1">
      
      <div class="filler" />
      <button
        class="chart-config-button px-1"
        on:click|stopPropagation|preventDefault={(evt) => {
          //@ts-ignore
          showOptionsMenu(evt.target)
        }}
      >
        <IonIcon size={14} icon={OptionsOutline} className="text-gray-800 dark:text-gray-200" />
      </button>
    </div>
  </div>
{:else}
  <div class="loading-box"><Spinner size={32} /></div>
{/if}
