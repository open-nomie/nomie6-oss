<script lang="ts">
  import { onMount } from 'svelte'

  import IonIcon from '../icon/ion-icon.svelte'
  import { CloseOutline, SearchIcon } from '../icon/nicons'

  export let searchText = ''

  let searchField

  onMount(() => {
    // searchField.focus();
  })

  function clearSearchText() {
    searchText = ''
    searchField.focus()
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && searchText) {
      clearSearchText()
      event.stopPropagation()
    }
  }
</script>

<div class="svelte-emoji-picker__search">
  <input
    type="text"
    class="border-gray-500 dark:text-white border border-opacity-20"
    autocapitalize="false"
    autocomplete="false"
    placeholder="Search emojis..."
    bind:value={searchText}
    bind:this={searchField}
    on:keydown={handleKeyDown}
  />

  {#if searchText}
    <span class="icon clear-button" role="button" on:click|stopPropagation={clearSearchText}>
      <IonIcon icon={CloseOutline} />
    </span>
  {:else}
    <span class="icon">
      <IonIcon icon={SearchIcon} />
    </span>
  {/if}
</div>

<style lang="postcss" global>
  .svelte-emoji-picker__search {
    padding: 0.25em;
    position: relative;
  }

  .svelte-emoji-picker__search input {
    @apply w-full;
    @apply text-sm;
    @apply px-2;
    @apply py-2;
    background-color: var(--color-solid-50);
    color: var(--color-solid-900);
    @apply rounded-lg;
  }

  .svelte-emoji-picker__search input:focus {
    outline: none;
    border-color: #4f81e5;
  }

  .icon {
    color: var(--color-solid-200);
    @apply absolute;

    right: 0.85rem;
    top: 0.85rem;
  }

  .icon.clear-button {
    cursor: pointer;
  }
</style>
