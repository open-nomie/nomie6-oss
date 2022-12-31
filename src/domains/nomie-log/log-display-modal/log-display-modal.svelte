<script lang="ts">
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'

  import Button from '../../../components/button/button.svelte'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import { CloseOutline } from '../../../components/icon/nicons'
  import ListItemLog from '../../../components/list-item-log/list-item-log.svelte'
  
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import Map from '../../map/map.svelte'
import { getDateFormats } from '../../preferences/Preferences'
  import type NLog from '../nomie-log'

  export let id: string
  export let log: NLog

  let dateFormats = getDateFormats();

  const close = async () => {
    closeModal(id)
  }
</script>

<BackdropModal mainClass="overflow-y-auto relative" className="h-full bg-gray-100 dark:bg-gray-900 w-full rounded-2xl">
  <ToolbarGrid slot="header" shadow>
    <Button icon on:click={() => close()} slot="left">
      <IonIcon icon={CloseOutline} className="text-primary-500" />
    </Button>
    <h2 class="line-clamp-1 text-black dark:text-white whitespace-normal leading-tight text-base font-semibold">
      {log.endDayjs().format(`ddd ${dateFormats.date} ${dateFormats.time}`)}
    </h2>
  </ToolbarGrid>
  {#if log.lat}
    <div class="sticky top-0 left-0 right-0 w-full z-40 stiff">
      <Map className="shadow-md" records={[log]} height={152} />
    </div>
    <!-- <div class="flex-shrink-0 bg-green-500 stiff" style="min-height:152px; max-height:152px;">Hi there</div> -->
  {/if}
  <div class="p-4 relative z-50">
    <ListItemLog {log} />
  </div>
</BackdropModal>
