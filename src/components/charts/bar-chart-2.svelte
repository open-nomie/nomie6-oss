<script type="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  import Chart from 'chart.js/auto'

  import nid from '../../modules/nid/nid'
  import { Interact } from '../../store/interact'
  import ignoreArrayZeros from '../../domains/stats/ignore-zeros'
  import IonIcon from '../icon/ion-icon.svelte'
  import { ChevronForwardOutline, CloseOutline } from '../icon/nicons'
  import { openDateOptionPopMenu } from '../pop-menu/usePopmenu'

  export let labels = []
  export let height = 200

  export let id: string

  export let title = ''
  export let color = '#4d84a1'
  export let points: any
  export let activeIndex = 2
  export let xFormat: Function = (x) => x
  export let yFormat: Function = (y) => y
  export let hideYTicks: boolean = false
  export let hideXTicks: boolean = false
  export let type: string = 'bar'
  // export let beginAtZero: boolean = true;
  export let showSelected: boolean = true
  export let ignoreZero: boolean = false

  // Generate a random ID for this Component
  const chartId = `chart-${nid()}`

  // let showChart = false
  let _canvas
  let theChart
  let lastPoints = []

  export let selected = undefined

  $: if (points && theChart && points.map((p) => p.y).join() !== lastPoints) {
    lastPoints = points.map((p) => p.y).join()
    loadData()
  }

  $: if ($Interact.stats.focused && points) {
    selected = points.find((p) => {
      return p.date.format('YYYY-MM-DD') === $Interact.stats.focused.date.format('YYYY-MM-DD')
    })
  } else if (points && points.length) {
    selected = undefined
  }

  function loadData() {
    const lineStyle = {
      backgroundColor: 'transparent',
      borderColor: color,
    }
    const barStyle = {
      backgroundColor: color,
    }

    theChart.data.labels = labels || points.map((row) => row.x)
    theChart.data.datasets = [
      {
        ...(type == 'line' ? lineStyle : barStyle),
        data: points.map((row) => row.y),
        maxBarThickness: 34,
        minBarLength: 2,
      },
    ]
    let dataset = theChart.data.datasets[0].data

    if (ignoreZero) {
      dataset = ignoreArrayZeros(dataset)
    }

    theChart.data.datasets[0].data = dataset
    theChart.update()
  }

  async function initChart() {
    var ctx = document.getElementById(chartId)
    /**
     * Get Min Point so we can
     * adjust the Y scale min to be just below the min point (if it's greater than 0)
     * if its not greater than zero - then  zero will be the min
     */
    const minPoint: number = Math.min(points.map((p) => p.y))
    // Create chart config
    const chartConfig = {
      type,
      options: {
        tension: 0.6,
        animation: {
          duration: 0, // general animation time
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        tooltips: {
          mode: 'point',
          callbacks: {
            label: function (tooltipItem, data) {
              return yFormat ? yFormat(tooltipItem.value) : tooltipItem.value
            },
          },
        },

        defaultColor: color,
        responsive: true,
        defaultFontSize: 10,
        legend: {
          display: false,
        },
        maintainAspectRatio: false,
        title: {
          display: title,
          text: title,
        },
        scales: {
          y: {
            ticks: {
              min: minPoint > 0 ? minPoint - 1 : 0,
              maxTicksLimit: 6,
              callback(value, index, values) {
                if (yFormat) {
                  return yFormat(value)
                } else {
                  return value
                }
              },
              fontSize: 9,
              beginAtZero: false,
              display: hideYTicks == false,
            },
          },
          x: {
            gridLines: {
              display: false,
            },
            ticks: {
              callback(value, index, values) {
                if (xFormat) {
                  return xFormat(value)
                } else {
                  return value
                }
              },
              display: hideXTicks == false,
              fontSize: 9,
            },
          },
        },
      },
    }

    theChart = new Chart(ctx, chartConfig)
    _canvas.addEventListener('click', (evt) => {
      let passed = theChart.getElementsAtEvent(evt)
      if (passed.length) {
        selected = points[passed[0]._index]
      }
      dispatch('tap', selected)
    })
  }

  onMount(() => {
    initChart()
    if (points) {
      // showChart = true
    }
  })
</script>

<div class="wrapper active-{activeIndex}" style="--chart-color:{color}">
  {#if selected && selected.unit == 'day' && showSelected}
    <div class="selected">
      <button
        on:click={() => {
          // selected = undefined
          // Interact.focusDate(undefined)
        }}
      >
        <IonIcon icon={CloseOutline} className="fill-white" size={12} />
      </button>
      <button
        on:click={() => {
          openDateOptionPopMenu(selected.date.toDate())
        }}
      >
        <span class="mr-1 text-sm date faded">{xFormat(selected.x)}</span>
        <span class="d-value">{yFormat(selected.y)}</span>
        <IonIcon icon={ChevronForwardOutline} className="fill-white" size={12} />
      </button>
    </div>
  {/if}
  <canvas id={chartId} bind:this={_canvas} width="100%" {height} />
</div>

<style>
  .wrapper {
    position: relative;
    width: 100%;
  }
  .wrapper .selected {
    display: flex;
    align-items: center;
    position: absolute;
    right: 16px;
    background-color: var(--chart-color);
    color: #fff;
    font-size: 12px;
    line-height: 20px;
    height: 20px;
    border-radius: 10px;
  }
  .wrapper .selected button {
    border: none;
    background: none;
    outline: none;
    color: #fff;
    height: 20px;
    font-size: 12px !important;
    display: flex;
    align-items: center;
    padding: 0 4px;
  }
  .wrapper .selected button:first {
    border-radius: 0;
    border-right: solid 1px rgba(255, 255, 255, 0.1);
  }
</style>
