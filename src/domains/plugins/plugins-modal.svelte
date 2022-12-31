<script lang="ts">
  import { onMount } from 'svelte'
  import Avatar from '../../components/avatar/avatar.svelte'

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Button from '../../components/button/button.svelte'
  import Empty from '../../components/empty/empty.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import Title from '../../components/title/title.svelte'
  import { showToast } from '../../components/toast/ToastStore'
  import ToggleSwitch from '../../components/toggle-switch/toggle-switch.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import PlusIcon from '../../n-icons/PlusIcon.svelte'
  import TrashOutline from '../../n-icons/TrashOutline.svelte'
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  import { showNomieConnectPopup } from '../settings/settings-helpers'
  import type { PluginClass } from './plugin-helpers'
  import PluginInstaller from './plugin-installer.svelte'
  import { closePluginsModal, openPluginInstaller, PluginStore } from './PluginStore'
  import { PermissionsStore } from '../my-account/PermissionsStore'
  import Badge from '../../components/badge/badge.svelte'
  import appConfig from '../../config/appConfig'
  import { getCollectionDocs } from '../firebase/FirebaseStore'

  export let tab: 'installed' | 'avail' = 'installed'
  export let showAdd: boolean = false

  let officialPlugins = []
  onMount(async () => {
    officialPlugins = await getCollectionDocs('/plugins')
  })

  let editMode: boolean = false
  let hasLocked: boolean = false

  const toggleEditMode = () => {
    editMode = !editMode
  }

  $: {
    hasLocked = $PluginStore.find((p) => p.locked)
      ? true
      : false || (!$PermissionsStore.canAPI && $PluginStore.length >= appConfig.max_free_plugins)
  }

  const togglePlugin = (plugin: PluginClass) => {
    plugin.active = !plugin.active
    PluginStore.upsert(plugin)
  }

  const deletePlugin = async (plugin: PluginClass) => {
    const confirmed = await Interact.confirm(`Uninstall ${plugin.name} from Nomie?`)
    if (confirmed) {
      try {
        await PluginStore.remove(plugin)
        showToast({ message: 'Removed' })
      } catch (e) {
        Interact.error(e.message)
      }
    }
  }

  const getDomain = (_url: string) => {
    if (_url) {
      let url = new URL(_url)
      if (url.origin) return url.origin
    }
    return ''
  }

  let pluginUrl: undefined | string
  const installPlugin = (url?: string) => {
    // pluginUrl = url
    openPluginInstaller(url)
  }
</script>

<BackdropModal>
  <header slot="header">
    <ToolbarGrid>
      <Button on:click={closePluginsModal} slot="left" clear primary>{Lang.t('general.close', 'Close')}</Button>
      <h1 class="ntitle text-sm md:text-base">{Lang.t('general.plugins', 'Plugins')}</h1>
      <div slot="right">
        {#if !hasLocked}
          <Button on:click={() => installPlugin()} icon clear primary>
            <IonIcon icon={PlusIcon} />
          </Button>
        {/if}
      </div>
    </ToolbarGrid>
    <Toolbar>
      <ButtonGroup
        buttons={[
          {
            label: 'Installed',
            active: tab == 'installed',
            click() {
              tab = 'installed'
            },
          },
          {
            label: 'Available',
            active: tab == 'avail',
            click() {
              tab = 'avail'
            },
          },
        ]}
      />
    </Toolbar>
  </header>
  <section class="px-2 lg:px-4 py-4">
    {#if showAdd}
      <PluginInstaller
        bind:url={pluginUrl}
        on:cancel={() => {
          showAdd = false
        }}
      />
    {/if}
    {#if tab == 'installed'}
      <List solo outside title={$PluginStore.length > 0 ? Lang.t('plugins.my-plugins', 'Installed Plugins') : ''}>
        <div slot="header-right">
          {#if $PluginStore.length}
            <Button shape="round" size="sm" on:click={toggleEditMode}>
              {#if editMode}
                <span class="text-red-500 font-bold">Done</span>
              {:else}
                <span class="text-primary">Edit</span>
              {/if}
            </Button>
          {/if}
        </div>
        {#each $PluginStore as plugin}
          <ListItem bottomLine={15} disabled={plugin.locked}>
            <div class="flex space-x-2 items-center">
              <Avatar size={20} emoji={plugin.emoji} />
              <Title className="flex items-center space-x-1">
                <span>{plugin.name}</span>
                <div class="faded-badge">
                  {plugin.version}
                </div>
              </Title>
            </div>
            <div class="description line-clamp-3">
              <div class="line-clamp-3">
                {plugin.description}
              </div>
              <div class="text-gray-500 text-xs line-clamp-1">{getDomain(plugin.url)}</div>
            </div>
            <div class="description opacity-40 line-clamp-1" />

            <div slot="right" class="flex items-center space-x-2">
              {#if !plugin.locked}
                <ToggleSwitch
                  on:change={() => togglePlugin(plugin)}
                  title="${plugin.name} status"
                  value={plugin.active}
                />
              {/if}
              {#if editMode}
                <Button on:click={() => deletePlugin(plugin)} icon
                  ><IonIcon className="text-red-500" icon={TrashOutline} /></Button
                >
              {/if}
            </div>
          </ListItem>
        {/each}

        {#if hasLocked}
          <ListItem
            on:click={showNomieConnectPopup}
            clickable
            titleClass="text-primary"
            title="Upgrade"
            description="Plugin limit reached."
          />
        {/if}
      </List>

      {#if $PluginStore.length === 0}
        <div class="h-4 stiff w-full min-h-4" />
        <List solo>
          <Empty emoji="🔌" title="No Plugins Installed">
            <p class="text-xs text-center text-gray-500 leading-snug">
              Plugins allow others to create entirely new ways of tracking and monitoring your data within Nomie. <strong
                >WARNING: This feature is under heavy development.</strong
              >
            </p>
          </Empty>
          <ListItem
            clickable
            on:click={() => {
              openPluginInstaller()
            }}
            titleClass="text-center text-primary"
            title="Add a Custom Plugin"
          />
        </List>
      {/if}

      <!-- Installable Plugins   -->
    {:else if tab == 'avail'}
      <List solo outside title="Official Plugins">
        {#each officialPlugins as plugin}
          <ListItem
            disabled={$PluginStore.find((p) => p.url == plugin.url)}
            bottomLine={72}
            detail
            on:click={() => {
              if (!$PluginStore.find((p) => p.url == plugin.url)) {
                installPlugin(plugin.url)
              }
            }}
          >
            <Avatar size={50} emoji={plugin.emoji} slot="left" />
            <Title>{plugin.name}</Title>
            <div class="description">
              {#if $PluginStore.find((p) => p.url == plugin.url)}
                <Badge pad className="bg-green-500 text-white">Installed</Badge>
              {/if}
              {plugin.description}
            </div>
            <div class="lineclamp-1 text-xs text-green-500">{new URL(plugin.url).origin}</div>
          </ListItem>
        {/each}
      </List>
    {/if}

    <div class="pt-10 px-4 text-center text-gray-500 text-sm">
      Want to create a Plugin? <br />
      <a class="text-primary underline" href="https://github.com/open-nomie/plugins" target="_blank" rel="nofollow"
        >Read the Plugin Docs →</a
      >
    </div>
  </section>
</BackdropModal>
