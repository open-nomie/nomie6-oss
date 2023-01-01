<script lang="ts">
  import { useStorageSelectMenu } from './settings-functions'

  import ListItem from '../../components/list-item/list-item.svelte'
  import { Lang } from '../../store/lang'

  // import PouchDBOptions from '@/components/storage/pouchdb.svelte'

  import List from '../../components/list/list.svelte'

  import { navigate } from 'svelte-navigator'

  import { Prefs, saveStorageType } from '../preferences/Preferences'
  import { wait } from '../../utils/tick/tick'
  import { Device } from '../../store/device-store'
  import { Interact } from '../../store/interact'
  import Divider from '../../components/divider/divider.svelte'

  import { TrackableStore } from '../trackable/TrackableStore'

  import { updateAllLastUsed } from '../usage/UsageStore'
  import PouchdbSettings from '../storage/engines/pouchdb/pouchdb.svelte'
  import { getStorageEngineDetails, StorageEngineType } from '../storage/storage'

  import { showImportModal } from '../import-export/ImporterStore'
  import { showToast } from '../../components/toast/ToastStore'

  import BackupListItems from '../../components/backup-message/backup-list-items.svelte'

  // let fileInputF
  // let showImporter = false

  // const dispatch = createEventDispatcher()

  const updateLastUsedDates = async () => {
    const confirmed = await Interact.confirm(
      'Update all streaks and last used data?',
      `Depending on how much you track, this can take a while.`
    )
    if (confirmed) {
      await wait(100)
      Interact.blocker('Analyzing Usage Data...')
      await updateAllLastUsed($TrackableStore.trackables)
      Interact.stopBlocker()
      showToast({ message: 'Update Complete' })
    }
  }

  const showStorageOptions = () => {
    useStorageSelectMenu({
      current: $Prefs.storageType,
      async onSelect(storage: any) {
        const confirmed = await Interact.confirm(
          'Switch storage?',
          'You can always switch back. No data is shared between storage types.'
        )

        if (confirmed) {
          saveStorageType(storage)
          await wait(500)
          Device.reload()
        }
      },
    })
  }

  let storageDetails: StorageEngineType
  $: {
    storageDetails = getStorageEngineDetails($Prefs.storageType)
  }
</script>

<List solo className="mb-4" title={Lang.t('settings.my-data', 'My Data')} outside>
  <!-- <Button clear primary slot="header-right" on:click={showStorageOptions}>
    {storageDetails.shortName}
    <IonIcon icon={ChevronDownOutline} size={14} className="ml-2 text-black dark:text-white" />
  </Button> -->
  <ListItem on:click={showStorageOptions} detail>
    <span slot="left">
      {#if $Prefs.storageType === 'local'}
        🗄
      {:else if $Prefs.storageType === 'firebase'}
        ☁️
      {:else if $Prefs.storageType == 'pouchdb'}
        🛋
      {/if}
    </span>
    <div class="font-semibold leading-tight">Stored on {storageDetails.name}</div>
    <div class="text-xs text-gray-500 line-clamp-2 leading-tight mt-1">{storageDetails.description}</div>
  </ListItem>
  {#if $Prefs.storageType === 'pouchdb'}
    <Divider left={32} />
    <PouchdbSettings />
  {/if}
</List>

<!-- {#if $Prefs.storageType === 'local'}
  <p class="list-note -mt-2">
    Want your Nomie data multiple devices? Switch to Nomie Cloud, and for a small fee, your data will be stored fully
    encrypted, in the cloud.
  </p>
{/if} -->

<BackupListItems />

<List solo className="mb-3 mt-4" outside>
  <ListItem
    bottomLine={16}
    detail
    title={Lang.t('general.import-data', 'Import Data')}
    on:click={() => {
      showImportModal()
    }}
  >
    <div slot="right" class="opacity-50 text-sm">CSV or Nomie Backup</div>
  </ListItem>

  <ListItem bottomLine={16} detail title={Lang.t('settings.download-csv', 'Download CSV')} to="/settings/export/csv" />
</List>
<List solo className="mb-3" outside>
  <ListItem
    bottomLine={16}
    detail
    title={Lang.t('general.browse-files', 'Browse Files')}
    on:click={() => {
      navigate('/files')
    }}
  />

  <ListItem
    bottomLine={16}
    detail
    clickable
    title={Lang.t('settings.update-last-used-date', 'Update Last-Used Dates')}
    on:click={updateLastUsedDates}
  />
</List>
<!-- <p class="list-note -mt-2 mb-2">
  {Lang.t(
    'general.update-last-used-description',
    `When you delete a note, Nomie sometimes loses track of when a tracker, person, or context was last used. Use 'Update Last-Used Dates'  to update all of the last-used dates and values from the previous year.`
  )}
</p> -->
<!-- 
<List transparent className=" px-2" outside title={Lang.t('settings.import-export', 'Import / Export')}>
  <p slot="subheader" class="list-note -mt-2">
    Exporting will back-up all of your Nomie data into a single JSON file, that can be imported later.
  </p>
  <div class="p-2 grid grid-cols-2 gap-2">
    
    <Button
      role="menuitem"
      
      className="dark:bg-gray-900 bg-white text-black dark:text-white"
      title={`${Lang.t('settings.import', 'Import')}`}
      on:click={() => {
        showImportModal()
      }}
    >
      <IonIcon icon={DownloadOutline} className="mr-2" size={20} /> {Lang.t('settings.import', 'Import')}</Button
    >
    
    <Button
      role="menuitem"
      
      className="dark:bg-gray-900 bg-white text-black dark:text-white"
      title={Lang.t('settings.export', 'Export')}
      on:click={() => generateBackup()}
    >
      <IonIcon icon={ShareOutline} className="mr-2" size={20} />
      {Lang.t('settings.export', 'Export')}
    </Button>
  </div>
</List> -->

<!-- {#if $Prefs.storageType === 'firebase'}
  <List solo>
    <ListItem
      detail
      clickable
      title={Lang.t('settings.log-cache', 'Log Cache')}
      description="Did you lose some data? Check the Log cache, a backup copy of your note might be in there."
      on:click={openLogCacheModal}
    />
  </List>
{/if} -->
