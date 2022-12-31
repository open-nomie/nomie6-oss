<script lang="ts">
  import { onMount } from 'svelte'
  import Error404 from './routes/Error404.svelte'

  export let route: string | undefined = undefined
  export let component: string | undefined = undefined
  export let container: string | undefined = undefined

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
</script>

{#if dynamicPage}
  <svelte:component this={dynamicPage} />
{/if}
