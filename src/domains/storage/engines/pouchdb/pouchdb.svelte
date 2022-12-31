<script lang="ts">
  import { onMount } from 'svelte'
  import ListItem from '../../../../components/list-item/list-item.svelte'
  import Input from '../../../../components/input/input.svelte'
  import NSpinner from '../../../../components/spinner/spinner.svelte'
  import ToggleSwitch from '../../../../components/toggle-switch/toggle-switch.svelte'

  import { Lang } from '../../../../store/lang'
  import { Interact } from '../../../../store/interact'
  import Storage from '../../storage'
  import Remote from '../../../../modules/remote/remote'
  import URLParser from '../../../../utils/url-parser/url-parser' // Get URL Parser
  import Button from '../../../../components/button/button.svelte'

  import Divider from '../../../../components/divider/divider.svelte'

  import PouchDB from 'pouchdb'

  let pouchEngine // Holder for the pouchEngine
  let connecting = false

  let isOpen = false

  let state: any = {
    engine: null,
    isValidSyncURL: false,
    form: {
      username: null,
      password: null,
      host: null,
      database: null,
    },
    success: false,
    syncing: false,
    canSync: false,
  }

  const methods = {
    // Initialize Pouch DB
    init() {
      // Get Remote from Local STorage.
      if (state.remote.isValid()) {
        state.form.host = state.remote.url.toString()
        state.form.username = state.remote.username
        state.form.password = state.remote.password
        state.form.database = state.remote.database
        state.canSync = true
      }
    },
    isValidURL() {
      let url = URLParser(state.form.host)
      return url.valid
    },
    isSyncing() {
      return pouchEngine.syncer !== null
    },
    saveRemote() {
      let remote = new Remote({
        url: state.form.host,
        database: state.form.database,
        username: state.form.username || ''.length ? state.form.username : null,
        password: state.form.password || ''.length ? state.form.password : null,
        syncEnabled: true,
      })
      state.canSync = true
      state.remote = remote
      pouchEngine.saveRemote(remote)
    },
    startSync() {
      state.syncing = true
      state.remote.syncEnabled = true
      pouchEngine.saveRemote(state.remote)
      pouchEngine.startSync()
    },
    stopSync() {
      state.syncing = false
      pouchEngine.stopSync()
      state.remote.syncEnabled = false
    },
    async connect() {
      try {
        connecting = true
        let connection = methods.getConnectionURL()
        // Make a connection to pouch
        let testOptions = {}
        if (state.form.username || state.form.password) {
          testOptions = {
            auth: {
              username: state.form.username,
              password: state.form.password,
            },
          }
        }
        let testPouch = new PouchDB(connection, testOptions)
        // Try and get info
        let test = await testPouch.info()
        console.info(test)

        // Confirm that we should save it - if it doesn't error
        let shouldSave = await Interact.confirm(
          Lang.t('general.success'),
          'Connected successfully! Would you like to save this connection?'
        )
        // If should save
        if (shouldSave) {
          methods.saveRemote()
          setTimeout(() => {
            methods.startSync()
            state.syncing = true
            state.remote.syncEnabled = true
          }, 120)
        }
        connecting = false
      } catch (e) {
        console.error('error connecting', e.message)
        Interact.alert(Lang.t('general.error-connecting', 'Error Connecting'), e.message)
        connecting = false
      }
    },
    /**
     * Generate a Connection URL for Pouch
     * offer a mask param to hide the password
     */
    getConnectionURL(mask = false) {
      // Remove Password with Stars
      let dotted = (str) => {
        return '🔑'
        // return str;
      }
      // Parse the current URL
      try {
        // let urlDetails = new URL(state.form.host);
        let urlDetails = URLParser(state.form.host)
        state.isValidSyncURL = urlDetails.valid
        let connection = `${urlDetails.url.protocol}//`
        const username = state.form.username || ''
        const password = state.form.password || ''
        let auth = ''
        if (mask && (username.length || password.length)) {
          auth = `${username}:${dotted(password)}@`
        } else if (username.length || password.length) {
          auth = `${username}:${password}@`
        }
        connection = `${connection}${auth}${urlDetails.url.host || ''}/${state.form.database || ''}`
        return connection
      } catch (e) {
        state.isValidSyncURL = false
        return ''
      }
    },
  }

  // Watch Form and Connection String
  let connectionString = null

  let lastHost = null
  $: if (state.form.host && state.form.host !== lastHost) {
    lastHost = state.form.host
    connectionString = methods.getConnectionURL(true)
  }

  let lastDatabase = null
  $: if (state.form.database && state.form.database !== lastDatabase) {
    lastDatabase = state.form.database
    connectionString = methods.getConnectionURL(true)
  }

  let lastUsername = null
  $: if (state.form.username && state.form.username !== lastUsername) {
    lastUsername = state.form.username
    connectionString = methods.getConnectionURL(true)
  }

  let lastPassword = null
  $: if (state.form.password && state.form.password !== lastPassword) {
    lastPassword = state.form.password
    connectionString = methods.getConnectionURL(true)
  }

  onMount(async () => {
    // Get Pouch ENgine
    pouchEngine = Storage.getEngine()
    // Get Remote Settings
    //@ts-ignore
    state.remote = pouchEngine.getRemote()
    // Wait for it to be ready
    pouchEngine.onReady(() => {
      // Wait for syncer to turn on
      setTimeout(() => {
        // are we syncing?
        state.syncing = pouchEngine.syncer !== null
      }, 500)
    })
    // Fire of Initialization
    methods.init()
  })
