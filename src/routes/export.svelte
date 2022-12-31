<script lang="ts">
  //Vendors

  import { onMount } from 'svelte'

  // Modules

  // import Exporter from '../modules/export/export-helper'

  // Components

  import NBackButton from '../components/back-button/back-button.svelte'

  // containers
  import NLayout from '../domains/layout/layout.svelte'
  // config

  import { Lang } from '../store/lang'
  import Spacer from '../components/spacer/spacer.svelte'
  import Empty from '../components/empty/empty.svelte'

  import ToolbarGrid from '../components/toolbar/toolbar-grid.svelte'

  const methods = {
    export() {
      // Exporter()
    },
  }

  onMount(() => {})
</script>

<NLayout pageTitle="Export your Data" className="Export">
  <ToolbarGrid slot="header">
    <NBackButton slot="left" />
    <h1 class="ntitle">Generate Backup</h1>
  </ToolbarGrid>

  <div class=" backup">
    <Spacer gap={4} />
    <Empty
      title={Lang.t('export.export-date', 'Create a Backup')}
      description={Lang.t(
        'export.backup-description',
        'Export all your data as a single readable JSON file. This can be used to restore Nomie, or to inspect with your own programs.'
      )}
      emoji="📦"
      buttonLabel={Lang.t('export.backup-download', 'Download Backup')}
      buttonClick={methods.export}
    />
  </div>
</NLayout>
