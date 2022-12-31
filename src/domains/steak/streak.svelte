<script lang="ts">
  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'

  import TrackerClass from '../../modules/tracker/TrackerClass'

  import Calendar from '../../components/calendar/calendar.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'

  import StreakHelper from './streak-helper'
  import type { StreakViewTypes } from './streak-helper'
  import type { CalendarLog } from './streak-helper'
  // import StreakDays from './streak-days.svelte'

  import type { Trackable } from '../trackable/Trackable.class'
  import { strToTrackable } from '../trackable/trackable-utils'
  import { TrackableStore } from '../trackable/TrackableStore'

  export let term: string
  export let selectedDate: Dayjs = dayjs()
  export let view: StreakViewTypes = 'month'
  export let trackable: Trackable
  export let className: string = ''
  export let showDetail: boolean = true

  let calendarLogs: Array<CalendarLog>
  let mockTracker: TrackerClass
  let lastTerm: string
  let lastElement: Trackable

  $: if (term && lastTerm !== term && !trackable) {
    lastTerm = term
    trackable = strToTrackable(term, $TrackableStore.trackables)
    main()
  } else if (trackable && lastElement !== trackable) {
    lastElement = trackable
    main()
  }

  async function main() {
    if (trackable) {
      mockTracker = trackable.type == 'tracker' ? trackable.tracker : new TrackerClass({ tag: `${trackable.id}-mock` })
      // let logs = await StreakHelper.getLogs(trackable, selectedDate, view, $Prefs.weekStarts)
      let logs = []
      calendarLogs = StreakHelper.logsToCalendar(logs)
    }
  }
</script>

<div class="n-streak n-streak-{view} {className}">
  {#if calendarLogs && mockTracker}
    {#if view == 'month'}
      <Calendar
        showControls={false}
        showDetails={showDetail}
        initialDate={selectedDate}
        tracker={mockTracker}
        events={calendarLogs}
      />
    {:else if view == 'week'}
      <div class="week">
        <!-- <StreakDays logs={calendarLogs} date={selectedDate} days={7} /> -->
      </div>
    {:else if view == 'quarter'}
      <div class="grid grid-cols-3 gap-2">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(2, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(1, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate} events={calendarLogs} />
      </div>
    {:else if view == 'year'}
      <div class="grid grid-cols-3 gap-2">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(1, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(2, 'month')} events={calendarLogs} />
      </div>
      <div class="grid grid-cols-3 gap-2">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(3, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(4, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(5, 'month')} events={calendarLogs} />
      </div>
      <div class="grid grid-cols-3 gap-2">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(6, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(7, 'month')} events={calendarLogs} />
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(8, 'month')} events={calendarLogs} />
      </div>
      <div class="grid grid-cols-3 gap-2">
        <Calendar tracker={mockTracker} compact initialDate={selectedDate.subtract(9, 'month')} events={calendarLogs} />
        <Calendar
          tracker={mockTracker}
          compact
          initialDate={selectedDate.subtract(10, 'month')}
          events={calendarLogs}
        />
        <Calendar
          tracker={mockTracker}
          compact
          initialDate={selectedDate.subtract(11, 'month')}
          events={calendarLogs}
        />
      </div>
    {/if}
  {:else}
    <div class="n-panel w-full flex items-center justify-center h-40">
      <Spinner size={40} />
    </div>
  {/if}
</div>
