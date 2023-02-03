<script lang="ts">
  import Textarea from '../../components/textarea/textarea.svelte'
  import {
    AllContextTrackables,
    AllPeopleTrackables,
    AllTrackerTrackables,
    TrackableStore,
  } from '../../domains/trackable/TrackableStore'
  import { getTrackerInputAsString } from '../../domains/tracker/input/TrackerInputStore'

  import { tokenizeLite } from '../../modules/tokenizer/lite'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { createEventDispatcher } from 'svelte'
  import { replaceTextAt } from '../../utils/text/text'
  import { wait } from '../../utils/tick/tick'

  let textarea: any
  export let value: string
  export let id: string
  const emit = createEventDispatcher()
</script>

<Textarea
  aria-label="Note entry field"
  {id}
  on:inserted={async (evt) => {
    const tag = evt.detail.item.original.key
    const token = tokenizeLite(tag)[0]
    const trackable = tokenToTrackable(token, $TrackableStore.trackables)

    const cursorPos = evt.detail.cursor.end - 1 - tag.length
    if (trackable.type == 'tracker') {
      const inputValue = await getTrackerInputAsString({
        trackables: $TrackableStore.trackables,
        tracker: trackable.tracker,
        expandNote: true,
      })
      if (inputValue) {
        let note = replaceTextAt(value, tag, inputValue.raw, cursorPos)
        let newCursor = evt.detail.cursor.end + (inputValue.raw.length - tag.length)
        value = `${note} `
        await wait(20)
        textarea.setSelectionRange(newCursor, newCursor)
        emit('input', evt.detail)
      }
    }
  }}
  tributeConfig={{
    menuShowMinLength: 1,
    autocompleteMode: false,
    menuItemLimit: 3,
    noMatchTemplate: null,
    // menuContainer: captureWrapper,
    collection: [
      {
        trigger: '#',
        noMatchTemplate: null,
        values: $AllTrackerTrackables.map((trackable) => {
          return {
            key: trackable.tag,
            value: trackable.tag?.replace('#', ''),
          }
        }),
      },
      {
        trigger: '@',
        noMatchTemplate: null,
        values: $AllPeopleTrackables.map((trackable) => {
          return {
            key: trackable.tag,
            value: trackable.tag?.replace('@', ''),
          }
        }),
      },
      {
        trigger: '+',
        values: $AllContextTrackables.map((trackable) => {
          return {
            key: trackable.tag,
            value: trackable.tag?.replace('+', ''),
          }
        }),
      },
    ],
  }}
  class={$$restProps.class || ''}
  placeholder={$$restProps.placeholder || ''}
  bind:value
  bind:this={textarea}
  on:input={(e) => emit('input', e.detail)}
  on:keydown={(e) => emit('keydown', e.detail)}
  on:focus={(e) => emit('focus', e.detail)}
  on:blur={(e) => emit('blur', e.detail)}
  on:paste={(e) => emit('paste', e.detail)}
  {...$$restProps}
/>
