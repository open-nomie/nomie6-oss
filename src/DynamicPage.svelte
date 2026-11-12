<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte'
  import Error404 from './routes/Error404.svelte'

  let dynamicPage = null

  onMount(async () => {
    try {
      if (route) {
        dynamicPage = (await import('../src/routes/' + route + '.svelte')).default
      } else if (component) {
        dynamicPage = (await import('../src/components/' + component + '.svelte')).default
      } else if (container) {
        dynamicPage = (await import('../src/domains/' + container + '.svelte')).default
      } else {
        throw new Error('unknown path')
      }
    } catch (e) {
      // Handle errors if the dynamic route doesn't load:
      dynamicPage = Error404
    }
  })

  const { route, component, container } = $props()
</script>

{#if dynamicPage}
  <svelte:component this={dynamicPage} />
{/if}
