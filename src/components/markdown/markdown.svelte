<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte'

  import SvelteMarkdown from 'svelte-markdown'

  let wrapperEle: HTMLElement

  onMount(() => {
    let items = wrapperEle.querySelectorAll('a')
    items.forEach((item) => {
      item.setAttribute('target', '_blank')
    })
  })

  const { content, ...rest } = $props()
</script>

<div bind:this={wrapperEle} {...rest} class="markdown {rest['class']}">
  <SvelteMarkdown source={content} />
</div>

<style lang="postcss" global>
  .markdown a {
    @apply underline;
    @apply text-primary-500 dark:text-primary-400;
  }
</style>
