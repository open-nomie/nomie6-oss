<script lang="ts">
	import { Prefs } from './../preferences/Preferences';
	import { PermissionsStore } from './../my-account/PermissionsStore';
  import { wait } from '../../utils/tick/tick'

  // Modules
  import ImportLoader from '../../modules/import/import-loader'

  import NItem from '../../components/list-item/list-item.svelte'

  // Stores
  import { Interact } from '../../store/interact'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { Lang } from '../../store/lang'
  import Button from '../../components/button/button.svelte'
  import ImporterItem from './importer-item.svelte'
  import ProgressBar from '../../components/progress-bar/progress-bar.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import Empty from '../../components/empty/empty.svelte'

  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { showToast } from '../../components/toast/ToastStore'
  import { importStorage } from '../storage/import-export'
  import DownloadOutline from '../../n-icons/DownloadOutline.svelte'
import UpgradeMessage from '../../components/upgrade-message/upgrade-message.svelte'

  export let id: string
  export let fileData: any = undefined

  // let fileInput // holder of dom element self

  let version = undefined // version we're dealing with
  let importingAll = false

  // Status of imports
  let importing = {
    boards: { running: false, done: false },
    locations: { running: false, done: false },
    goals: { running: false, done: false },
    logs: { running: false, done: false, progress: 0 },
    trackers: { running: false, done: false },
    people: { running: false, done: false },
    dashboards: { running: false, done: false },
    context: { running: false, done: false },
    all: { running: false, done: false },
  }

  const importLoader = new ImportLoader()

  let initialized = false
  $: if (fileData && !initialized) {
    methods.init()
  }

  const methods = {
    // Initialze once we have data.
    init() {
      initialized = true
      if (fileData.hasOwnProperty('nomie')) {
        // const importer = new Importer(fileData);
        try {
          importLoader.openPayload(fileData)
          version = importLoader.importer.version
        } catch (e) {
          console.error(e.message)
          Interact.alert('Error', e.message)
        }
      }
    },
    async finish() {
      // Get a new latest book
      await LedgerStore.getFirstDate(true)
      let confirmed = await Interact.confirm('Import Complete. Restart?', `It's best to reload Nomie after an import`)
      if (confirmed) {
        document.location.href = '/'
      }
    },
    // On Import File
    // Process the file - see if we can do anything with it.
    onImportFile(event) {
      // set reader and file
      let reader = new FileReader()
      let file = event.target.files[0]
      // file on loaded
      reader.onload = (theFile: any) => {
        try {
          fileData = JSON.parse(theFile.target.result)
          methods.init()
        } catch (e) {
          console.error(e)
          Interact.alert('Error', e.message)
        }
      }
      // Read the file
      reader.readAsText(file)
    },

    // Confirm Import Trackers

    async run(type: string, func: Function, prompt: boolean = false) {
      importing[type].running = true
      try {
        let proceed = true
        if (prompt) {
          proceed = await Interact.confirm(`Import ${type}?`, 'This action cannot be undone')
          await wait(200)
          if (proceed !== true) {
            importing[type].running = false
            importing[type].done = false
          }
        }
        if (proceed) {
          await func()
          importing[type].running = false
          importing[type].done = true
        }
      } catch (e) {
        console.error(type, e.message)
        Interact.alert('Error', e.message)
        importing[type].running = false
        importing[type].done = false
      }
    },
    async importTrackers(confirmation: boolean = false) {
      return await methods.run(
        'trackers',
        async () => {
          return await importLoader.importTrackers()
        },
        confirmation
      )
    },
    // Confirm Import Trackers
    async importDashboards(confirmation: boolean = false) {
      return await methods.run(
        'dashboards',
        async () => {
          return await importLoader.importDashboards()
        },
        confirmation
      )
    },

    async importPeople(confirmation: boolean = false) {
      return await methods.run(
        'people',
        async () => {
          return await importLoader.importPeople()
        },
        confirmation
      )
    },

    // Confirm Import Boards
    async importBoards(confirmation: boolean = false) {
      return await methods.run(
        'boards',
        async () => {
          return await importLoader.importBoards()
        },
        confirmation
      )
    },

    // Confirm Import logs
    async importLogs(confirmation: boolean = false) {
      return await methods.run(
        'logs',
        async () => {
          importing.logs.running = true
          return await importLoader.importLogs((progress) => {
            importing.logs.progress = progress.progress
            if (progress.step == progress.total) {
              importing.logs.done = true
              importing.logs.running = false
            }
          })
        },
        confirmation
      )
    },

    async importContext(confirmation: boolean = false) {
      return await methods.run(
        'context',
        async () => {
          return await importLoader.importContext()
        },
        confirmation
      )
    },

    async importLocations(confirmation: boolean = false) {
      return await methods.run(
        'locations',
        async () => {
          return await importLoader.importLocations()
        },
        confirmation
      )
    },
    // Confirm Import All
    async importAll() {
      let confirmed = await Interact.confirm('Confirm', 'Are you sure? Importing cannot be undone.')
      if (confirmed === true) {
        await wait(300)
        importingAll = true
        importing.all.running = true
        let statusMonitor = []
        try {
          // Let the importer Importer all
          await importLoader.importAll((status) => {
            // While importing each item (other than logs)
            if (status.importing) {
              importing[status.importing] = importing[status.importing] || {}
              importing[status.importing].running = true
              statusMonitor.push(status.importing)
              // Make sure other things are not in the running state.
              Object.keys(importing).forEach((item) => {
                if (status.importing !== item) {
                  importing[item].running = false
                  if (statusMonitor.indexOf(item) > -1) {
                    importing[item].done = true
                  }
                }
              })
            } else {
              // We're importing Logs
              if (status.progress) {
                importing.logs.progress = status.progress
              }
            }
          })
          Object.keys(importing).forEach((item) => {
            importing[item].done = true
          })
          importing.all.running = false
          importing.all.done = true
          importing.logs.done = true
          importing.logs.running = false
          importingAll = false
          showToast({ message: 'Import Finishing...' })
          await LedgerStore.getFirstDate(true)
          methods.finish()
        } catch (e) {
          console.error(e.message)
          Interact.alert('Error', e.message)
        }

        return true
      }
      return false
    },

    // Get Percentage between two numbers
  }

  const close = async () => {
    if (importing.logs.running) {
      const confirm = await Interact.confirm('Stop the import?')
      if (confirm) {
        window.location.reload()
      }
    } else {
      closeModal(id)
    }
  }
