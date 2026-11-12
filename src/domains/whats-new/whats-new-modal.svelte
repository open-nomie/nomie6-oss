<svelte:options runes={true} />

<script lang="ts">
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import NItem from '../../components/list-item/list-item.svelte'

  import Button from '../../components/button/button.svelte'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'

  import whatsNew from '../../config/whatsNew'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import { Lang } from '../../store/lang'
  import List from '../../components/list/list.svelte'

  let newfeatures = whatsNew.features.filter(feature => feature.version == whatsNew.version);
  let newfixes = whatsNew.fixes.filter(fix => fix.version == whatsNew.version);

  const versionDate = (version: string) => Number(version.match(/(\d{8})$/)?.[1] ?? 0)
  const versions: Array<string> = [...new Set([...whatsNew.features, ...whatsNew.fixes].map((item) => item.version))]
    .sort((a, b) => versionDate(b) - versionDate(a))
  const featuresOf = (version: string) => whatsNew.features.filter((feature) => feature.version == version)
  const fixesOf = (version: string) => whatsNew.fixes.filter((fix) => fix.version == version)

  let expanded = $state<Record<string, boolean>>({})
  const toggle = (key: string) => {
    expanded[key] = !expanded[key]
  }

  let showUpdates = $state(false)

  const { id } = $props()
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
      Nomie {import.meta.env.PACKAGE_VERSION} adds {newfeatures.length} features, and {newfixes.length} bug fixes.
    </div>
  {/if}
  {#if whatsNew && showUpdates}
    {#each versions as version}
      <List solo outside title={version}>
        {#if featuresOf(version).length}
          <NItem bottomLine={16} className="text-sm py-1" compact clickable on:click={() => toggle(`${version}:features`)}>
            {expanded[`${version}:features`] ? '▾' : '▸'} Features ({featuresOf(version).length})
          </NItem>
          {#if expanded[`${version}:features`]}
            {#each featuresOf(version) as feature}
              <NItem bottomLine={16} className="text-sm py-1 pl-6" compact>{feature.title}</NItem>
            {/each}
          {/if}
        {/if}
        {#if fixesOf(version).length}
          <NItem bottomLine={16} className="text-sm py-1" compact clickable on:click={() => toggle(`${version}:fixes`)}>
            {expanded[`${version}:fixes`] ? '▾' : '▸'} Bug Fixes ({fixesOf(version).length})
          </NItem>
          {#if expanded[`${version}:fixes`]}
            {#each fixesOf(version) as fix}
              <NItem bottomLine={16} className="text-sm py-1 pl-6" compact>{fix.title}</NItem>
            {/each}
          {/if}
        {/if}
      </List>
    {/each}
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
