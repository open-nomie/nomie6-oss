<svelte:options runes={true} />

<script lang="ts">
  import './grid.css'

  const { columns, gap, className, style } = $props()

  let columnFr = $state('1fr 1fr 1fr')
  let columnDots = $state('. . .')
  let gapStr = $state('2px 2px')

  $effect(() => {
    if (columns) {
      columnFr = Array(columns).fill('1fr').join(' ')
      columnDots = Array(columns).fill('.').join(' ')
      gapStr = `${gap}px`
    }
  })
</script>

<div class="nc-grid {className}" style="--columnFr: {columnFr}; --columnDots: {columnDots}; --gap: {gapStr}; {style}">
  <slot />
</div>

<style lang="postcss">
  .nc-grid {
    display: grid;
    grid-template-columns: var(--columnFr);
    /* grid-template-rows: var(--columnFr); */
    gap: var(--gapStr);
    grid-template-areas: var(--columnDots);
  }
</style>
