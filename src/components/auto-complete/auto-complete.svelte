<script lang="ts">
  import tick from '../../utils/tick/tick'
  import { createEventDispatcher } from 'svelte'
  import { dismissTrackerInputModal, getTrackerInputAsString } from '../../domains/tracker/input/TrackerInputStore'
  import { TrackableStore } from '../../domains/trackable/TrackableStore'
  import type { Trackable } from '../../domains/trackable/Trackable.class'
  import TrackableAvatar from '../avatar/trackable-avatar.svelte'

  import { toTrackableArray } from '../../domains/trackable/trackable-utils'
  import { removePrefix } from '../../utils/text/text'
  import { encodeRegex } from '../../utils/regex'
  import { slide } from 'svelte/transition'

  const dispatch = createEventDispatcher()

  export let input = null
  export let scroller = false
  export let className = ''
  export let style = ''

  let state = {
    partialTag: null,
    results: [],
    tag: null,
    cursorIndex: 0,
  }

  // function close() {
  //   state.results = []
  // }

  /**
   * Auto Complete Search
   * Searches trackers, people and context
   * THIS IS A MESS
   *
   **/

  const autoCompleteSearch = (searchTag: string, type: string = 'tracker'): Array<Trackable> => {
    // Search for Trackers
    state.tag = searchTag

    try {
      return toTrackableArray($TrackableStore.trackables).filter((t) => {
        const term = removePrefix(searchTag)
        return t.tag.search(encodeRegex(term)) > -1
      })
    } catch (e) {
      console.error(e)
      return []
    }
  }

  const onSelect = async (trackable: Trackable) => {
    let note: string = ''
    if (trackable.type == 'tracker') {
      const inputResponse = await getTrackerInputAsString({
        trackables: $TrackableStore.trackables,
        tracker: trackable.tracker,
        expandNote: true
      })
      
      dismissTrackerInputModal()
      // note = trackable.tracker.toNoteString(inputResponse.value)
      note = inputResponse.raw;
    } else if (trackable.type == 'person') {
      note = trackable.tag
    } else if (trackable.type == 'context') {
      note = trackable.tagWithValue()
    }

    // Dispatch the Select
    const splitInput = input.split(' ')
    const inputParts = splitInput.filter((word, index) => {
      return index < splitInput.length - 1
    })

    let finalNote = `${inputParts.join(' ')} ${note} `

    dispatch('select', { trackable, note: finalNote })
    await tick(120)
    state.partialTag = null
    state.tag = null
    state.results = null
  }

  const onInput = (str) => {
    if (str) {
      let value = str
      let last = value?.charAt(value.length - 1)
      if (last == ' ') {
        state.results = null
      } else if (value.length) {
        let arr = value.split(' ')
        let tag = arr[arr.length - 1]
        state.cursorIndex = arr.length - 1
        // If its a tag
        if (tag.charAt(0) === '#' && tag.length > 1) {
          state.partialTag = tag
          state.results = autoCompleteSearch(tag, 'tracker')
          // If its a person
        } else if (tag.charAt(0) === '@' && tag.length > 1) {
          state.partialTag = tag.replace(/\@/gi, '')
          state.results = autoCompleteSearch(state.partialTag, 'person')
          // If it's context
        } else if (tag.charAt(0) === '+' && tag.length > 1) {
          state.partialTag = tag
          state.results = autoCompleteSearch(tag, 'context')
        } else {
          state.partialTag = null
          state.results = null
        }
      } else {
        state.partialTag = null
        state.results = null
      }
    }
  }

  /**
   * Main Mount
   */

  let lastInput
  $: if (lastInput !== input) {
    lastInput = input
    onInput(input)
  }
  $: if (!input) {
    state.results = undefined
  }
</script>

{#if state.results && state.results.length}
  <div style={style}
    transition:slide={{ duration: 100 }}
    class="{scroller ? 'scroller' : 'no-scroller'} autocomplete-results animate {className}"
  >
    <div class="p-0 tracker-list">
      {#each state.results || [] as trackable, index (index)}
        <button
          on:click={() => {
            onSelect(trackable)
          }}
        >
          <TrackableAvatar {trackable} size={16} />
          <div style="max-width:120px;" class="ml-1 truncate">
            {trackable.label}
          </div>
        </button>
      {/each}
      <div class="filler" />
    </div>
  </div>
{/if}

<style global lang="postcss">
  .autocomplete-results.scroller {
    overflow: scroll;
  }
  .autocomplete-results.scroller .tracker-list {
    @apply py-2;
    display: flex;
    flex-wrap: nowrap !important;
    width: fit-content;
    @apply items-center;
    @apply space-x-2;
  }

  .autocomplete-results.compact {
    @apply py-0;
  }

  .autocomplete-results button {
    @apply text-center;
    @apply text-gray-500;
    @apply h-8;
    @apply rounded-md;
    @apply items-center;
    @apply flex;
    @apply px-2;

    @apply focus:outline-none;
    @apply focus:ring-2 ring-primary-500 ring-inset;
  }
  .autocomplete-results.scroller .trackable-element {
    flex-shrink: 0;
    flex-grow: 0;
  }
  .autocomplete-results {
    margin: 0px;
    border-radius: 2px;
    padding: 2px;
    transition: all 0.2s ease-in-out;
    z-index: 100;
  }
  .autocomplete-results.animate.visible {
    transition: all 0.2s ease-in-out;
    opacity: 1;
  }
  .autocomplete-results.animate.hidden {
    max-height: 0px !important;
    padding: 0;
    overflow: hidden;
    margin: 0;
    transition: all 0.2s ease-in-out;
    opacity: 0;
    pointer-events: none;
    transform: translateY(60px);
  }
  .autocomplete-results .tracker-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .autocomplete-results .btn {
    flex-grow: 0;
    flex-shrink: 0;
    max-width: 120px;
    white-space: pre;
  }
</style>
