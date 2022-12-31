<script lang="ts">
  import './grid.css'

  export let columns: number = 3
  export let gap: number = 2
  export let className: string = ''
  export let style: string = ''

  let columnFr: string = '1fr 1fr 1fr'
  let columnDots: string = '. . .'
  let gapStr: string = '2px 2px'

  $: if (columns) {
    columnFr = Array(columns).fill('1fr').join(' ')
    columnDots = Array(columns).fill('.').join(' ')
    gapStr = `${gap}px`
  }
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
