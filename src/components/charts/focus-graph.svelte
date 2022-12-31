<script lang="ts">
  import type { IFocusResults } from '../../domains/focus/focus-utils'
  import math from '../../utils/math/math'

  export let scores: Array<IFocusResults> = []

  let internalScores: Array<IFocusResults> = []
  $: if (scores) {
    const percentages = math.percentile(scores.map((s) => s.score))
    internalScores = scores.map((s, index) => {
      return {
        score: percentages[index],
        focus: s.focus,
      }
    })
  }
</script>

<div class="focus-graph">
  {#each internalScores as score}
    <div class="focus-column">
      <div
        class="bar w-full rounded-2xl text-center"
        style="height: {score.score}%; background-color:{score.focus.color}"
      >
        <div class="-mt-6 text-4xl">{score.focus.emoji}</div>
      </div>
      <div class="label my-2 leading-tight text-center text-sm">{score.focus.label}</div>
    </div>
  {/each}
</div>

<style lang="postcss" global>
  .focus-graph {
    @apply p-2;
    @apply grid grid-cols-3 gap-2;
    min-height: 120px;
    max-height: 400px;
    @apply h-full;
    @apply flex-grow flex-shrink;
  }
  .focus-graph .focus-column {
    @apply flex flex-col justify-end items-center;
  }
</style>
