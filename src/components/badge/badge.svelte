<script lang="ts">
import { createEventDispatcher } from "svelte";


  export let label = undefined;
  export let value = undefined;
  // export let color = undefined;
  export let emoji = undefined;
  export let className = "light";
  export let pad:boolean = false;
  export let style:string = "";
  export let ballStyle:string = ""
  const emit = createEventDispatcher();
</script>

<div on:click={(evt)=>{
  emit('click', evt)
}} class:pad={pad} class="n-tag-badge badge badge-sm {className}" {style}>
  {#if emoji}
    <div class="emoji">{emoji}</div>
  {/if}
  {#if label}
    <div class="label">{label}</div>
  {/if}
  {#if value && value !== 1}
    <div class="value">{value}</div>
  {/if}
  <slot />
</div>

<style lang="postcss" global>

  .n-tag-badge.pad {
    @apply px-2;
  }
  .n-tag-badge {
    min-width: 20px;
    @apply inline-flex;
    @apply items-center;
    @apply rounded-full;
    @apply shadow-md;
    @apply px-1 py-px;
    @apply text-center;
    font-size:0.65rem;
    leading:0%;
  }
  .n-tag-badge.light {
    @apply bg-gray-100 dark:bg-black;
  }



  .n-tag-badge .value {
    display: inline-block;
    @apply w-full text-center;
 
    @apply text-center;
    /* padding: 2px 4px 2px;
    background-color: rgba(255, 255, 255, 0.2);
    min-width: 20px;
    border-radius: 20px;
    text-align: center;
    margin-left: 4px; */
  }
  .n-tag-badge .emoji {
    margin-right: 3px;
    opacity: 0.7;
  }
</style>
