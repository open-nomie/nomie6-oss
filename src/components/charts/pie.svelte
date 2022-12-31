<script type="ts">
  import { onMount } from 'svelte'
  // import Chart from 'chart.js/auto'
  import nid from '../../modules/nid/nid'

  export let data: Array<IPieData> = []

  const chartId = `chart-${nid()}`

  interface IPieData {
    label: string
    value: number
    color: string
  }

  function createDoughnut() {
    // TODO: Make the pie chart work
    // var ctx = document.getElementById(chartId)
    // let myChart = new Chart(ctx, {
    //   type: 'doughnut',
    //   data: {
    //     labels: data.map((row) => row.label),
    //     datasets: [
    //       {
    //         backgroundColor: data.map((row) => row.color),
    //         data: data.map((row) => row.value),
    //       },
    //     ],
    //   },
    //   options: {
    //     plugins: {
    //       legend: {
    //         display: false,
    //       },
    //     },
    //     maintainAspectRatio: false,
    //     title: {
    //       display: false,
    //     },
    //   },
    // })
  }
  onMount(createDoughnut)
</script>

<canvas id={chartId} width="150" height="150" />
