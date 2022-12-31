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

  import { onMount } from 'svelte'
  import ListItem from '../../components/list-item/list-item.svelte'

  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
import TemplateEditorList from './template-editor-list.svelte'
import AvailableTemplatesList from './available-templates-list.svelte'

  let view: 'templates' | 'mine' = 'templates'

  onMount(() => {
    TemplateStore.init()
  })

  const newTemplate = () => {
    openTemplateEditor(new Template())
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
        {:else}
          <TemplateEditorList />
        {/if}
      </List>

      {#if $TemplateStore.length}
      <div class="py-2 px-4 flex justify-center">
        <button class="text-primary py-2 px-4" on:click={() => newTemplate()}> Create Template </button>
      </div>
      {/if}
      
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
