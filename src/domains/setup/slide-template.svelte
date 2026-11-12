<svelte:options runes={true} />

<script lang="ts">
  import Container from '../../components/container/container.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'

  import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'

  // import { showImportModal } from '../import-export/ImporterStore'

  import { openExternalTemplate, openTemplateRef } from '../templates/templates-svelte-helpers'
  import { templateRefs } from '../templates/templates-utils'
  import { Trackable } from '../trackable/Trackable.class'
  import { Template } from '../templates/templates-utils'
  import { openTemplatePreview } from '../templates/templates-svelte-helpers'

  let showAdvanced = $state(false)
  let fileInput: HTMLInputElement

  const uploadTemplate = () => {
    fileInput?.click()
  }

  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const templateData = JSON.parse(content)

      // Convert trackables to Trackable instances for proper reactivity
      if (templateData.trackables && Array.isArray(templateData.trackables)) {
        templateData.trackables = templateData.trackables.map((t: any) =>
          t instanceof Trackable ? t : new Trackable(t)
        )
      }

      const template = new Template(templateData)
      openTemplatePreview(template)
      target.value = '' // Reset file input
    } catch (error) {
      console.error('Failed to upload template:', error)
      alert('Failed to upload template. Please ensure it\'s a valid template JSON file.')
    }
  }

  const advancedButtons = [
    {
      title: 'Open Template URL...',
      click: openExternalTemplate,
    },
    {
      title: 'Upload Template File...',
      click: uploadTemplate,
    },
    // {
    //   title: 'Import from Backup...',
    //   click() {
    //     showImportModal()
    //   },
    // },
  ]

  let buttons = $derived.by(() => {
    const result = [
      ...templateRefs.map((tr) => {
        return {
          ...tr,
          click() {
            openTemplateRef(tr.url)
          },
        }
      }),
    ]
    if (showAdvanced) {
      result.push(...advancedButtons)
    }
    return result
  })
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

    <input
      bind:this={fileInput}
      type="file"
      accept=".json"
      style="display: none"
      on:change={handleFileUpload}
    />
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
