<svelte:options runes={true} />

<script lang="ts">
  import { openTemplateEditor, openTemplateRef, TemplateStore } from './templates-svelte-helpers'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import Button from '../../components/button/button.svelte'
  import List from '../../components/list/list.svelte'
  import Title from '../../components/title/title.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { closeTemplateManager } from './templates-svelte-helpers'
  import Empty from '../../components/empty/empty.svelte'

  import { Template, templateRefs } from './templates-utils'
  import { Trackable } from '../trackable/Trackable.class'

  import { onMount } from 'svelte'
  import ListItem from '../../components/list-item/list-item.svelte'

  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
import TemplateEditorList from './template-editor-list.svelte'
import AvailableTemplatesList from './available-templates-list.svelte'

  let view = $state<'templates' | 'mine'>('templates')
  let fileInput: HTMLInputElement

  onMount(() => {
    TemplateStore.init()
  })

  const newTemplate = () => {
    openTemplateEditor(new Template())
  }

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

      // Convert trackables to Trackable instances
      if (templateData.trackables && Array.isArray(templateData.trackables)) {
        templateData.trackables = templateData.trackables.map((t: any) =>
          t instanceof Trackable ? t : new Trackable(t)
        )
      }

      const template = new Template(templateData)
      await TemplateStore.upsert(template)
      openTemplateEditor(template)
      target.value = '' // Reset file input
    } catch (error) {
      console.error('Failed to upload template:', error)
      alert('Failed to upload template. Please ensure it\'s a valid template JSON file.')
    }
  }


</script>

<BackdropModal className="h-full" mainClass="bg-gray-100 dark:bg-gray-800">
  <header slot="header">
    <ToolbarGrid>
      <Button slot="left" primary clear on:click={() => closeTemplateManager()}>Close</Button>
      <Title>Templates</Title>
    </ToolbarGrid>
    <Toolbar>
      <ButtonGroup
        buttons={[
          {
            label: 'Available',
            active: view == 'templates',
            click() {
              view = 'templates'
            },
          },
          {
            label: 'Build',
            active: view == 'mine',
            click() {
              view = 'mine'
            },
          },
        ]}
      />
    </Toolbar>
  </header>
  <main class="lg:p-6 py-2">
    {#if view == 'mine'}
      <List solo>
        {#if !$TemplateStore.length}
          <Empty
            title="No custom templates found"
            buttonLabel="Create a Custom Template"
            buttonClick={() => newTemplate()}
          />
          <div class="py-4 px-4 text-center">
            <p class="text-gray-500 text-sm mb-2">Or</p>
            <button class="text-primary py-2 px-4" on:click={() => uploadTemplate()}> Upload Template </button>
          </div>
        {:else}
          <TemplateEditorList />
        {/if}
      </List>

      {#if $TemplateStore.length}
      <div class="py-2 px-4 flex justify-center gap-4">
        <button class="text-primary py-2 px-4" on:click={() => newTemplate()}> Create Template </button>
        <button class="text-primary py-2 px-4" on:click={() => uploadTemplate()}> Upload Template </button>
      </div>
      {/if}
      <input
        bind:this={fileInput}
        type="file"
        accept=".json"
        style="display: none"
        on:change={handleFileUpload}
      />
      
      <div class="px-4 py-4 text-center note-muted">
        Build a custom Nomie Configuration that can be downloaded and shared with others
      </div>
    {:else}
      <List solo>
        <AvailableTemplatesList />
      </List>
      <div class="px-4 py-4 text-center note-muted">Use templates to quickly setup Nomie.</div>
    {/if}
  </main>
</BackdropModal>