</script>

{#if pouchEngine}
  <div class="pouchdb storage-option">
    {#if state.canSync}
      <ListItem
        title="Sync"
        on:click={() => {
          isOpen = !isOpen
        }}
      >
        <div slot="left" class={!state.remote.syncEnabled ? 'opacity-20' : ''}>♻️</div>
        <div class="line-clamp-1 text-xs text-gray-500">{connectionString}</div>
        <div slot="right">
          <ToggleSwitch
            bind:value={state.remote.syncEnabled}
            on:change={(event) => {
              if (event.detail == false) {
                methods.stopSync()
              } else if (event.detail === true) {
                methods.startSync()
              }
            }}
          />
        </div>
      </ListItem>
    {/if}

    {#if !state.syncing || isOpen}
      <Input
        listItem
        type="text"
        bind:value={state.form.host}
        label="Server URL"
        placeholder="https://my-couch-server:12345"
        autocomplete="off"
        autocorrect="false"
        autocapitalize="off"
      />
      <Divider left={16} />
      <Input
        listItem
        type="text"
        bind:value={state.form.database}
        placeholder="Database Name"
        autocomplete="off"
        autocorrect="false"
        autocapitalize="off"
      />
      <Divider left={16} />
      <div class="grid grid-cols-2">
        <Input
          listItem
          className="mr-1 w-50"
          autocomplete="off"
          autocorrect="false"
          autocapitalize="off"
          type="email"
          placeholder="Username"
          bind:value={state.form.username}
        />
        <Input
          listItem
          className="mr-1 w-50"
          autocomplete="off"
          autocorrect="false"
          autocapitalize="off"
          type="password"
          placeholder="Password"
          bind:value={state.form.password}
        />
      </div>
      <Divider left={16} />
      <div class="grid grid-cols-1 xl:grid-cols-2 px-4 mt-4 items-center">
        <div class="connection-string text-gray-500 text-sm py-2">
          {#if connectionString}
            {connectionString}
          {:else}
            No Connection String
          {/if}
        </div>
        <div class="actions mb-4">
          {#if state.isValidSyncURL}
            {#if !connecting}
              <Button block className="bg-primary-500 text-white font-bold" on:click={methods.connect}
                >Connect...</Button
              >
            {:else}
              <Button block className="bg-primary-500 text-white font-bold">
                <NSpinner size={20} />
                Connecting...
              </Button>
            {/if}
          {:else}
            <Button
              disabled
              block
              className="bg-gray-100 dark:bg-gray-900 text-gray-500 font-bold"
              on:click={methods.connect}>Connect...</Button
            >
          {/if}
        </div>
      </div>
    {/if}
    <!-- end data-sync-enabled-->
  </div>
{/if}
