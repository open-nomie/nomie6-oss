<svelte:options runes={true} />

<script lang="ts">
  import _ from "lodash"
  import dayjs from 'dayjs'
  import type { ChartConfiguration, ChartDataset } from 'chart.js'
  import type { Dayjs } from 'dayjs'
  import usageStats from "./usage-stats";
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
  import { saveChartOptions, getChartOption, ChartOptionsStore } from './ChartOptionsStore'
  import type { WidgetClass } from '../dashboard2/widget/widget-class'

  import type { TrackableUsage } from './trackable-usage.class'
  import { openDateOptionPopMenu, openPopMenu, type PopMenuButton } from '../../components/pop-menu/usePopmenu'
  import CloseOutline from '../../n-icons/CloseOutline.svelte'
  import { getContextOn } from '../context/context-utils'
  import { Prefs } from '../preferences/Preferences'

  const { usages = [], style = '', className = '', type = 'bar', hideLabels = false, hideValues = false, id, stacked = false, isstatsview = false, showcontext = false, dualAxis = false, widget } = $props<{
    usages?: Array<TrackableUsage>
    style?: string
    className?: string
    type?: 'bar' | 'line'
    hideLabels?: boolean
    hideValues?: boolean
    id: string
    stacked?: boolean
    isstatsview?: boolean
    showcontext?: boolean
    dualAxis?: boolean
    widget?: WidgetClass
  }>()

  let dateFormats = $state(getDateFormats())
  let usage = $state<TrackableUsage | undefined>(undefined)
  let reverseUsage = $state<TrackableUsage | undefined>(undefined)

  let activeDate = $state<Dayjs | undefined>(undefined)
  let activeFormatedValue = $state<string | undefined>(undefined)
  let contextannotation = $state({})
  let theme = $state($Prefs.theme)
  let labelcolor = $state($Prefs.theme === 'dark' ? '#ffffff' : '#000000')

  $effect(() => {
    if (usages && usages.length) {
      usage = usages[0].backfill()
    }
  })

  $effect(async () => {
    // Subscribe to ChartOptionsStore updates so we reload when options change on other devices
    $ChartOptionsStore
    await initChartOptions()
  })

  interface ContextMapWrapper {
    usage: TrackableUsage
    startDate: Date
    endDate: Date
    startIndex: number
    endIndex: number
    value: number
  }

  interface ContextTrackableUsage {
    trackable: Trackable
    marks: Array<ContextMapWrapper>
  }

  let localType = $state<'bar' | 'line'>(type)
  let showChart = $state(true)
  let chartScale = $state<'linear' | 'logarithmic'>('linear')
  let chartStats = $state<'none' | "avg" | 'sma-7' | 'sma-15' | 'sma-30' | 'ema-7' | 'ema-15' | 'ema-30' | 'split-11' | 'split-12' | 'split-13' | 'cumm'>('none')
  let startWithZero = $state(true)
  let ignoreZero = $state(true)
  let showContext = $state(false)
  let includeAlso = $state<Trackable | undefined>(undefined)
  let includeAlsoLabel = $state("None")

  const setChartType = async (type, swz, iz,stats, include, showcontext,save: boolean = true) => {
    showChart = false
    localType = type
    startWithZero = swz
    ignoreZero = iz
    showContext = showcontext
    chartStats = stats
    includeAlso = include
    if (save) {
      await saveChartOptions(id, { type, startWithZero, ignoreZero, stats, include, showContext})
    }
    await wait(60)
    await alsoInclude()
    await wait(60)
    await includeStats()
    await includeContext()
    showChart = true
  }

  const initChartOptions = async () => {
    let options: any = getChartOption(id) || {}

    let t = (options.type || type) == 'line' ? 'line' : 'bar'
    let swz = options.startWithZero === undefined || options.startWithZero === false ? false : true
    let iz = options.ignoreZero === undefined || options.ignoreZero === false ? false : true
    let st = options.stats || 'none'
    let showcontext = options.showContext

    // Convert trackable ID back to Trackable object
    let incl = undefined
    if (options.include && typeof options.include === 'string') {
      incl = $TrackableStore.trackables[options.include]
    }

    setChartType(t, swz, iz,st, incl, showcontext, false)
  }

  const alsoInclude = async (newtrackable: boolean = false) => {
    if (!isstatsview){
    //remove current also included trackable
    for (var i = 0; i < usages.length; i++) {
      if (usages.length >1) {
        usages.splice(_.findIndex(usages, function(item) {
        return item.trackable.id === "-alsoinclude-";
        }), 1);
      }
    }}

    var selected:Trackable
    if (newtrackable == true) {
      selected = await selectTrackable()
      includeAlso = selected}
    else if (isstatsview == true){
      if (usages.length >1){
        selected = $TrackableStore.trackables[usages[1].trackable.id]
      }
      //selected = $TrackableStore.trackables["#coffee"]
    }  
    else {selected = includeAlso}
    if (selected != undefined) {
      includeAlsoLabel = selected.id
      const temp = $TrackableStore.trackables[selected.id] 
      selected = temp
      const usage :TrackableUsage = await queryToTrackableUsage(
      selected,
      {
        start: usages[0].dates[0],
        end: usages[0].dates[usages[0].dates.length - 1],
      },
      $TrackableStore.trackables
      )
      usage.trackable.id = "-alsoinclude-"
      if (usages[0].groupedBy == "week") {
        reverseUsage = usage
          .reverse()
          .groupBy('week', 'YYYY-MM-D')
          .backfill(usages[0].dates[0].toDate(), usages[0].dates[usages[0].dates.length - 1].toDate())
      } 
      else {
        reverseUsage = usage
          .reverse()
          .byDay.backfill(usages[0].dates[0].toDate(), usages[0].dates[usages[0].dates.length - 1].toDate())
      }
      // below is a strange bug => when array length =1 I need to push twice and slice again the last one. To be investigated
      if (usages.length == 1) {
        usages.push(reverseUsage)
        usages.push(reverseUsage)
        //usages.push(reverseUsage)
        usages.slice(0, -1)
      }
      else {usages.push(reverseUsage)}

      return usage
    }
    else {
      return null
    }
  }

  const includeContext = async () => {
    if (showContext) {
    let maxvalue = 0;
    let minvalue = undefined;

    // Use only the primary tracker's (first tracker's) scale for context positioning
    // This ensures context aligns correctly with the tracker's visual scale in dual-axis mode
    const primaryUsage = usages[0]
    if (primaryUsage) {
      for (var value of primaryUsage.values) {
       if (value > maxvalue) { maxvalue = value}
       if (minvalue == undefined || value < minvalue) {minvalue = value}
    }
    }

    let start: Date   //for now static, must make dynamic
    let end: Date  //for now static, must make dynamic
    let date = new Date()
    let contextItems: Array<TrackableUsage> = []
    let contextMap: Array<ContextTrackableUsage> = []
    //start = dayjs(date).subtract(90, 'day').toDate()
    //end = dayjs(date).add(30, 'day').toDate()
    start = dayjs(usages[0].dates[0]).toDate()
    end = dayjs(usages[0].dates[usages[0].dates.length-1]).toDate()
    


    const trackables = $TrackableStore.trackables
    const frameStart = dayjs(start)
    const frameEnd = dayjs(end)

    const res: any = await getContextOn(date, trackables,start,end)

    contextItems = res
      ? Object.keys(res).map((id: string) => {
          return res[id]
        })
      : []

    const final: Array<ContextTrackableUsage> = []
    // Loop over context items  (1 per trackable)
    contextItems.forEach((contextUsage: TrackableUsage) => {
      const node: ContextTrackableUsage = {
        trackable: contextUsage.trackable,
        marks: [],
      }
      const trackable = contextUsage.trackable
      ;(contextUsage.dates || []).forEach((loopDate, index) => {
        // Get Reverb Days
        let parsedValue =
          trackable.ctx.duration > trackable.value ? trackable.ctx.duration : trackable.value || trackable.ctx.duration

        let contextItem: ContextMapWrapper = {
          startDate: loopDate.toDate(),
          usage: contextUsage,
          endDate: dayjs(loopDate)
            .add(parsedValue || 1)
            .toDate(),
          startIndex: dayjs(loopDate).diff(frameStart, 'day'),
          endIndex: frameEnd.diff(dayjs(loopDate), 'day'),
          value: parsedValue,
        }
        node.marks.push(contextItem)
      })
      final.push(node)
    })

    contextMap = final.sort((a, b) => {
      const avalue = a.marks[0].endDate.getTime() + a.marks[0].value
      const bvalue = b.marks[0].endDate.getTime() + b.marks[0].value
      return avalue < bvalue ? 1 : -1
    })
    contextannotation["annotations"] = {}
    for (var context of contextMap) {
    

    const xstart = context.marks[0].startIndex;
    var xend = 0;
    if (context.trackable.id.startsWith("+")) {
      xend = xstart+context.trackable.ctx.duration;
    }
    else { xend = xstart+context.trackable.value;}
    let minimum = 0;
    if (startWithZero) { minimum =0}
    else {minimum = minvalue}
    // Use context color if available, fallback to a default blue color
    const contextColor = context.trackable.ctx.color || '#04A6F9';
    contextannotation.annotations[context.trackable.ctx.label] = {
          drawTime: 'beforeDatasetsDraw',
          type: 'box',
          xMin: xstart,
          xMax: xend,
          yMin: minimum*0.78,
          yMax: maxvalue*1.1,
          backgroundColor: contextColor+'70',
          borderColor: contextColor+'80',
          borderRadius: 5,
        }
    contextannotation.annotations['label_'+context.trackable.ctx.label] = {
          drawTime: 'beforeDatasetsDraw',
          type: 'label',
          xValue: xstart,
          yValue: maxvalue,
          backgroundColor: 'transparent',
          content: [context.trackable.ctx.label],
          font: {
            size: 11},
          color: labelcolor,
          xAdjust: Math.floor((context.trackable.ctx.label.length)*3),
    }  
    
    
  }
}
else {contextannotation.annotations ={}}
}

  const includeStats = async () => {
    // do not execute when in statsmode
    if (isstatsview) {
      chartStats = "none"
    }
    //remove current stats data if exist
    if (usages.length > 1) {
        const statsIndex = _.findIndex(usages, function(item) {
        return item.trackable.id === "-statistics-";
        })
        if (statsIndex >= 0) {
          usages.splice(statsIndex, 1);
        }
    }
    //define new if applicable
    var statusage = usages.find(x=>x!==undefined);
    if (chartStats != "none") {
      if ((chartStats == "cumm" && statusage.trackable.tracker.math == "sum") || chartStats != "cumm") {
        let datasetMain = statusage.values;
        let statsTrackable = usageStats.defineStatsDataset(
          datasetMain,
          chartStats,
          statusage.trackable.tracker.math,
          usages[0]
        );
        usages.push(statsTrackable)
      }
    }
  }

  export const showOptionsMenu = async (caller: HTMLElement) => {
    const buttons = [
      {
        title: Lang.t('general.line-chart', 'Line Chart'),
        icon: localType === 'line' ? CheckmarkCircle : undefined,
        click() {
          setChartType('line', startWithZero, ignoreZero,chartStats, includeAlso, showContext)
        },
      },
      {
        title: Lang.t('general.bar-chart', 'Bar Chart'),
        icon: localType === 'bar' ? CheckmarkCircle : undefined,
        click() {
          setChartType('bar', startWithZero, ignoreZero,chartStats, includeAlso,showContext)
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
        title: `Stats: ${chartStats}`,
        divider: true,
        click() {
          const buttons: Array<PopMenuButton> = [
            {
              id: 'none',
              title: 'No Stats',
              checked: chartStats === 'none',
              async click() {
                chartStats = 'none'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'avg',
              title: 'Average',
              checked: chartStats === 'avg',
              async click() {
                chartStats = 'avg'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'split-11',
              title: 'Average Split(50%-50%)',
              checked: chartStats === 'split-11',
              async click() {
                chartStats = 'split-11'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'split-12',
              title: 'Average Split(33%-66%)',
              checked: chartStats === 'split-12',
              async click() {
                chartStats = 'split-12'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'split-13',
              title: 'Average Split(25%-75%)',
              checked: chartStats === 'split-13',
              async click() {
                chartStats = 'split-13'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'sma-7',
              title: '7 days Simple Moving Average',
              checked: chartStats === 'sma-7',
              async click() {
                chartStats = 'sma-7'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'sma-15',
              title: '15 days Simple Moving Average',
              checked: chartStats === 'sma-15',
              async click() {
                chartStats = 'sma-15'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'sma-30',
              title: '30 days Simple Moving Average',
              checked: chartStats === 'sma-30',
              async click() {
                chartStats = 'sma-30'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'ema-7',
              title: '7 days Exponential Moving Average',
              checked: chartStats === 'ema-7',
              async click() {
                chartStats = 'ema-7'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'ema-15',
              title: '15 days Exponential Moving Average',
              checked: chartStats === 'ema-15',
              async click() {
                chartStats = 'ema-15'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'ema-30',
              title: '30 days Exponential Moving Average',
              checked: chartStats === 'ema-30',
              async click() {
                chartStats = 'ema-30'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'cumm',
              title: 'Cummulative trend',
              checked: chartStats === 'cumm',
              async click() {
                chartStats = 'cumm'
                await wait(10)
                await includeStats()
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },

          ]
          openPopMenu({ id: 'chart-stats', buttons })
        },
      },
      {
        title: Lang.t('general.start-with-zero', 'Start with Zero'),
        icon: startWithZero ? CheckmarkCircle : undefined,
        divider: true,
        click() {
          startWithZero = !startWithZero
          setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
        },
      },
      {
        title: Lang.t('general.ignore-zero', 'Ignore Zero'),
        icon: ignoreZero ? CheckmarkCircle : undefined,
        divider: true,
        click() {
          ignoreZero = !ignoreZero
          setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
          
        },
      },
      {
        title: 'Show Context',
        icon: showContext ? CheckmarkCircle : undefined,
        divider: true,
        click() {
          showContext = !showContext
          setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
        },
      },
      {
        title: `Include: ${includeAlsoLabel}`,
        divider: true,
        click() {
          const buttons: Array<PopMenuButton> = [
            {
              id: 'none',
              title: 'No Other Trackable',
              checked: includeAlsoLabel === 'None',
              async click() {
                includeAlso = undefined
                includeAlsoLabel = "None"
                await alsoInclude(false)
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
            {
              id: 'trackable',
              title: 'Select Trackable',
              checked: includeAlsoLabel != 'None',
              async click() {
                //await wait(10)
                await alsoInclude(true)
                setChartType(localType, startWithZero, ignoreZero,chartStats, includeAlso,showContext)
              },
            },
          ]
          openPopMenu({ id: 'also-include', buttons })
        },
      },
    ]
    if (isstatsview){
      buttons.splice(3, 1)
      buttons.splice(4, 1)
    }
    openDropMenu(caller, buttons)
  }

  const usageToDataset = (_usage: TrackableUsage): ChartDataset => {
    const usageByDay = _usage
    const dates = usageByDay.dates
    const values = usageByDay.values
    let valuestemp =[]
    if (ignoreZero){
    for (var j = 0; j < values.length; j++) {
        if (values[j] == 0) {
            valuestemp[j] = NaN;
        }
        else {valuestemp[j] = values[j];}
    }}
    else {valuestemp = values}
    
    const data = dates.map((date, index) => {
      return valuestemp[index]
    })
    let dataset: ChartDataset = {
      label: usageByDay.trackable.label,
      data,
    }

    // some visual adjustments if dataset is statistics dataset
    var lineweight = 1.5;
    var dotsweight = 1;
    if (usageByDay.trackable.id === "-statistics-"){
      lineweight = 2.5
      dotsweight = 0
    }

    const skipped = (ctx, value) => (ctx.p0.skip || ctx.p1.skip ? value : undefined)

    // Setup Line of Bar differences
    if (localType === 'line' || usageByDay.trackable.id === "-statistics-") {
      //@ts-ignore
      dataset = {
        ...dataset,
        ...{
          type: "line",
          pointRadius: dotsweight,
          pointHitRadius: 10,
          borderColor: usageByDay.trackable.color,

          spanGaps: true,
          borderWidth: lineweight,
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
          type: "bar",
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
    const datasets = usages.map((usage, index) => {
      const dataset = usageToDataset(usage)
      // Map secondary tracker to right axis if in dual-axis mode
      // Only put "-alsoinclude-" (secondary tracker) on y1, not statistics
      if (dualAxis && usage.trackable?.id === '-alsoinclude-') {
        dataset.yAxisID = 'y1'
      } else {
        dataset.yAxisID = 'y'
      }
      return dataset
    })

    // Setup scales configuration
    const scales: any = {
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
    }

    // Add second y-axis if in dual-axis mode
    if (dualAxis && usages.length > 1) {
      scales.y1 = {
        position: 'right',
        stacked: stacked,
        display: !hideValues,
        beginAtZero: startWithZero,
        type: chartScale,
        ticks: {
          font: {
            size: 10,
          },
          callback: function (value: any, index, ticks) {
            return usages[1].trackable.formatValue(value)
          },
        },
      }
    }

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
                const datasetIndex = tooltipItem.datasetIndex
                const trackable = usages[datasetIndex]?.trackable || usage.trackable
                return trackable.formatValue(parseNumber(`${tooltipItem.raw}`))
              },
            },
          },
          annotation: contextannotation,
        },
        layout: {
          padding: 6,
        },
        responsive: true,
        maintainAspectRatio: false,

        scales: scales,
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
