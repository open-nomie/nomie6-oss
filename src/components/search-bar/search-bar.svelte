<script lang="ts">
  import Input from '../input/input.svelte'

  import { createEventDispatcher } from 'svelte'
  import Button from '../button/button.svelte'

  import Toolbar from '../toolbar/toolbar.svelte'
  import Container from '../container/container.svelte'
  import { CloseOutline, SearchIcon } from '../icon/nicons'
  import IonIcon from '../icon/ion-icon.svelte'
  const dispatch = createEventDispatcher()

  export let searchTerm: string | undefined = undefined
  export let placeholder = `Search...`
  export let style: string = ''
  export let className: string = ''
  export let inputClass: string = ''
  export let compact: boolean = false

  export let showClose: boolean = true
  export let autofocus: boolean = false
  export const autocomplete: boolean = false
  export let searchButton: boolean = false

  let _elInput: any
  // export let hasResults = false;

  // FIre off changes when input changes
  let timeout: any
  function fireChange() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      dispatch('change', searchTerm)
    }, 400)
  }

  export function focus() {
    if (_elInput.doFocus) {
      _elInput.doFocus()
    }
  }
  // Fire off when search is hit
  function fireSearch() {
    dispatch('search', searchTerm)
  }
  // Fire off clearing
  function fireClear() {
    dispatch('clear')
    searchTerm = undefined
  }
  // Watch for enter keys
  // function searchKeypress(event:any) {
  //   if (event.key === "Enter" || event.key === "Return") {
  //     fireSearch();
  //     return false;
  //   } else {
  //     fireChange();
  //   }
  // }
</script>

<Toolbar className="search-bar {className}" {style}>
  <Container size="sm">
    <Input
      solo
      {compact}
      {autofocus}
      className="search-input mt-0 text-2xl {inputClass}"
      bind:this={_elInput}
      bind:value={searchTerm}
      on:input={fireChange}
      on:enter={fireSearch}
      on:focus={() => {
        dispatch('focus')
      }}
      on:blur={() => {
        dispatch('blur')
      }}
      {placeholder}
    >
      <div slot="left" class="flex items-center pl-2">
        <IonIcon icon={SearchIcon} size={20} className="text-gray-500" />
      </div>
      <div slot="right" class="flex items-center">
        <slot name="right-inside" />
        {#if searchTerm && showClose}
          <Button icon className=" btn-action-clear mr-2" on:click={fireClear} style="margin-left:-10px;">
            <IonIcon icon={CloseOutline} />
          </Button>
        {/if}
      </div>
    </Input>
    <slot name="right" />
    {#if searchButton}
      <Button color="clear" icon on:click={fireSearch}>
        <IonIcon icon={SearchIcon} size={20} className="text-gray-500" />
      </Button>
    {/if}
  </Container>
</Toolbar>

<style global lang="postcss">
  .search-bar {
    position: relative;
    height: 50px;
    @apply w-full;
    @apply flex-grow flex-shrink;
  }
  .search-bar input {
    background:transparent !important;
  }

  .search-bar .btn-action-clear {
    font-size: 14px;
  }
  .search-bar input {
    width: calc(100% - 30px);
    font-size: 20px;
  }

  .search-bar .n-input-container {
    margin-bottom: 0 !important;
    @apply bg-gray-400 dark:bg-gray-600 bg-opacity-30 dark:bg-opacity-30;
  }
  .search-bar .n-input-container .n-input-wrapper input {
    @apply placeholder-gray-500;
  }
</style>
