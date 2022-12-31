<script lang="ts">
  import { getFocusScoresFromLogs, IFocusResults } from '../../domains/focus/focus-utils'
  import type NLog from '../../domains/nomie-log/nomie-log'
  import { TrackableStore } from '../../domains/trackable/TrackableStore'

  import PositivityScorebar from '../scorebar/positivity-scorebar.svelte'
  import Scorebar from '../scorebar/scorebar.svelte'

  export let logs: Array<NLog>

  let focusScores: Array<IFocusResults>
  let hasFocusScores: boolean

  focusScores = getFocusScoresFromLogs(logs, $TrackableStore.trackables)

  hasFocusScores =
    focusScores && (focusScores[0].score !== 0 || focusScores[1].score !== 0 || focusScores[2].score !== 0)
</script>

<div class="px-2 flex space-y-2 lg:space-y-0 lg:space-x-2 lg:flex-row flex-col items-center">
  <PositivityScorebar {logs} />
  {#if hasFocusScores}
    <Scorebar
      scores={focusScores.map((fs) => {
        return {
          score: fs.score,
          color: fs.focus.color,
          label: fs.focus.label,
          className: 'text-white',
        }
      })}
    />
  {/if}
</div>
