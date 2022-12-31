<script lang="ts">
  export let hours = []
  export let color = undefined
</script>

<div class="time-balls">
  {#each hours as hour}
    <div class="active" style="{color ? `background-color:${color};` : ''} --index:{hour};" />
  {/each}
</div>

<style lang="postcss" global>
  .time-balls {
    border-radius: 4px;
    height: 4px;
    @apply relative;
  }

  .time-balls .active {
    @apply absolute;
    @apply bg-white opacity-50;
    flex-shrink: 0;
    flex-grow: 0;
    @apply h-1 w-1;
    border-radius: 2px;
    overflow: visible;

    left: calc(var(--index) * (100% / 24));
  }
</style>
