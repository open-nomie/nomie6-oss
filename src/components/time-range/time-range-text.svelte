<svelte:options runes={true} />

<script lang="ts">
  import dayjs, { Dayjs } from 'dayjs'
  import { getDateFormats } from '../../domains/preferences/Preferences'

  const { date, seconds, className, style } = $props()

  let end = $state<Dayjs>(undefined)
  let start = $state<Dayjs>(undefined)
  let daysDiff = $state<number>(undefined)
  const dateFormats = getDateFormats()
  $effect(() => {
    if (date || seconds) {
      end = dayjs(date)
      start = dayjs(date).subtract(seconds, 'seconds')
      daysDiff = Math.floor(seconds / (3600 * 24))
    }
  })
</script>

<span class="time-range-text {className}" {style}>
  {#if daysDiff == 0}
    {start.format(`${dateFormats.time}`)} →&nbsp;
    {end.format(`${dateFormats.time}`)}
  {:else if daysDiff < 2}
    {start.format(`ddd ${dateFormats.time}`)} →&nbsp;
    {end.format(`ddd ${dateFormats.time}`)}
  {:else}
    {start.format(`${dateFormats.tinyDate} ${dateFormats.time}`)} →&nbsp;
    {end.format(`${dateFormats.tinyDate} ${dateFormats.time}`)}
  {/if}
</span>
