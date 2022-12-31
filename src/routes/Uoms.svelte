<script lang="ts">
  import Layout from '../domains/layout/layout.svelte'
  import ToolbarGrid from '../components/toolbar/toolbar-grid.svelte'
  // import UomsView from '../domains/uom/uoms-view.svelte'
  import Button from '../components/button/button.svelte'
  import IonIcon from '../components/icon/ion-icon.svelte'
  import { PlusIcon } from '../components/icon/nicons'
</script>

<Layout>
  <ToolbarGrid slot="header">
    <Button slot="left" icon on:click={() => {}}>
      <IonIcon icon={PlusIcon} className="text-primary-500" />
    </Button>
    <h1 class="ntitle">Units of Measure</h1>
  </ToolbarGrid>
  <!-- <UomsView /> -->
</Layout>
