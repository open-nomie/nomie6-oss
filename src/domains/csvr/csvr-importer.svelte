<script lang="ts">
  import { onMount } from 'svelte'

  import CSVRImport from './csvr-import'

  class CSVExporter {
    search: string
  }

  const state = {
    saved: [],
  }

  async function main() {
    let savedImports = await UserStore.mstore('csv_exports')
    state.saved = (savedImports || []).map((importConfig) => {
      return new CSVRImport(importConfig)
    })
  }
  onMount(main)
</script>

Import Builder
