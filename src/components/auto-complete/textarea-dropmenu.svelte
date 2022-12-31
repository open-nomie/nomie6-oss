<script lang="ts">
  import { onDestroy, onMount } from 'svelte'

  import getCaretCoordinates from 'textarea-caret'
  export let textareaId: string
  export let className: string = ''

  let listener: any = undefined

  let top: number = 0
  let left: number = 0
  let height: number = 0
  let bottom: number = 0
  let ele: HTMLInputElement
  let menuEle: HTMLElement

  const onInput = (evt: any) => {
    const caret = getCaretCoordinates(evt.target, evt.target.selectionEnd)
    top = caret.top
    left = caret.left
    height = caret.height
    bottom = menuEle?.clientHeight || 100
  }

  onMount(() => {
    ele = document.getElementById(textareaId) as HTMLInputElement
    if (listener) {
      ele.removeEventListener('input', listener)
    }
    listener = ele.addEventListener('input', onInput)
  })
  onDestroy(() => {
    ele.removeEventListener('input', onInput)
  })
</script>

{#if left > 0}
  <nav bind:this={menuEle} id="type-ahead-menu" class="dropmenu z-50 {className}" style="left:{left}px;">
    <slot />
  </nav>
{/if}

<style lang="postcss" global>
  .dropmenu {
    @apply bg-gray-200 dark:bg-gray-800;
    @apply text-black dark:text-white;
    @apply rounded-lg;
    @apply shadow-lg;
    @apply absolute;
    @apply w-40;
    @apply flex flex-col;
    @apply py-1;
  }
  .dropmenu button {
    @apply text-xs;
    @apply text-left;
    @apply py-1 px-2;
  }
</style>
