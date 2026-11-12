<svelte:options runes={true} />

<script lang="ts">
  const { className = "", noFill = false, gap = undefined } = $props()
</script>

<div class="{!noFill ? 'flex-grow flex-shrink w-full' : 'w-0'} {className}">
  {#if gap}
    <div class="gap" style="height:{gap * 4}px; width:{gap * 4}px" />
  {/if}
</div>
