<script lang="ts">
  import Container from '../../components/container/container.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'

  import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'

  // import { showImportModal } from '../import-export/ImporterStore'

  import { openExternalTemplate, openTemplateRef } from '../templates/templates-svelte-helpers'
  import { templateRefs } from '../templates/templates-utils'

  let showAdvanced: boolean = false

  let advancedButtons = [
    {
      title: 'Open Template URL...',
      click: openExternalTemplate,
    },
    // {
    //   title: 'Import from Backup...',
    //   click() {
    //     showImportModal()
    //   },
    // },
  ]
  let buttons: Array<PopMenuButton> = []

  $: {
    buttons = [
      ...templateRefs.map((tr) => {
        return {
          ...tr,
          click() {
            openTemplateRef(tr.url)
          },
        }
      }),
      ...[],
    ]
    if (showAdvanced) {
      buttons = [...buttons, ...advancedButtons]
    }
  }
</script>

<Container className="filler  flex items-center  flex-col pt-3 px-5 slide-templates ">
  <div class="max-w-screen-lg mx-auto pt-6">
    <h1 class="leading-tight dark:text-white text-center font-bold px-4 text-lg">Starter Templates</h1>
    <p class="text-gray-500 text-sm leading-tight text-center px-2 py-1">
      Want Nomie to be set up automatically? Use one of the following templates.
    </p>
    <div class="h-4" />

    <List solo outside title="Templates">
      {#each buttons as button}
        <ListItem detail bottomLine={16} on:click={() => button.click()}>
          {button.title}
        </ListItem>
      {/each}
    </List>

    <List solo outside title="Other Options">
      {#each advancedButtons as button}
        <ListItem bottomLine={16} on:click={() => button.click()}>
          {button.title}
        </ListItem>
      {/each}
    </List>
  </div>

  <!-- <div class="flex items-center justify-center pt-6">
    <button
      on:click={() => {
        showAdvanced = !showAdvanced
      }}
      class="nbtn-badge bg-gray-500 bg-opacity-10 text-gray-600 dark:text-gray-300 text-xs"
    >
      {#if showAdvanced}Hide Advanced{:else}Show Advanced{/if}
    </button>
  </div> -->
  <div class="h-20" />
</Container>

<style global>
  .storage-select .n-menu .active {
    @apply ring-2 ring-primary-500 ring-inset;
  }
</style>
