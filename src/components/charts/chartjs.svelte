<script lang="ts">
  import {
    CategoryScale,
    Chart,
    BarElement,
    PointElement,
    LineElement,
    LinearScale,
    LogarithmicScale,
    BarController,
    LineController,
    Filler,
  } from 'chart.js'
  import type { ChartConfiguration } from 'chart.js'
  import { createEventDispatcher, onMount } from 'svelte'

  Chart.register(
    BarElement,
    Filler,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarController,
    LineController
  )

  export let id: string
  export let chartjsPayload: ChartConfiguration

  let chart: Chart
  let ctx: HTMLCanvasElement
  const dispatch = createEventDispatcher()

  const render = () => {
    try {
      chartjsPayload.options = {
        ...chartjsPayload.options,
        ...{
          // events: ['click','touchmove'],
          onClick: (e, a) => {
            if (a.length) {
              const index: number = a[0].index
              dispatch('click', index)
            }
          },
          onHover: (e, a) => {
            if (a.length) {
              const index: number = a[0].index
              dispatch('click', index)
            } else {
              // dispatch('click', undefined);
            }
          },
        },
      }

      chart = new Chart(ctx, chartjsPayload)
      return chart
    } catch (e) {
      console.error('Caught an error on the cartjs chart', e)
    }
    return undefined
  }

  onMount(() => {
    render()
  })
</script>

<canvas height="100%" id={`chart-${id}`} bind:this={ctx} />
