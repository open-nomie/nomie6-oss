<script lang="ts">
  import type { TimelineItemType } from './timeline-utils'

  export let item: TimelineItemType
</script>

<div class="timeline-item">
  {item.usage.length}!
</div>
