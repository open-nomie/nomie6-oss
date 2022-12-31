<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import SvelteMarkdown from 'svelte-markdown'

  import Avatar from '../../components/avatar/avatar.svelte'

  import Button from '../../components/button/button.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'

  import List from '../../components/list/list.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import Title from '../../components/title/title.svelte'
  import { showToast } from '../../components/toast/ToastStore'
  import nid from '../../modules/nid/nid'
  import { Interact } from '../../store/interact'
  import is from '../../utils/is/is'
  import { wait } from '../../utils/tick/tick'

  import { randomEmoji } from '../tracker/editor/TrackerEditorStore'
  import { trackEvent } from '../usage/stat-ping'
  import { PluginClass, PluginType } from './plugin-helpers'
  import { broadcastPluginMessage, PluginStore } from './PluginStore'

  export let url: string
  let id: string
  let pluginDetails: any | PluginType = {}
  let loading: boolean = false

  let lastURL: string
  let showInstallCard: boolean = false

  $: if (url && url !== lastURL && is.url(url)) {
    lastURL = url
    id = nid(url)
    pluginDetails.id = id
    pluginDetails.url = url
    pluginDetails.name = undefined
    showIframe = false
  }

  const clearPluginDetail = (clearURL: boolean = false) => {
    if (clearURL) {
      url = ''
    }
    showIframe = false
    pluginDetails = {}
    showInstallCard = false
  }

  let showIframe: boolean = false

  const messageListener = (evt) => {
    if (evt.data.action === 'register') {
      let payload = evt.data.data

      if (payload) {
        pluginDetails = { ...pluginDetails, ...payload }
        pluginDetails.description = payload.description
        pluginDetails.emoji = payload.emoji || randomEmoji()
        pluginDetails.name = payload.name
        pluginDetails.addToCaptureMenu = payload.addToCaptureMenu
        pluginDetails.version = payload.version
        pluginDetails.uses = payload.uses || []
      }

      const plugin = new PluginClass(pluginDetails)

      broadcastPluginMessage({
        action: 'registered',
        data: plugin,
      })
    }
  }

  const loadPlugin = async () => {
    loading = true
    showIframe = false
    await wait(100)
    showIframe = true
    await wait(500)
    showInstallCard = true
  }

  onMount(() => {
    window.addEventListener('message', messageListener)
    console.log('Plugin installer mounted', url)
    if (url && is.url(url)) {
      loadPlugin()
    }
  })

  const installPluginDetails = async () => {
    const plugin = new PluginClass(pluginDetails)
    trackEvent(`in-plugin-${plugin.url}`)
    if (plugin.name) {
      PluginStore.upsert(plugin)
      let confirmEnabled = await Interact.confirm(
        `Enabled ${plugin.name}?`,
        `${plugin.name} was installed successfully. Would you like to enabled it now?`
      )
      if (confirmEnabled) {
        plugin.active = true
        await PluginStore.upsert(plugin)
        showToast({ message: `${plugin.name} enabled` })
      }
      emit('installed')
      clearPluginDetail(true)
    }
  }

  const iframeError = (e) => {
    Interact.error(`${e}`)
  }

  const iframeLoaded = async () => {
    await wait(500)
    loading = false
    if (!pluginDetails.name) {
      Interact.error(`Unable to load that Plugin. Check its URL and try again.`)
    }
  }

  const emit = createEventDispatcher()
</script>

{#if showInstallCard && pluginDetails && pluginDetails.name}
  <List solo className="mt-4">
    <ListItem bottomLine={78}>
      <Title className="flex items-center space-x-2 mb-2">
        <Avatar emoji={pluginDetails.emoji} size={32} />
        <span class="leading-tight">{pluginDetails.name}</span>
        <div class="filler" />
        <span class="faded-badge stiff">v{pluginDetails.version}</span>
      </Title>
      <SvelteMarkdown source={pluginDetails.description} />
    </ListItem>
    <ListItem bottomLine={1}>
      <div class="text-xs grid grid-cols-3 lg:grid-cols-5 gap-1">
        {#each pluginDetails.uses as use}
          <div class="faded-badge text-center">{use}</div>
        {/each}
        {#if pluginDetails.addToCaptureMenu}
          <div class="faded-badge text-center">menu item</div>
        {/if}
        {#if pluginDetails.addToWidgets}
          <div class="faded-badge text-center">widget</div>
        {/if}
      </div>
    </ListItem>
    <ListItem bottomLine={1} on:click={installPluginDetails}>
      <div class="text-primary w-full text-center">Install Plugin</div>
    </ListItem>
    <ListItem
      on:click={() => {
        emit('cancel')
      }}
    >
      <div class="text-red-500 w-full text-center">Cancel</div>
    </ListItem>
  </List>
{:else}
  <List solo outside className="mb-4">
    <Input
      autocorrect={false}
      autocapitalize={false}
      label="Plugin URL"
      placeholder="https://url-to-plugin"
      help="Full url to the plugin"
      type="url"
      listItem
      bind:value={url}
    >
      <Button primary disabled={!is}>Load</Button>
    </Input>
    <Divider left={16} />
    {#if !pluginDetails.name}
      <ListItem clickable on:click={loadPlugin} disabled={!is.url(url) || loading}>
        <div class="text-primary w-full flex items-center justify-center text-center space-x-2">
          {#if loading}
            <Spinner size={20} />
            <span>Loading Plugin...</span>
          {:else}
            <span>Load Plugin</span>
          {/if}
        </div>
      </ListItem>
    {/if}
  </List>
{/if}
{#if showIframe}
  <iframe
    class="h-0 w-0"
    on:error={iframeError}
    on:load={iframeLoaded}
    src={url}
    title="plugin iframe"
    id={`plugin-${id}`}
  />
{/if}
