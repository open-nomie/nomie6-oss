<script lang="ts">
  import HScroller from '../../components/h-scroller/h-scroller.svelte'
  import { DashStore, selectDashboardByIndex } from './DashStore'
</script>

<HScroller
  centerIfPossible
  activeIndex={$DashStore.activeIndex}
  className="n-dashboard-tabs filler"
  wrapperClass="space-x-4"
>
  {#each $DashStore.dashboards || [] as board, i (board.id)}
    <button
      class="tab board-{board.id} whitespace-nowrap truncate-1 {i == $DashStore.activeIndex
        ? 'selected'
        : 'inactive opacity-80'}"
      on:click={() => {
        selectDashboardByIndex(i)
      }}
    >
      {board.label}
    </button>
  {/each}
</HScroller>

<style lang="postcss" global>
  .n-dashboard-tabs {
    @apply h-12;
  }
  .n-dashboard-tabs button {
    @apply transform transition-all duration-200;
    @apply text-gray-800 dark:text-gray-200;
  }
  .n-dashboard-tabs .selected {
    @apply bg-white dark:bg-black text-primary-500;
    @apply shadow-md;
    @apply px-4 py-1 rounded-full;
  }
</style>
