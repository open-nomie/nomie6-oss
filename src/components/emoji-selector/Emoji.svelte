<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let emoji: any
  export let className: string = ''
  export let style: string = ''
  export let title: string | undefined = undefined

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
