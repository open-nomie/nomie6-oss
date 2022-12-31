<script lang="ts">
  export let h1: boolean = true
  export let className: string = ''
  export let style: string = ''
  export let listHeader: boolean = false
  export let subTitle: string = undefined
</script>

{#if listHeader}
  <h2 class="text-xl md:text-2xl lg:text-3xl pl-1 dark:text-white text-black font-bold leading-tight"><slot /></h2>
{:else if h1}
  <h1 class="ntitle {className}" {style}><slot /></h1>
{:else}
  <h2 class="ntitle {className}" {style}><slot /></h2>
{/if}
{#if subTitle}
  <p class="text-sm text-gray-500 leading-tight mt-1">{subTitle}</p>
{/if}
