<script lang="ts">
  export let positivity = 0
  export let score = 0

  let changed = false

  let lastScore
  $: if (score !== lastScore) {
    lastScore = score
    changed = true
    setTimeout(() => {
      changed = false
    }, 200)
  }
</script>

<div
  class={`${changed ? 'changed' : ''} score animate popin ${positivity < 0 ? 'negative' : ''} ${
    positivity > 0 ? 'positive' : ''
  } ${score ? 'visible' : 'hidden'}`}
>
  {score}
</div>

<style lang="postcss">
  .score.negative {
    background-color: var(--color-red);
  }
  .score.positive {
    background-color: var(--color-green);
  }
  .score {
    transition: all 0.2s ease-in-out;
    position: absolute;
    top: 8px;
    left: 8px;
    height: 26px;
    min-width: 26px;
    border-radius: 13px;
    padding: 0 6px;
    line-height: 26px;
    text-align: center;
    font-size: 13px;
    background-color: var(--color-primary-bright);
    font-weight: bold;
    color: #fff;
    z-index: 100;
  }
  .score.negative {
    background-color: var(--color-red);
  }
  .score.changed {
    transform: scale(1.2);
    z-index: 1000;
  }
  .score.popin.hidden {
    opacity: 0;
  }
</style>
