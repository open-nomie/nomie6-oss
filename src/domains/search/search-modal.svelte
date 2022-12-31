<script lang="ts">
  // svelte
  // components

  // Utils

  // Stores
  import { Lang } from '../../store/lang'

  import Button from '../../components/button/button.svelte'
  import { SearchStore, SearchTerm } from './search-store'

  import SearchHistory from './search-history.svelte'
  import SearchRecent from './search-recent.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import SearchBar from '../../components/search-bar/search-bar.svelte'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { ActiveBackdropId, closeModal } from '../../components/backdrop/BackdropStore2'
  import KeyDown from '../../modules/keyDown/keyDown.svelte'

  export const location = undefined
  export const style = undefined

  export const className = ''

  export let id: string
  export let term: string

  let searchTerm: string

  function back() {
    SearchStore.clear()
    term = undefined
    closeModal(id)
  }

  $: if ($SearchStore && $SearchStore.active?.term) {
    searchTerm = $SearchStore.active.term
  }

  $: if ($SearchStore.active?.term) {
    term = $SearchStore.active.term
  }

  let searchInitalized = false
  $: if (searchTerm && !searchInitalized) {
    searchInitalized = true
    SearchStore.setActiveTerm(new SearchTerm({ searchTerm, type: 'history' }))
  }

  function clear() {
    SearchStore.clear()
    term = undefined
  }

  function search(evt: CustomEvent) {
    term = evt.detail
    if (term) {
      SearchStore.setActiveTerm(new SearchTerm({ term, type: 'history' }))
    }
  }
</script>

<BackdropModal className="h-full" headerClass="glass">
  <Toolbar slot="header">
    <Button clear primary on:click={back}>
      {Lang.t('general.close', 'Close')}
    </Button>

    {#if $ActiveBackdropId === id}
      <KeyDown
        on:Escape={() => {
          closeModal(id)
        }}
      />
    {/if}

    <SearchBar
      compact
      className="filler"
      autofocus
      searchTerm={term || ''}
      placeholder={Lang.t('search.search-history', 'Search History...')}
      on:search={search}
      on:clear={clear}
    />
  </Toolbar>

  <main>
    <SearchHistory bind:term={searchTerm} />
    <!-- {#if $SearchStore.view === 'history' && $SearchStore.show}
      {:else if $SearchStore.show}
        <SearchTrackers bind:term={searchTerm} />
      {/if} -->
    {#if !$SearchStore.active && $SearchStore.show}
      <SearchRecent />
    {/if}
  </main>
  <div slot="footer" />
</BackdropModal>

<style lang="postcss" global>
  .search-modal {
    z-index: 1300 !important;
  }
</style>
