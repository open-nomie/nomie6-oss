<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list'
  import ListItemLog from '../../../components/list-item-log/list-item-log.svelte'
  import type NLog from '../nomie-log'
  export let logs: Array<NLog> = []
</script>

<div class="virtual-list">
  <VirtualList items={logs} let:item>
    <div class="pb-3">
      <ListItemLog log={item} />
    </div>
  </VirtualList>
</div>

<style lang="postcss" global>
  .virtual-list {
    @apply w-full;
    @apply flex-grow;
    @apply h-full;
  }
</style>
