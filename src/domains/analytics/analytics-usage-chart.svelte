<script lang="ts">
  import ButtonGroup from '../../components/button-group/button-group.svelte'

  import Button from '../../components/button/button.svelte'

  import Card from '../../components/card/card.svelte'
  import Chartjs from '../../components/charts/chartjs.svelte'

  import appConfig from '../../config/appConfig'
  import type NLog from '../nomie-log/nomie-log'
  import CalendarMap, { getCalendarMapFormats } from '../../utils/calendar-map/calendar-map'
  import type { TimeGroupType } from '../../utils/calendar-map/calendar-map'
  import { openOnThisDayModal } from '../on-this-day/useOnThisDayModal'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import dayjs from 'dayjs'
  import { EyeSolid } from '../../components/icon/nicons'

  import { onMount } from 'svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import { wait } from '../../utils/tick/tick'
  import { getDateFormats } from '../preferences/Preferences'

  export let results: Array<NLog> = []
  export let className: string = ''
  export let bodyClass: string = ''
  export let cardTitle: string = 'Usage'
  export let loading: boolean = false

  let selectedDate: Date | undefined = undefined
  let timeGroup: TimeGroupType = 'day'
  let chartData: any | undefined = undefined
  let map
  let ready = false

  // Reactive
  $: dateFormats = getDateFormats()

  $: if (ready && results && results.length && !loading && timeGroup) {
    render()
  }

  const setSelectedDate = (date) => {
    selectedDate = date
  }

  const onIndexClick = (index: number) => {
    const dateTimeString = map.times[index]
    setSelectedDate(new Date(dateTimeString))
  }

  const openDayDetail = (date: Date) => {
    openOnThisDayModal(date)
  }

  const render = async () => {
    const sortedResults = results.sort((a, b) => {
      return a.end > b.end ? 1 : -1
    })
    chartData = undefined
    await wait(100)
    map = CalendarMap({
      start: sortedResults[0].end,
      end: sortedResults[results.length - 1].end,
      timeGroup: timeGroup,
    })

    const formats = getCalendarMapFormats(map.meta.timeGroup)

    const incrementValue = (node, index, value) => {
      if (isNaN(node[index])) {
        return value
      } else {
        return node[index] + value
      }
    }

    const negative = [...map.value]
    const positive = [...map.value]

    results.map((log: NLog) => {
      const slot = log.endDayjs().format(formats.slotFormat)
      const mapIndex = map.slots.indexOf(slot)
      if (mapIndex > -1) {
        map.value[mapIndex] = incrementValue(map.value, mapIndex, 1)
        map.positivity[mapIndex] = incrementValue(map.positivity, mapIndex, log.score)
        if (log.score > 0) {
          positive[mapIndex] = incrementValue(positive, mapIndex, log.score)
        } else if (log.score < 0) {
          negative[mapIndex] = incrementValue(negative, mapIndex, log.score)
        }
      }
    })

    const labels = map.label
    chartData = {
      type: 'stacked',
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
      data: {
        labels: labels,

        datasets: [
          {
            label: 'Positive',
            type: 'bar',
            data: positive,
            backgroundColor: appConfig.green_color,
          },
          {
            label: 'Negative',
            type: 'bar',
            data: negative,
            backgroundColor: appConfig.red_color,
          },
          {
            label: 'Overall Tracking',
            borderColor: 'rgba(7,178,245,0.5)',
            data: map.value,
            type: 'line',
            pointRadius: 1,
            tension: 0.5,
            parsing: {
              yAxisKey: 'elementCount',
            },
          },
        ],
      },
    }
  }

  onMount(() => {
    ready = true
  })
</script>

<Card {className} {bodyClass} title={cardTitle}>
  <div slot="header" class="flex stiff items-center w-auto h-50vh flex-shrink-0 justify-end">
    {#if selectedDate}
      <Button
        size="xs"
        type="clear"
        className="text-xs font-bold mr-1"
        on:click={() => {
          openDayDetail(selectedDate)
        }}
      >
        <IonIcon icon={EyeSolid} size={12} className="text-primary-500 mr-1" />
        <span class="text-primary-500">{dayjs(selectedDate).format(dateFormats.tinyDate)}</span>
      </Button>
    {/if}
    <ButtonGroup
      className="w-24 stiff"
      bind:value={timeGroup}
      on:change={() => {
        render()
      }}
      buttons={[
        { label: 'D', value: 'day' },
        { label: 'W', value: 'week' },
        { label: 'M', value: 'month' },
      ]}
    />
  </div>

  {#if chartData && !loading}
    <Chartjs
      id="analytics"
      chartjsPayload={chartData}
      on:click={(evt) => {
        onIndexClick(evt.detail)
      }}
    />
  {:else}
    <div class="flex w-full items-center justify-center h-40">
      <Spinner size={30} />
    </div>
  {/if}
</Card>
