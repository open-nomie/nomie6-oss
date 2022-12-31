<script lang="ts">
  import { onMount } from 'svelte'
  import Avatar from '../../../components/avatar/avatar.svelte'
  import { openModal } from '../../../components/backdrop/BackdropStore2'
  import Button from '../../../components/button/button.svelte'
  import Divider from '../../../components/divider/divider.svelte'

  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import { AddIcon } from '../../../components/icon/nicons'

  import ListItem from '../../../components/list-item/list-item.svelte'
  import List from '../../../components/list/list.svelte'
  import Panel from '../../../components/panel/panel.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import TrackerClass from '../../../modules/tracker/TrackerClass'
  import { firebaseAuth } from '../../firebase/FirebaseStore'

  import LibraryTrackerItem from '../library-tracker-item.svelte'
  import LibraryTrackerEditor from './library-tracker-editor.svelte'
  import {
    getAllLibraryTrackers,
    getLibraryCategories,
    getLibraryTrackersByCategory,
    LibraryCategoryType,
    LibraryManagerStore,
    LibraryTrackerType,
  } from './LibraryManagerStore'

  let categories: Array<any> = []
  let activeCategory: LibraryCategoryType

  let activeTrackers: Array<LibraryTrackerType> = []

  let expanded = {}

  // const toggleExpand = (index: number) => {
  //   const key = `index-${index}`
  //   if (expanded.hasOwnProperty(key)) {
  //     delete expanded[key]
  //   } else {
  //     expanded[key] = true
  //   }
  //   expanded = expanded
  // }

  const setActiveTrackers = (docs) => {
    activeTrackers = docs.map((doc: LibraryTrackerType) => {
      doc.trackers = doc.trackers.map((t) => new TrackerClass(t))
      return doc
    })
  }

  const getTrackers = async () => {
    if (activeCategory) {
      const docs = await getLibraryTrackersByCategory(activeCategory)
      setActiveTrackers(docs)
    }
  }

  const selectCategory = (category) => {
    activeCategory = category
  }

  const addTrackers = async () => {
    const libTracker: LibraryTrackerType = {
      trackers: [],
      title: undefined,
      tags: [activeCategory.id],
      uid: firebaseAuth.currentUser?.uid,
    }
    $LibraryManagerStore.libraryTracker = libTracker
  }

  const getAllTrackers = async () => {
    const trackers = await getAllLibraryTrackers()
    setActiveTrackers(trackers)
  }

  $: if (!$LibraryManagerStore.libraryTracker && activeCategory) {
    getTrackers()
  } else if (!activeCategory) {
    getAllTrackers()
  }

  $: if ($LibraryManagerStore.libraryTracker) {
    openModal({
      id: 'library-tracker-editor',
      component: LibraryTrackerEditor,
      componentProps: {},
    })
  }

  onMount(async () => {
    categories = await getLibraryCategories()
  })
</script>

<main class="w-screen h-screen grid-cols-12 grid bg-gray-200 dark:bg-gray-800">
  <Panel className="sidebar col-span-4 bg-gray-100 dark:bg-gray-900">
    <ToolbarGrid slot="header">
      <h1 class="ntitle">Categories</h1>
    </ToolbarGrid>
    <List solo>
      {#each categories as category}
        <ListItem
          clickable
          solo={activeCategory == category}
          className={activeCategory == category ? 'bg-primary-600' : ''}
          on:click={() => {
            selectCategory(category)
          }}
        >
          <Avatar emoji={category.emoji} slot="left" />
          <h2>{category.label}</h2>
        </ListItem>
      {/each}
    </List>
  </Panel>
  <Panel className="main-content col-span-12 lg:col-span-8">
    <ToolbarGrid slot="header">
      <h1 class="ntitle">{activeCategory?.label || 'Select Category'}</h1>
      <Button slot="right" icon on:click={addTrackers}>
        <IonIcon icon={AddIcon} className="text-primary-500" />
      </Button>
    </ToolbarGrid>
    <main class="details">
      {#if activeTrackers.length}
        <List solo title="Trackers" outside>
          {#each activeTrackers as libraryTracker, index}
            <LibraryTrackerItem
              {libraryTracker}
              on:click={() => {
                // toggleExpand(index)
                $LibraryManagerStore.libraryTracker = libraryTracker
              }}
            />

            {#if expanded[`index-${index}`] === true}
              <div class="bg-gray-100 dark:bg-gray-900 py-2">
                <!-- <List solo className="">
                  {#if libraryTracker.trackers.length > 1}
                    <ListItem clickable={false}>
                      <h1 class="font-medium text-gray-500">{libraryTracker.title}</h1>
                      <Button slot="right" type="clear" className="text-primary-500 whitespace-nowrap"
                        >Add All {libraryTracker.trackers.length}</Button
                      >
                    </ListItem>
                  {/if}

                  {#each libraryTracker.trackers as tracker}
                    <ListItem>
                      <Emoji
                        slot="left"
                        title={tracker.label}
                        emoji={tracker.emoji}
                        className="text-4xl leading-none bg-primary-400 bg-opacity-20 p-2 -ml-2 rounded-lg"
                      />
                      <h1 class="ntitle">{tracker.label}</h1>
                      <p class="text-sm text-gray-500 leading-tight">
                        {tracker.type}
                      </p>
                      <div slot="right">
                        <Button slot="right" primary clear >Add</Button>
                      </div>
                    </ListItem>
                  {/each}
                </List> -->
              </div>
            {/if}

            {#if index < activeTrackers.length}
              <Divider />
            {/if}
          {/each}
        </List>
      {/if}
    </main>
  </Panel>
</main>
