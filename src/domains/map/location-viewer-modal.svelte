<script lang="ts">
  import Button from '../../components/button/button.svelte'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import Map from './map.svelte'
  import type { GeoType } from './LocationModalStore'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import type NLog from '../nomie-log/nomie-log'
import Title from '../../components/title/title.svelte';

  export let id: string
  export let locations: Array<GeoType>
  export let logs: Array<NLog>

  // export let show = false

  // let locations: Array<GeoType> = []

  // $: if ($LocationViewerModalStore) {
  //   locations = $LocationViewerModalStore.geo
  // }

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal>
  <ToolbarGrid slot="header" className="bg-white dark:bg-black shadow-md z-40 relative">
    <div slot="left">
      <Button on:click={() => close()} primary clear>Close</Button>
    </div>
    <Title className="line-clamp-1">
      {#if locations.length}{locations[0].name}{/if}
    </Title>
    <div slot="right" />
  </ToolbarGrid>
  <div class="relative flex-grow h-full">
    <Map {locations} records={logs} />
  </div>
  <div class="mt-2" slot="footer" />
</BackdropModal>
