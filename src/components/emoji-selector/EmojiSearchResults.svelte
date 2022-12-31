<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import EmojiList from './EmojiList.svelte'
  import emojiData from './data/emoji-light'

  import Empty from '../empty/empty.svelte'
  export let searchText = ''

  const dispatch = createEventDispatcher()

  $: searchResults = emojiData.filter((emoji) => emoji.n.indexOf((searchText || '').toLowerCase()) >= 0)
</script>

<div class="">
  {#if searchResults.length}
    <EmojiList emojis={searchResults} withTabs={false} on:emojihover on:emojiclick />
  {:else}
    <Empty title="No emojis found" emoji="😭" />
  {/if}
</div>

<style lang="postcss" global>
  .svelte-emoji-picker__search-results {
    padding: 0.25em;
    height: 15rem;
  }

  .svelte-emoji-picker__search-results h3 {
    margin: 0;
    font-size: 0.9em;
    margin: 0 auto;
    color: #999999;
  }

  .svelte-emoji-picker__no-results {
    height: 15rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .svelte-emoji-picker__no-results .icon {
    margin: 0 auto;
    font-size: 3em;
    color: #999999;
  }
</style>
