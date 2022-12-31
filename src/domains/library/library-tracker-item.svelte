<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Button from '../../components/button/button.svelte'
  import Emoji from '../../components/emoji-selector/Emoji.svelte'
  import ManyEmoji from '../../components/emoji-selector/many-emoji/many-emoji.svelte'

  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import { Lang } from '../../store/lang'

  import type { LibraryTrackerType } from './library-manager/LibraryManagerStore'

  export let libraryTracker: LibraryTrackerType
  let expand: boolean = false
  const dispatch = createEventDispatcher()
</script>

<ListItem
  detail
  clickable={libraryTracker.trackers.length > 1}
  on:click={(evt) => {
    dispatch('click', evt)
  }}
>
  <div slot="left">
    {#if libraryTracker.trackers.length > 1}
      <ManyEmoji
        size={52}
        className="bg-primary-500 bg-opacity-20 rounded-lg p-1  -ml-2"
        emojis={libraryTracker.trackers.map((t) => t.emoji)}
      />
    {:else if libraryTracker.trackers.length === 1}
      <Emoji
        title={libraryTracker.trackers[0].label}
        emoji={libraryTracker.trackers[0].emoji}
        className="text-4xl leading-none bg-primary-400 bg-opacity-20 p-2 -ml-2 rounded-lg"
      />
    {/if}
  </div>
  <h1 class="font-bold leading-tight line-clamp-2 text-lg">{libraryTracker.title}</h1>
  <p class="text-sm text-gray-500 line-clamp-2">{libraryTracker.trackers.map((t) => `${t.label}`).join(', ')}</p>
</ListItem>
