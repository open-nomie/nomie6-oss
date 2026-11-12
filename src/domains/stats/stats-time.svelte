<svelte:options runes={true} />

<script lang="ts">
  import DayTimeGrid from '../../components/day-time-grid/day-time-grid.svelte'

  import DayOfWeek from '../../components/day-of-week/day-of-week.svelte'
  import TimeOfDay from '../../components/time-of-day/time-of-day.svelte'
  import type { IStats } from './statsV5'
  import Card from '../../components/card/card.svelte'

  // export let rows: Array<NLog>;


  const { term, color, stats } = $props()
</script>

<Card pad className="m-2">
  <DayTimeGrid
    {term}
    {color}
    rows={stats.rows}
    style="min-height:100px;max-height:100px" />
</Card>
<Card pad className="m-2">
  <TimeOfDay statsTod={stats.tod} {color} />
</Card>
<Card pad className="m-2">
  <DayOfWeek height={90} statsDow={stats.dow} {color} />
</Card>
