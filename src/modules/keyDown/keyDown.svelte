<script lang="ts">
  // Originally from https://github.com/metonym/svelte-keydown/blob/master/component/Keydown.svelte
  /**
   * @event {string} combo
   * @event {string} key
   */
  /** Set to `true` to pause the capture of keydown events */
  export let paused = false
  /** Set to `true` to pause keydown events when typing in an input field */
  export let pauseOnInput = false
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  let combo = []
  let down = []
  $: combination = combo.join('-')
  $: comboByKey = combo.reduce((keys, key) => ({ ...keys, [key]: true }), {})
  $: if (combo.length > 0) dispatch('combo', combination)
</script>

<svelte:body
  on:keyup={({ key }) => {
    down = down.filter((_key) => _key !== key)
    if (down.length > 0) return
    combo = []
  }}
  on:keydown={({ key, target }) => {
    if (pauseOnInput && target.tagName !== 'BODY') {
      return
    }

    down = [...down, key]

    if (!paused) {
      if (!(key in comboByKey)) {
        combo = [...combo, key]
      } else {
        dispatch('combo', combination)
      }

      dispatch(key)
      dispatch('key', key)
    }
  }}
/>
