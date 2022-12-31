<script lang="ts">
  // Stores

  import { Lang } from '../../store/lang'
  import { TrackerLibrary } from './tracker-library'
  import { Interact } from '../../store/interact'

  import Button from '../../components/button/button.svelte'

  import { saveTrackable, TrackableStore } from '../trackable/TrackableStore'
  import TrackerClass from '../../modules/tracker/TrackerClass'

  import { ActiveBoard, addTrackablesToBoard, UniboardStore } from '../board/UniboardStore'

  import { Prefs } from '../preferences/Preferences'

  import { onMount } from 'svelte'
  import { getAllLibraryTrackers, LibraryTrackerType } from './library-manager/LibraryManagerStore'
  import LibraryTrackerItem from './library-tracker-item.svelte'
  import LibraryTrackerItemDetails from './library-tracker-item-details.svelte'
  import { UOMClass } from '../uom/uom.class'
  import { wait } from '../../utils/tick/tick'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import List from '../../components/list/list.svelte'
  import { showToast } from '../../components/toast/ToastStore'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Spinner from '../../components/spinner/spinner.svelte'
  import SearchBar from '../../components/search-bar/search-bar.svelte'
  import Empty from '../../components/empty/empty.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import type { Trackable } from '../trackable/Trackable.class'
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'

  import { PermissionsStore } from '../my-account/PermissionsStore'

  import AvailableTemplatesList from '../templates/available-templates-list.svelte'

  export let id: string

  let ready = false
  let libraryTrackers: Array<LibraryTrackerType> = []
  let searchResults: Array<Trackable> = []
  let searchTerm: string
  onMount(() => {
    ready = true
  })

  $: if ($TrackerLibrary && !libraryTrackers.length && ready) {
    getAllLibraryTrackers().then((lts: Array<LibraryTrackerType>) => {
      libraryTrackers = lts.sort((a, b) => (a?.title.toLowerCase() > b?.title.toLowerCase() ? 1 : -1))
    })
  }
  let activeId: any

  /**
   * Toggle the Active Category
   * @param index
   */
  const setActive = (index: number) => {
    if (index == activeId) {
      activeId = undefined
    } else {
      activeId = index
    }
  }

  /**
   * Install a block of Trackables
   * @param trackers
   */
  async function installAll(trackers: Array<TrackerClass> = []) {
    const filtered = trackers.filter((t) => !$TrackableStore.trackables[`#${t.tag}`])
    if (filtered.length) {
      Interact.blocker(`Installing ${filtered.length}`)
      await wait(300)
      for (let i = 0; i < filtered.length; i++) {
        Interact.blocker(`Installing ${filtered[i].emoji} ${filtered[i].label}`)
        await install(filtered[i])
        await wait(300)
      }
      Interact.stopBlocker()
    } else {
      showToast({ message: 'You already have them all!' })
    }
  }

  /**
   * Install a Tracker
   * @param _tracker
   */
  async function install(_tracker) {
    const tracker = _tracker instanceof TrackerClass ? _tracker : new TrackerClass(_tracker)

    // Convert the UOM to right measurement system - if needed
    const uom = new UOMClass(tracker.uom)
    const userSystem = $Prefs.useMetric ? 'metric' : 'imperial'
    if (uom.system !== userSystem && uom.system !== 'both') {
      tracker.uom = uom.convertTo(userSystem).id
      tracker.default = uom.convertValueTo(tracker.default || 0, userSystem)
    }

    const trackable = tracker.toTrackable()
    if ($TrackableStore.trackables.hasOwnProperty(`#${tracker.tag}`)) {
      showToast({ message: 'Already installed' })
    } else {
      // Let's make sure we're on the right type .
      // const currentUOM = tracker.uom

      let saved = await saveTrackable({
        trackable,
        known: $TrackableStore.trackables,
        saveToActiveBoard: false,
        permissions: $PermissionsStore,
        prompt: false,
      })
      if (saved) {
        await addTrackablesToBoard([trackable], $ActiveBoard)
        UniboardStore.update((b) => b)
        showToast({ message: `${trackable.tag} added` })
      }
    }
  }

  $: if (searchTerm) {
    searchResults = searchTrackables(searchTerm)
  }

  const searchTrackables = (term): Array<Trackable> => {
    const matches: Array<Trackable> = []
    libraryTrackers.forEach((col) => {
      col.trackers.forEach((t: TrackerClass) => {
        matches.push(t.toTrackable())
      })
    })

    return matches.filter((t) => JSON.stringify(t).toLowerCase().search(term.toLowerCase()) > -1)
  }

  /**
   * Close The Modal
   */
  const close = async () => {
    closeModal(id)
  }
</script>

<BackdropModal>
  <header slot="header" class="bg-white dark:bg-gray-900 mb-2">
    <ToolbarGrid className="bg-white dark:bg-gray-900">
      <Button clear primary slot="left" on:click={close}>Done</Button>
      <h1 class="ntitle">{Lang.t('library.tracker-library', 'Tracker Library')}</h1>
    </ToolbarGrid>
    <SearchBar bind:searchTerm />
    <div class="h-1">&nbsp;</div>
  </header>
  {#if libraryTrackers.length == 0}
    <div class="flex-grow flex-shrink justify-center items-center flex h-75vh">
      <Spinner size={32} />
    </div>
  {/if}

  {#if searchTerm}
    <List className="mb-6">
      <header class="list-header">Search Results</header>
      {#if searchResults && searchResults.length}
        {#each searchResults as item}
          <ListItem bottomLine={78}>
            <TrackableAvatar trackable={item} size={42} slot="left" />
            <h1>{item.label}</h1>
            <div slot="right">
              {#if !$TrackableStore.trackables[item.tag]}
                <Button
                  on:click={() => {
                    install(item.tracker)
                  }}
                  size="sm"
                  shape="round"
                  className="bg-gray-600 text-white">Add</Button
                >
              {:else}
                <Button size="sm" shape="round" className="bg-gray-600 opacity-25 text-white">Added</Button>
              {/if}
            </div>
          </ListItem>
        {/each}
      {:else}
        <Empty title="No results" />
      {/if}
    </List>
  {/if}

  <List solo outside title="Templates">
    <AvailableTemplatesList />
  </List>

  <List solo outside title="Individual Trackers">
    {#each libraryTrackers as libraryTracker, index}
      <LibraryTrackerItem
        {libraryTracker}
        on:click={() => {
          setActive(index)
        }}
      />

      {#if activeId === index}
        <div class="bg-gray-100 dark:bg-gray-900 pb-2">
          <LibraryTrackerItemDetails
            {libraryTracker}
            on:add={(evt) => {
              install(evt.detail)
            }}
            on:addAll={(evt) => {
              installAll(evt.detail)
            }}
          />
        </div>
      {/if}
    {/each}
  </List>
</BackdropModal>

<style global lang="postcss">
  .intro-message {
    @apply text-gray-500 dark:text-gray-300;
    @apply text-sm;
    @apply leading-tight;
  }
</style>
