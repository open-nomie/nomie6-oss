<script lang="ts">
  import { Interact } from '../../store/interact'

  import math from '../../utils/math/math'

  export let positive: number
  export let negative: number
  export let neutral: number
  export let className: string = ''
  export let style: string = ''
  export let height: string = '8pt'

  let score = 0
  let neuCount = { type: 'neutral', count: 0, percent: 0 }

  let counts = []

  $: if (neutral | positive | negative) {
    main()
  }

  function whatsThis() {
    let message = `Using your total negative (red), positive (green), and neutral (gray) events for the day, Nomie calculates your Positivity Score. 
      ${counts.map((c) => `${math.round(c.count)} ${c.type}`).join(', ')}
    `
    Interact.alert('What is this?', message)
  }

  function main() {
    let total = math.sum([negative, neutral, positive])
    let negPer = math.percentage(total, negative)
    let neuPer = math.percentage(total, neutral)
    let posPer = math.percentage(total, positive)

    neuCount = { type: 'neutral', percent: neuPer, count: neutral }
    counts = [
      { type: 'negative', percent: negPer, count: negative },
      { type: 'positive', percent: posPer, count: positive },
      { type: 'neutral', percent: neuPer, count: neutral },
    ]
    score = positive - negative
  }
</script>

{#if negative || neutral || positive}
  <div
    class="positivity-bar cursor-pointer {className} {score < 0
      ? 'is-negative'
      : score > 0
      ? 'is-positive'
      : 'is-neutral'}"
    {style}
    on:click={() => whatsThis()}
  >
    <div class="bar" style="height:{height}">
      {#each counts.filter((a) => a.type !== 'neutral').sort((a, b) => (a.count > b.count ? 1 : -1)) as posType}
        {#if posType.count > 0 || posType.count < 0}
          <div
            class="unit relative {posType.type}"
            data-score={posType.count}
            style={`height:${height}; width:${posType.percent}%`}
          >
            <div class="score-ball {score < 0 ? 'is-negative' : score > 0 ? 'is-positive' : 'is-neutral'}">
              <span>{score}</span>
            </div>
          </div>
        {/if}
      {/each}
      <div class="unit neutral" data-score={neutral} style={`height:${height}; width:${neuCount.percent}%`}>
        <div class="score-ball is-neutral">
          <span>{score}</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss" global>
  .positivity-bar {
    @apply px-4 py-2;
  }
  .positivity-bar .bar {
    display: flex;
    @apply rounded-full;
    @apply flex;
    @apply transition-all duration-200 transform;
    @apply space-x-1;
  }

  .positivity-bar .unit:first-child {
    @apply rounded-l-full;
  }
  .positivity-bar .unit:last-child {
    @apply rounded-r-full;
  }
  .positivity-bar .unit {
    @apply relative;
    @apply flex items-center justify-center;
    @apply transition-all duration-200 transform;
    @apply z-10;
  }
  .positivity-bar .unit .score-ball.is-positive {
    @apply -mt-2;
  }
  .positivity-bar .unit .score-ball {
    @apply absolute;
    @apply shadow-md;
    @apply rounded-full;
    @apply h-7 w-7;
    @apply -mr-1;
    @apply font-bold;
    @apply flex items-center justify-center;
    @apply text-xs;
    @apply shadow-md;
    @apply z-20;
  }
  .positivity-bar .unit .score-ball.invisible {
    display: none;
  }

  .positivity-bar .unit.negative {
    @apply bg-red-600 bg-opacity-40;
    @apply text-white;
    @apply justify-end;
  }

  .positivity-bar .score-ball.is-negative span {
    @apply -ml-1;
  }

  .positivity-bar .unit.negative .score-ball {
    @apply bg-red-600 text-white;
    @apply z-40;
  }

  .positivity-bar.is-positive .unit.negative .score-ball,
  .positivity-bar.is-positive .unit.neutral .score-ball {
    @apply hidden;
  }

  .positivity-bar.is-negative .unit.positive .score-ball,
  .positivity-bar.is-negative .unit.neutral .score-ball {
    @apply hidden;
  }

  .positivity-bar.is-neutral .unit.positive .score-ball,
  .positivity-bar.is-neutral .unit.neutral .score-ball {
    @apply hidden;
  }
  .positivity-bar .score-ball.is-negative {
    /* @apply ring-2 ring-red-500 ring-opacity-50; */
  }
  .positivity-bar .unit.positive {
    @apply bg-green-600 bg-opacity-40;
    @apply text-white;
    @apply flex items-start justify-end;
  }
  .positivity-bar .unit.positive .score-ball {
    @apply bg-green-600;
    @apply text-white;
  }
  .positivity-bar .unit.neutral {
    @apply bg-gray-200 dark:bg-gray-900;
    @apply z-50;
  }
  .positivity-bar .score-ball.is-neutral {
    @apply bg-gray-100 dark:bg-gray-900;
  }
</style>
