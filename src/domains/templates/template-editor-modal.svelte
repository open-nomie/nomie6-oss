<script lang="ts">
  import { Template } from './templates-utils.ts'
  import { openTemplateEditor, TemplateStore } from './templates-svelte-helpers'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import Button from '../../components/button/button.svelte'
  import Title from '../../components/title/title.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import TemplateEditor from './template-editor.svelte'

  import { showToast } from '../../components/toast/ToastStore'

  export let id: string
  export let template: Template
  const close = () => {
    closeModal(id)
  }

  const save = async () => {
   
    await TemplateStore.upsert(template)
    showToast({ message: 'Template saved' })
  }
</script>

<BackdropModal className="h-full" mainClass="bg-gray-100 dark:bg-gray-800">
  <ToolbarGrid slot="header">
    <Button slot="left" primary clear on:click={() => close()}>Close</Button>
    <Title>{template.name || 'Create a Template'}</Title>
    <Button slot="right" primary clear on:click={() => save()}>Save</Button>
  </ToolbarGrid>
  <main class="lg:p-6 p-4">
    <TemplateEditor bind:template />
  </main>
</BackdropModal>
