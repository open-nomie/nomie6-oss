<script lang="ts">
  import NHScroller from '../h-scroller/h-scroller.svelte'
  import { base } from '../../modules/colors/colors'
  import { createEventDispatcher } from 'svelte'

  export let value = '#20699d'
  export let grid = false
  export let colors = base.reverse()
  export let className = ''

  $: selectedIndex = colors.indexOf(value) || 0
  const dispatch = createEventDispatcher()
</script>

{#if grid}
  <div class="asGrid n-color-picker {className}">
    {#each colors as color, index}
      <button
        class="color-btn {color == value ? 'selected' : ''}"
        style="background-color:{color}"
        on:click={() => {
          value = color
          dispatch('color', color)
        }}
      />
    {/each}
  </div>
{:else}
  <NHScroller className="n-color-picker {className}" activeIndex={selectedIndex}>
    {#each colors as color, index}
      <button
        class="color-btn {color == value ? 'selected' : ''}"
        on:click={() => {
          value = color
        }}
        style="background-color:{color}"
      />
    {/each}
  </NHScroller>
{/if}

<style global lang="postcss">
  .n-color-picker {
    overflow: scroll;
    max-width: 100%;

    min-width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    display: flex;
    background-color: transparent;
    @apply py-2 px-4;
  }
  .n-color-picker.asGrid {
    @apply grid;
    @apply grid-cols-5;
    @apply gap-2;
  }
  .n-color-picker button.color-btn {
    flex-grow: 0;
    flex-shrink: 0;
    @apply rounded-lg;

    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease-in-out;
    @apply w-auto;
    @apply h-14;

    transform: scale(0.85);
  }
  .n-color-picker button.color-btn.selected {
    transform: scale(1) !important;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.2);
    border: solid 1px var(--color-inverse);
  }
</style>
