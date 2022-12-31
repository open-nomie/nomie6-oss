<script lang="ts">
  import Container from '../../components/container/container.svelte'

  import Menu from '../../components/menu/menu.svelte'
  import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'

  import LoginRegisterView from '../firebase/login-register-view.svelte'
  import { Prefs } from '../preferences/Preferences'

  import { StorageEngines, StorageTypes } from '../storage/storage'

  const engines = StorageEngines
  let selected: StorageTypes = 'local'
  selected = $Prefs.storageType
  let showAdvanced: boolean = false

  let buttons: Array<PopMenuButton> = []
  $: {
    buttons = engines
      .map((engine) => {
        return {
          title: engine.name,
          id: engine.id,
          disabled: ['firebase', 's3'].indexOf(engine.id) > -1 && !$Prefs.betaFeatures,
          description: `${engine.description}  ${engine.price}`,
          checked: `${selected}` == `${engine.id}`,
          click() {
            //@ts-ignore
            selected = engine.id
            $Prefs.storageType = selected
          },
        }
      })
      .filter((e) => {
        if (showAdvanced) {
          return true
        } else {
          return e.id !== 'pouchdb'
        }
      })
    buttons = buttons
  }
</script>

<Container className="filler  flex items-center lg:justify-center flex-col pt-3 px-5 slide-storage ">
  <div class="max-w-screen-lg mx-auto pt-6">
    <h1 class="leading-tight dark:text-white text-center font-bold px-4 text-xl">Data Storage</h1>
    <p class="text-description text-center text-sm pt-1 px-1">Where would you like your data stored?</p>
    <div class="h-4" />
    <Menu size="sm" className="border border-gray-500 border-opacity-20" {buttons} />

    <div class="flex items-center justify-center pt-4">
      <button
        on:click={() => {
          showAdvanced = !showAdvanced
        }}
        class="nbtn-badge bg-gray-500 bg-opacity-10 text-gray-600 dark:text-gray-300 text-xs"
      >
        {#if showAdvanced}Hide Advanced{:else}Show Advanced{/if}
      </button>
    </div>
    <div class="h-20" />
  </div>
</Container>

<style global>
  .storage-select .n-menu .active {
    @apply ring-2 ring-primary-500 ring-inset;
  }
</style>
