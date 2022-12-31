<script lang="ts">
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import NItem from '../../components/list-item/list-item.svelte'

  import Button from '../../components/button/button.svelte'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'

  import whatsNew from '../../config/whatsNew'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import { Lang } from '../../store/lang'
  import List from '../../components/list/list.svelte'

  export let id: string

  let showFixes = false
  let showUpdates = false
</script>

<BackdropModal>
  <header slot="header">
    <ToolbarGrid>
      <div slot="left">
        <Button
          clear
          primary
          on:click={() => {
            closeModal(id)
          }}
        >
          {Lang.t('general.close', 'Close')}
        </Button>
      </div>
      <h2 class="ntitle">Nomie {import.meta.env.PACKAGE_VERSION}</h2>
    </ToolbarGrid>
  </header>
  {#if whatsNew && !showUpdates}
    <div class="p-6 text-gray-800 dark:text-gray-200">
      Nomie {import.meta.env.PACKAGE_VERSION} adds {whatsNew.features.length} features, and {whatsNew.fixes.length} bug fixes.
    </div>
  {/if}
  {#if whatsNew && showUpdates}
    {#if whatsNew.features.length}
      <List solo outside title="Features">
        {#each whatsNew.features as feature}
          <NItem bottomLine={16} className="text-sm py-1" compact>
            <!-- <div slot="left" class="text-faded-2">{feature.version}</div> -->
            {feature.title}
          </NItem>
        {/each}
      </List>
    {/if}
    {#if whatsNew.fixes.length}
      <List outside solo title="Bug Fixes">
        <Button slot="header-right" on:click={() => (showFixes = true)} clear primary size="sm">Show Fixes</Button>
        {#if showFixes}
          {#each whatsNew.fixes as fix}
            <NItem bottomLine={16} className="text-sm py-1" compact>{fix.title}</NItem>
          {/each}
        {/if}
      </List>
    {/if}
  {/if}
  <footer slot="footer" class="flex-shrink-0 p-4">
    {#if !showUpdates}
      <Button
        block
        color="primary"
        on:click={() => {
          showUpdates = true
        }}>View Changes</Button
      >
    {/if}
  </footer>
</BackdropModal>
