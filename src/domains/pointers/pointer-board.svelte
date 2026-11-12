<svelte:options runes={true} />

<script lang="ts">
import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'


  const { pointers = $bindable() } = $props()
</script>
<div class="flex flex-col gap-y-2">
  
    <div class="inline-flex flex-wrap gap-2">
  {#each pointers as pointer, index}
  <div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span class="py-1 px-1.5 inline-flex items-center gap-x-1 text-xxs font-small bg-blue-100 text-black rounded-full dark:bg-blue-500/10 dark:text-black"
  style="cursor: pointer; background-color: {pointer.ptr.color}"
  on:click={() => {
    openTrackableEditor(
      pointer
    )
  }}>
    {pointer.ptr.emoji} {pointer.ptr.label}
    {#if pointer.ptr.reminder && new Date(pointer.ptr.reminderdate) < new Date()}
    <span class="relative top-0 end-0 inline-flex items-center py-0.3 px-0.5 rounded-full text-xxs font-small transform -translate-y-1/2 translate-x-1/2 border border-gray-400 bg-red-500 text-red-500">✓</span>
  {:else if pointer.ptr.reminder && new Date(pointer.ptr.reminderdate) >= new Date()}
  <span class="relative top-0 end-0 inline-flex items-center py-0.3 px-0.5 rounded-full text-xxs font-small transform -translate-y-1/2 translate-x-1/2 border border-gray-400 bg-green-500 text-green-500">✓</span>
  {:else}
  <span class="relative top-0 end-0 inline-flex items-center py-0.3 px-0.5 rounded-full text-xxs font-small transform -translate-y-1/2 translate-x-1/2 border border-gray-400 bg-blue-500 text-blue-500">✓</span>
  {/if}  
  </span>
</div>
{/each}
  </div>
  </div>

  <style>
  .hide {
    display: none;
  }
      
  .myDIV:hover + .hide {
    display: block;
    color: red;
  }
</style>