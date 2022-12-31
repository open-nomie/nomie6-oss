<script lang="ts">
  /**
   * The Score Bar
   * This was originally a positivity bar, first used in Nomie 2. Then lost after the Nomie 3 ending.
   * reddit.com/u/helpmemakeausername1 asked for it to return in Nomie 6
   * it's now used for positivity displays and FocusScores
   */

  import math from '../../utils/math/math'

  type ScoreType = {
    label: string
    score: number
    className?: string
    color?: string
  }
  export let scores: Array<ScoreType>
  export let barClass: string = 'h-2'
  export let className: string = ''
  export let style: string = ''
  export let total: number | undefined = undefined

  export let expanded: boolean = false

  let localScores: Array<ScoreType> = []
  $: {
    const percentages = math.percentile(scores.map((s) => s.score))
    localScores = scores.map((s, index) => {
      return {
        score: percentages[index],
        label: s.label,
        className: s.className,
        color: s.color,
      }
    })
  }
</script>

<button {style} on:click={() => (expanded = !expanded)} class="scorebar {className} {expanded ? 'expanded' : ''}">
  {#if total}
    <div class="total {total > 0 ? 'text-green-500' : total < 0 ? 'text-red-500' : ''}">{total}</div>
  {/if}
  {#each localScores as score, index}
    <div
      class="sb-bar {barClass} {score.className || ''}"
      style="width:{score.score}%; {score.color ? `background-color:${score.color}` : ''}"
    >
      <div class="sb-label whitespace-nowrap">
        <span class="sb-score bg-white bg-opacity-20 px-1 leading-3 rounded-md">{scores[index].score}</span>
        {score.label}
      </div>
    </div>
  {/each}
</button>

<style lang="postcss" global>
  .scorebar {
    @apply flex  items-center;
    @apply w-full;
    @apply rounded-lg;
    @apply space-x-1;
    @apply focus:ring-0;
  }
  .scorebar .total {
    @apply flex items-center justify-center;
    @apply h-4 w-auto;
    min-width: 22px;
    @apply px-1;
    @apply rounded-full;
    @apply text-xs font-semibold text-center;
  }
  .scorebar .sb-bar {
    @apply flex items-center justify-start;
    text-indent: 6px;
    @apply overflow-hidden;
    @apply rounded-md;
    @apply transition-all transform duration-200 ease-in-out;
  }
  .scorebar .sb-bar .sb-label {
    @apply hidden;
  }
  .scorebar.expanded .sb-bar {
    @apply h-6;
  }
  .scorebar.expanded .sb-bar .sb-label {
    @apply block;
    @apply text-xs;
  }
</style>
