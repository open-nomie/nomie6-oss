<svelte:options runes={true} />

<script lang="ts">


  const { h1, className, style, listHeader, subTitle } = $props()
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
