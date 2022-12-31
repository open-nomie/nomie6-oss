<script lang="ts">
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'
  import CloseButton from '../../components/button/close-button.svelte'
  import Title from '../../components/title/title.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { wait } from '../../utils/tick/tick'
  import PluginFrame from './plugin-frame.svelte'
  import type { PluginClass } from './plugin-helpers'

  export let plugin: PluginClass
  export let id: string
</script>

<BackdropModal>
  <ToolbarGrid slot="header">
    <Button
      clear
      primary
      slot="left"
      on:click={() => {
        wait(10).then(() => {
          closeModal(id)
        })
      }}>Exit</Button
    >
    <Title>{plugin.name}</Title>
  </ToolbarGrid>
  <PluginFrame lid="modal" openAction="onUIOpened" {plugin} />
</BackdropModal>
