<script lang="ts">
  import TrackerLogsToTime from '../../../../utils/tracker-logs-to-time/tracker-logs-to-time'

  // import type { TrackableUsage } from '../../../usage/trackable-usage.class'

  // import type { Trackable } from '../../../trackable/Trackable.class'

  import type { WidgetClass } from '../widget-class'

  export let widget: WidgetClass
  // // export let trackable: Trackable
  // export let usage: TrackableUsage

  let times = []

  async function init() {
    times = TrackerLogsToTime(widget.token.id, widget.logs)
  }
</script>

{#await init()}
  Loading...
{:then value}
  <div class="time-graph">
    <div class="days">
      {#each times as day}
        <div class="day">
          <div class="bar" style="height:{day.percent}%" />
        </div>
      {/each}
    </div>
  </div>
{:catch error}
  error{error.message}
{/await}

<style lang="postcss">
  .time-graph {
    border: solid 1px var(--color-solid-1);
    height: 120px;
  }
  .time-graph .days {
    display: flex;
    flex-direction: row;
    width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    height: 100%;
    justify-content: stretch;
  }
  .time-graph .days .day {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .time-graph .days .day .bar {
    min-width: 4px;
    max-width: 14px;
    border-radius: 7px;
    background-color: var(--color-inverse);
    min-height: 10px;
    flex-grow: 0;
    flex-shrink: 0;
  }
</style>
