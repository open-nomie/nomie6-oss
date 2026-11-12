<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  function onClick() {
    dispatch('emojiclick', emoji)
  }

  function onMouseOver() {
    dispatch('emojihover', emoji)
  }

  function onMouseOut() {
    dispatch('emojihover', null)
  }

  const { emoji, className, style, title } = $props()
</script>

<button
  class={className}
  {style}
  title={title || 'Emoji'}
  on:mouseover={onMouseOver}
  on:mouseout={onMouseOut}
  on:focus={onMouseOver}
  on:blur={onMouseOut}
  on:click={onClick}>{emoji.e || emoji}</button
>
