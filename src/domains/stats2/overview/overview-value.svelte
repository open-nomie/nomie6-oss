<script lang="ts">
  import Card from '../../../components/card/card.svelte'

  import type { Trackable } from '../../trackable/Trackable.class'
  import type { TrackableUsage } from '../../usage/trackable-usage.class'

  export let trackable: Trackable
  export let usage: TrackableUsage
</script>

<div class="stats2-card overview overview-timer" />
