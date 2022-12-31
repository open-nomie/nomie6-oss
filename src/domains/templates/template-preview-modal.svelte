<script lang="ts">
  import type { Template } from './templates-utils'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import Button from '../../components/button/button.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'

  import TemplateView from './template-view.svelte'

  export let id: string
  export let template: Template
  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal className="h-full" mainClass="bg-gray-100 dark:bg-gray-800">
  <ToolbarGrid slot="header">
    <Button slot="left" primary clear on:click={() => close()}>Close</Button>
  </ToolbarGrid>
  <main class="lg:p-6 p-4">
    <TemplateView bind:template />
  </main>
</BackdropModal>
