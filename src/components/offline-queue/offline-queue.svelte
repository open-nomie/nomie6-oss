<script lang="ts">
  import { OfflineQueue } from '../../store/offline-queue-store'
  import Text from '../text/text.svelte'
  import Spinner from '../spinner/spinner.svelte'
  import { Device } from '../../store/device-store'
  import { Lang } from '../../store/lang'
  import Button from '../button/button.svelte'

  import List from '../list/list.svelte'
  import ListItemLog from '../list-item-log/list-item-log.svelte'
  import { TrashOutline } from '../icon/nicons'
  import IonIcon from '../icon/ion-icon.svelte'

  // declare var window: any;
  let showLogs: boolean = false
</script>

{#if $OfflineQueue.logs && $OfflineQueue.logs.length}
  <div class="mx-auto">
    <div class="items-center flex justify-center">
      <div class="filler" />
      <Button
        className={`offline-queue-button ${showLogs ? 'active' : ''}`}
        shape="round"
        size="sm"
        color="light"
        on:click={() => {
          showLogs = !showLogs
        }}
      >
        {#if $OfflineQueue.status !== 'syncing'}
          <Text inline size="sm" faded>
            {$OfflineQueue.logs.length}
            {$OfflineQueue.logs.length > 1 ? 'logs' : 'log'} in the offline queue.
          </Text>
          {#if !$Device.offline}
            <Text inline underline color="primary-bright" className="ml-2" size="sm" on:click={OfflineQueue.sync}>
              {Lang.t('general.sync-now', 'Sync')}
            </Text>
            <Text inline color="fill-solid-3" className="ml-2" size="sm">or</Text>
            <Button size="sm" icon on:click={OfflineQueue.clear}>
              <IonIcon icon={TrashOutline} />
            </Button>
          {:else}
            <Text inline className="ml-2" size="sm">Offline</Text>
          {/if}
        {:else}
          <Text size="sm">
            <Spinner size={16} />
            Syncing...
          </Text>
        {/if}
      </Button>
      <div class="filler" />
    </div>
  </div>
  {#if showLogs}
    <List className="bg-transparent container-sm">
      {#each $OfflineQueue.logs as log}
        <ListItemLog {log} hideMore={true}>
          <div slot="more" class="ml-4">
            <Button
              icon
              on:click={() => {
                OfflineQueue.removeLog(log)
              }}
            >
              <IonIcon icon={TrashOutline} size={24} className="text-red-500" />
            </Button>
          </div>
        </ListItemLog>
      {/each}
    </List>
  {/if}
{/if}

<style global>
  .offline-queue-button.active {
    border: solid 1px var(--color-primary-bright) !important;
  }
</style>
