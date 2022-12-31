<script lang="ts">
  import { onMount } from 'svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Layout from '../layout/layout.svelte'
  import {
    apiLogToNLog,
    CloudAPIStore,
    deleteFreshLog,
    importFreshLog,
    loadAPIKeys,
    loadFreshLogs,
  } from './CloudApiStore'
  import Container from '../../components/container/container.svelte'
  import CloudApiViewSetup from './cloud-api-view-setup.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Button from '../../components/button/button.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'

  import BackButton from '../../components/back-button/back-button.svelte'

  import ListItemLog from '../../components/list-item-log/list-item-log.svelte'

  import { Interact } from '../../store/interact'
  import ListItem from '../../components/list-item/list-item.svelte'
  import Card from '../../components/card/card.svelte'
  import { wait } from '../../utils/tick/tick'
import Spinner from '../../components/spinner/spinner.svelte'

  onMount(() => {
    loadAPIKeys()
    loadFreshLogs()
  })

  const clearImported = async () => {
    const confirmed = await Interact.confirm(
      `Delete ${$CloudAPIStore.imported.length} imported?`,
      'This cannot be undone, but since they have already been imported, it is most likely ok'
    )
    if (confirmed) {
      alert('Do it!')
    }
  }

  let refreshing:boolean = false;
  const refresh = async ()=>{
    refreshing = true;
    loadFreshLogs();
    await wait(1000);
    refreshing = false;
  }



  // $: if ($CloudAPIStore.view === 'imported') {
  //   loadArchivedLogs()
  // }
</script>

<Layout>
  <header slot="header">
    <ToolbarGrid>
      <BackButton to="/settings" slot="left" />
      <h1 class="ntitle">Nomie API</h1>
    </ToolbarGrid>
    <Toolbar>
      <ButtonGroup
        className="max-w-screen-md mx-auto"
        buttons={[
          {
            label: 'Setup',
            active: $CloudAPIStore.view === 'setup',
            click() {
              $CloudAPIStore.view = 'setup'
            },
          },
          {
            label: 'New',
            active: $CloudAPIStore.view === 'fresh',
            badge: $CloudAPIStore.fresh.length ? `${$CloudAPIStore.fresh.length}` : undefined,
            click() {
              $CloudAPIStore.view = 'fresh'
            },
          },
          // {
          //   label: 'Imported',
          //   active: $CloudAPIStore.view === 'imported',
          //   click() {
          //     $CloudAPIStore.view = 'imported'
          //   },
          // },
        ]}
      />
    </Toolbar>
  </header>
  <main>
    <Container>
      {#if $CloudAPIStore.view == 'setup'}
        <div class="px-4">
          <CloudApiViewSetup />
        </div>
      {/if}

      {#if $CloudAPIStore.view == 'fresh'}
        <div class="py-4 px-4">
          {#if $CloudAPIStore.fresh.length === 0}
            <div class="text-center flex items-center justify-center flex-col font-lg py-10 px-4 text-gray-800 dark:text-gray-200">
              <h1 class="font-bold text-lg mb-1 w-full">No API Notes found</h1>
              <div class="text-xs text-gray-500 px-10 w-full">
                Submit a request using the API, see the Setup tab for an example.
              </div>
            </div>
          {:else}
            {#each $CloudAPIStore.fresh as apiLog, index}
              <Card className="mb-4">
                {#if !apiLog.encrypted && apiLog.log?.note}
                  <ListItemLog log={apiLogToNLog(apiLog)} />
                {:else if apiLog.encrypted}
                  <ListItem>Unable to Decrypt this encrypted note</ListItem>
                {:else}
                  <ListItem>
                    <h3>Problem reading log</h3>
                    <p class="font-mono text-xs">{JSON.stringify(apiLog.log)}</p>
                  </ListItem>
                {/if}
                <div class="flex py-1 pr-2 items-center justify-between">
                  <Button className="text-red-500" type="clear" on:click={() => deleteFreshLog(apiLog)}>Delete</Button>
                  {#if !apiLog.encrypted}
                    <Button primary
                      on:click={async () => {
                        Interact.blocker('Importing...')
                        await importFreshLog(apiLog)
                        await wait(100)
                        Interact.stopBlocker()
                      }}
                      className="text-primary-500">Import</Button
                    >
                  {/if}
                </div>
              </Card>
            {/each}
          {/if}
        </div>
        <div class="text-center w-full flex justify-center mb-4">
          {#if !refreshing}
          <Button className="mt-4" on:click={()=>{
            refresh()
          }} primary>Refresh</Button>
          {:else}
            <div class="mt-4" />
            <Spinner size={40} />
          {/if}
        </div>
      {:else if $CloudAPIStore.view == 'imported'}
        <div class="px-4 pt-4">
          {#if $CloudAPIStore.imported.length === 0}
            <div class="text-center font-lg p-10 text-gray-800 dark:text-gray-200">
              <h1 class="font-bold text-lg mb-1">No recent Imports</h1>
              <div class="text-xs text-gray-500 px-10">
                Looks like there's not much here! Go forth and post those API Requests.
              </div>
            </div>
          {:else}
            <Button clear className="text-red-500 w-full text-center -mt-4 mb-2" on:click={clearImported}
              >Clear All Imported...</Button
            >
            {#each $CloudAPIStore.imported as apiLog, index}
              <Card className="mb-2">
                {#if !apiLog.encrypted}
                  <ListItemLog log={apiLog.log} />
                {:else}
                  <ListItem>Unable to Decrypt this encrypted note</ListItem>
                {/if}
              </Card>
              <div class="h-5" />
            {/each}
          {/if}
        </div>
      {/if}
    </Container>
  </main>
</Layout>
