<script lang="ts">
  import Avatar from '../../components/avatar/avatar.svelte'

  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CheckmarkCircle } from '../../components/icon/nicons'
  import ListItem from '../../components/list-item/list-item.svelte'

  import List from '../../components/list/list.svelte'
  import type { ITrackables } from '../ledger/ledger-tools'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { LibraryTrackerType } from './library-manager/LibraryManagerStore'
  import TrackerTypes from '../../modules/tracker-types/tracker-types'
  import { createEventDispatcher } from 'svelte'

  export let libraryTracker: LibraryTrackerType

  const dispatch = createEventDispatcher()

  function getTypeLabel(id: string) {
    if (TrackerTypes.hasOwnProperty(id)) {
      return TrackerTypes[id].label
    } else {
      return id
    }
  }

  let trackables: ITrackables = {}
  $: trackables = $TrackableStore.trackables
</script>

<List solo className="">
  {#if libraryTracker.trackers.length > 1}
    <ListItem clickable={false}>
      <h1 class="font-medium text-gray-500">{libraryTracker.title}</h1>
      <Button
        on:click={() => {
          dispatch('addAll', libraryTracker.trackers)
        }}
        size="sm"
        slot="right"
        shape="round"
        className="px-2 py-1 whitespace-nowrap bg-gray-500 text-white">Add All</Button
      >
    </ListItem>
  {/if}

  {#each libraryTracker.trackers as tracker}
    <ListItem bottomLine={78}>
      <div slot="left" class="bg-primary-400 bg-opacity-20 flex items-center justify-center p-1 rounded-lg">
        <Avatar slot="left" size={36} emoji={tracker.emoji} className="" />
      </div>
      <h1 class="ntitle">{tracker.label}</h1>
      <p class="text-sm text-gray-500 leading-tight">
        {getTypeLabel(tracker.type)}
      </p>
      <div slot="right">
        {#if !trackables.hasOwnProperty(`#${tracker.tag}`)}
          <Button
            on:click={() => {
              dispatch('add', tracker)
            }}
            primary
            clear>Add</Button
          >
        {:else}
          <Button type="clear" className="text-gray-500" size="xs"
            >Added <IonIcon className="ml-2 opacity-50" icon={CheckmarkCircle} /></Button
          >
        {/if}
      </div>
    </ListItem>
  {/each}
</List>
