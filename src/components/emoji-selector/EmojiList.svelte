<script lang="ts">
  import Emoji from './Emoji.svelte'
  export let emojis
</script>

<!-- <h3 class="mb-4 text-xs text-center">{name}</h3> -->
<div class="grid grid-cols-8 lg:grid-col-12 gap-1 items-start p-2">
  {#each emojis as emoji}
    <Emoji {emoji} on:emojihover on:emojiclick className="text-2xl p-1" />
  {/each}
</div>
