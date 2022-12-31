<script lang="ts">
  export let className = "";
  export let noFill: boolean = false;
  export let gap = undefined;
</script>

<div class="{!noFill ? 'flex-grow flex-shrink w-full' : 'w-0'} {className}">
  {#if gap}
    <div class="gap" style="height:{gap * 4}px; width:{gap * 4}px" />
  {/if}
</div>
