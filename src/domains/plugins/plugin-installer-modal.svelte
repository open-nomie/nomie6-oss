<script lang="ts">
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import CloseButton from '../../components/button/close-button.svelte'
  import Title from '../../components/title/title.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { wait } from '../../utils/tick/tick'
  import PluginInstaller from './plugin-installer.svelte'
  import { closePluginInstaller } from './PluginStore'

  export let id: string
  export let url: string
</script>

<BackdropModal mainClass="px-4 py-4">
  <ToolbarGrid slot="header">
    <CloseButton
      slot="left"
      on:click={() => {
        wait(10).then(() => {
          closeModal(id)
        })
      }}
    />
    <Title>Install a Plugin</Title>
  </ToolbarGrid>
  <PluginInstaller
    {url}
    on:cancel={() => {
      closePluginInstaller()
    }}
    on:installed={() => {
      closePluginInstaller()
    }}
  />

  <p class="text-description text-xs text-center mt-4">
    Plugins are externally hosted websites that can communicate back and forth with Nomie. Plugins are responsible for
    their own privacy policy.
  </p>
  {#if url}<p class="text-xs text-black dark:text-white mt-2 text-center">Source: {new URL(url).origin}</p>{/if}
  <p class="text-xs text-red-500 mt-2 text-center">Only install plugins from sources that you trust.</p>
</BackdropModal>
