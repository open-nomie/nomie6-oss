<script lang="ts">
  import { onMount } from 'svelte'

  import SvelteMarkdown from 'svelte-markdown'

  export let content: string

  let wrapperEle: HTMLElement

  onMount(() => {
    let items = wrapperEle.querySelectorAll('a')
    items.forEach((item) => {
      item.setAttribute('target', '_blank')
    })
  })
</script>

<div bind:this={wrapperEle} {...$$restProps} class="markdown {$$restProps['class']}">
  <SvelteMarkdown source={content} />
</div>

<style lang="postcss" global>
  .markdown a {
    @apply underline;
    @apply text-primary-500 dark:text-primary-400;
  }
</style>
