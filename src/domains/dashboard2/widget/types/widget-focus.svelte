<script lang="ts">
  // import type { WidgetClass } from '../widget-class'
  import { getFocusScoresFromLogs, IFocusResults } from '../../../focus/focus-utils'
  import { TrackableStore } from '../../../trackable/TrackableStore'
  import FocusGraph from '../../../../components/charts/focus-graph.svelte'
  import type NLog from '../../../nomie-log/nomie-log'

  // export let widget: WidgetClass
  export let logs: Array<NLog>
  let scores: Array<IFocusResults> = []

  async function init() {
    scores = getFocusScoresFromLogs(logs, $TrackableStore.trackables)
    return scores
  }
</script>

{#await init()}
  Loading...
{:then value}
  <div class="mind-body-spirit flex item-center justify-center h-full">
    <FocusGraph {scores} />
  </div>
{:catch error}
  error{error.message}
{/await}

<style lang="postcss">
</style>
