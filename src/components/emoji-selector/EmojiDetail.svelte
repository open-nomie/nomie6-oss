<script lang="ts">
  export let emoji
</script>

<div class="svelte-emoji-picker__emoji-detail">
  {#if emoji}
    {emoji.n}
  {:else}
    &nbsp;
  {/if}
</div>

<style>
  .svelte-emoji-picker__emoji-detail {
    border-top: 1px solid #cccccc;
    padding: 0.25em;
    font-size: 0.8em;
    font-weight: bold;
    height: 3em;
    line-height: 3em;
    text-align: center;
  }
</style>
