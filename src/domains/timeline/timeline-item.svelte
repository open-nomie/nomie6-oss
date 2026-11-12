<svelte:options runes={true} />

<script lang="ts">
  import type { TimelineItemType } from './timeline-utils'

  const { item } = $props<{ item: TimelineItemType }>()
</script>

<div class="timeline-item">
  {item.usage.length}!
</div>
