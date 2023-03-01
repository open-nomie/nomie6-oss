<script lang="ts">

  import { dedupArray } from '../../utils/array/array_utils'
  import { getDateFormats, Prefs } from '../preferences/Preferences'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { md5 } from '../../modules/nid/nid'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { TrackableUsage } from '../usage/trackable-usage.class'
  import { wait } from '../../utils/tick/tick'
  
  import dayjs from 'dayjs'
  import logsToTrackableUsage, { logFilter } from '../usage/usage-utils'
  import type { DashboardClass } from './dashboard-class'
  import type { Trackable } from '../trackable/Trackable.class'
  import type { WidgetClass } from './widget/widget-class'
  import type NLog from '../nomie-log/nomie-log'
  import WidgetDisplay from './widget/widget-display.svelte'

  export let dashboard: DashboardClass
  export let showDate: boolean = false

  let loaded = false

  type WidgetWrapper = {
    id: string
    hash: string
    widget: WidgetClass
    usage?: TrackableUsage
    trackable: Trackable
    logs: Array<NLog>
  }

  let logs: Array<NLog> = []
  let widgets: Array<WidgetWrapper> = []
  let dateFormats = getDateFormats()

  /**
   * Load Dashboard Usage
   * --
   * Get active Dashboard
   * Get Logs
   * Get Usage for each widget
   */
  const loadDashboardUsage = async () => {
    loaded = false
    await wait(200)
    const trackables = $TrackableStore.trackables

    // Remove duplicates, this can happen
    // when importing dashboards over themselves
    let dashboardWidgets = dedupArray([...dashboard.widgets], 'id')

    // Set time frame
    let start = dashboard.timeframe.start
    let end = dashboard.timeframe.end.add(1, 'day') //add(1, 'day') is a fix for the extra day in the last week widget when Monday is first day of week

    // Get the Widgets
    widgets = dashboardWidgets.map((widget) => {
      let trackable: Trackable | undefined
      if (widget.token) {
        trackable = tokenToTrackable(widget.token, trackables)
      }
      return {
        hash: md5(JSON.stringify(widget)),
        id: widget.id,
        widget,
        trackable,
        usage: undefined,
        logs: [],
      }
    })

    // Get Logs
    logs = await LedgerStore.query({ start, end, caller: 'dashboard-widget-grid' })

    // Loop over dashboard widgets
    let newWidgets = dashboardWidgets.map((widget, index) => {
      // If its a widget that needs a trackable
      let hash = md5(JSON.stringify(widget))
      if (widget.token) {
        // Get the Trackable for this widget
        let trackable = tokenToTrackable(widget.token, trackables)

        // Filter out based on the time and trackable
        const filteredLogs = logFilter(logs, {
          trackables: [trackable],
          start: widget.getStartDate($Prefs.weekStarts),
          end: widget.getEndDate($Prefs.weekStarts),
        })

        // Generate Usage Map
        const usageMap = logsToTrackableUsage(filteredLogs, { trackables: trackables })
        const usage = usageMap[trackable.tag] ? new TrackableUsage(usageMap[trackable.tag]) : undefined

        loaded = true

        return {
          id: widget.id,
          widget,
          trackable,
          usage: usage,
          logs: usage?.logs || [],
          hash,
        }
      } else {
        const filteredLogs = logFilter(logs, {
          start: widget.getStartDate($Prefs.weekStarts),
          end: widget.getEndDate($Prefs.weekStarts),
        })

        return {
          widget,
          id: widget.id,
          trackable: undefined,
          usage: undefined,
          logs: filteredLogs,
          hash,
        }
      }
    })
    widgets = newWidgets
    loaded = true
  }

  $: if (dashboard) {
    loadDashboardUsage()
  }
</script>

<div id="widgets-frame" class={showDate ? 'bg-gray-100 pt-4 dark:bg-gray-800' : ''}>
  {#if showDate}
    <h1 class="text-lg font-bold text-center mt-2 dark:text-white">
      {dashboard.label} - {dayjs().format(dateFormats.mmm_d_yyyy)}
    </h1>
    <p class="mb-2 text-sm text-center text-primary">Nomie.app</p>
  {/if}
  <div id="widget-grid" class="grid grid-cols-2 lg:grid-cols-6 gap-2 lg:gap-4 lg:gap-6 p-2 lg:p-4 ">
    {#each widgets as widgetWrapper}
      <WidgetDisplay
        hideTools={showDate}
        bind:loaded
        widget={widgetWrapper.widget}
        trackable={widgetWrapper.trackable}
        usage={widgetWrapper.usage}
        logs={widgetWrapper.logs}
      />
    {/each}
  </div>
</div>