</script>

<BackdropModal>
  <ToolbarGrid slot="header">
    <Button clear on:click={close} primary slot="left">
      {Lang.t('general.close', 'Close')}
    </Button>
    <h1 class="ntitle sm">{Lang.t('settings.import', 'Import')}</h1>
    <div slot="right">
      {#if importingAll === true}
        <Button primary clear disabled className="whitespace-nowrap">
          {Lang.t('import.import-all', 'Import All')}
        </Button>
      {:else if version && !importing.all.running && !importing.all.done}
        <Button primary clear on:click={methods.importAll} className="whitespace-nowrap">
          {Lang.t('import.import-all', 'Import All')}
        </Button>
      {:else if importing.all.done}
        <Button primary clear on:click={methods.finish} className="whitespace-nowrap">
          {Lang.t('general.finished', 'Finished')}
        </Button>
      {/if}
    </div>
  </ToolbarGrid>



  {#if !$PermissionsStore.canWrite && $PermissionsStore.loggedIn && $Prefs.storageType == 'firebase'}
    <UpgradeMessage />
  {:else}
    {#if !fileData}
      <Empty
        className="my-5 text-center leading-tight"
        icon={DownloadOutline}
        description="Supports CSV files, Nomie backup files (all versions), and tracker packs."
        title={`Import a file`}
        buttonLabel={Lang.t('settings.select-nomie-file', 'Select File...')}
        buttonClick={() => {
          importStorage()
        }}
      >
        <!-- <input
          class="hidden"
          accept=".json,.nomiebk"
          type="file"
          bind:this={fileInput}
          on:change={methods.onImportFile}
        /> -->
      </Empty>
    {/if}
    <div class="n-list">
      {#if fileData && !version}
        <NItem
          title="Unknown/Invalid File"
          on:click={() => {
            fileData = null
          }}
        />
      {:else if fileData}
        <NItem className="item-divider compact bg-faded">
          From Nomie {fileData.nomie.number}
        </NItem>

        {#if (importLoader.normalized.logs || []).length > 0}
          <ImporterItem
            emoji="⏰"
            title="Logs"
            count={(importLoader.normalized.logs || []).length.toLocaleString()}
            bind:status={importing.logs}
            on:import={() => {
              methods.importLogs(true)
            }}
          >
            {#if importing.logs.running}
              <ProgressBar percentage={importing.logs.progress} className="mt-2 mr-2 h-2" />
            {/if}
          </ImporterItem>
        {:else}
          <ListItem bottomLine={48} title="Notes">
            <div slot="left">⏰</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- Importable Items -->
        {#if Object.keys(importLoader.normalized.trackers).length > 0}
          <ImporterItem
            emoji="🤪"
            title="Trackers"
            count={Object.keys(importLoader.normalized.trackers).length.toLocaleString()}
            bind:status={importing.trackers}
            on:import={() => {
              methods.importTrackers(true)
            }}
          />
        {:else}
          <ListItem bottomLine={48} title={Lang.t('general.trackers')}>
            <div slot="left">🤪</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- Importable Items -->
        {#if importLoader.normalized.goals?.length > 0}
          <ImporterItem
            emoji="🤪"
            title="Goals"
            count={importLoader.normalized.goals?.length.toLocaleString()}
            bind:status={importing.goals}
            on:import={() => {
              // methods.importTrackers(true)
            }}
          />
        {:else}
          <ListItem bottomLine={48} title={Lang.t('general.goals', 'Goals')}>
            <div slot="left">🏆</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- <ListItem bottomLine={48} title={Lang.t('general.goals', 'Goals')}>
          <div slot="left">🏆</div>
          <div slot="right" class="text-gray-500 pr-4">No Data</div>
        </ListItem> -->

        <!-- Locations -->
        {#if (importLoader.normalized.locations || []).length > 0}
          <ImporterItem
            emoji="🗺"
            title="Locations"
            count={(importLoader.normalized.locations || []).length.toLocaleString()}
            bind:status={importing.locations}
            on:import={() => {
              methods.importLocations(true)
            }}
          />
        {:else}
          <ListItem bottomLine={48} title={Lang.t('general.locations', 'Locations')}>
            <div slot="left">🗺</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- Board -->
        {#if (importLoader.normalized.boards || []).length > 0}
          <ImporterItem
            emoji="🗂"
            title={Lang.t('general.boards', 'Boards')}
            count={(importLoader.normalized.boards || []).length.toLocaleString()}
            bind:status={importing.boards}
            on:import={() => {
              methods.importBoards(true)
            }}
          />
        {:else}
          <ListItem bottomLine={48} title={Lang.t('general.boards', 'Boards')}>
            <div slot="left">🗂</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- People -->
        {#if (Object.keys(importLoader.normalized.people) || []).length > 0}
          <ImporterItem
            emoji="👩🏽‍💼"
            title={Lang.t('general.people', 'People')}
            count={(Object.keys(importLoader.normalized.people) || []).length.toLocaleString()}
            bind:status={importing.people}
            on:import={() => {
              methods.importPeople(true)
            }}
          />
        {:else}
          <ListItem bottomLine={48} title={Lang.t('general.people', 'People')}>
            <div slot="left">👩🏽‍💼</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- People -->
        {#if (importLoader.normalized.context || []).length > 0}
          <ImporterItem
            emoji="💭"
            title={Lang.t('general.context', 'Context')}
            count={(importLoader.normalized.context || []).length.toLocaleString()}
            bind:status={importing.context}
            on:import={() => {
              methods.importContext(true)
            }}
          />
        {:else}
          <ListItem bottomLine={48} title={Lang.t('general.context', 'Context')}>
            <div slot="left">💭</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- Dashboards -->
        {#if (importLoader.normalized.dashboards || []).length > 0}
          <ImporterItem
            emoji="📊"
            title={Lang.t('general.dashboards', 'Dashboards')}
            count={(importLoader.normalized.dashboards || []).length.toLocaleString()}
            bind:status={importing.dashboards}
            on:import={() => {
              methods.importDashboards(true)
            }}
          />
        {:else}
          <ListItem bottomLine={48} title={Lang.t('general.dashboards', 'Dashboards')}>
            <div slot="left">📊</div>
            <div slot="right" class="text-gray-500 pr-4">No Data</div>
          </ListItem>
        {/if}

        <!-- logs -->
      {/if}
    </div>
  {/if}
</BackdropModal>
