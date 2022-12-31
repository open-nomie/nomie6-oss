<script lang="ts">
  import { onMount } from 'svelte'

  import Empty from '../components/empty/empty.svelte'
  import CloudApiView from '../domains/cloud-api/cloud-api-view.svelte'
  import { PermissionsStore } from '../domains/my-account/PermissionsStore'

  let mounted = false
  onMount(() => {
    setTimeout(() => {
      mounted = true
    }, 1000)
  })
</script>

{#if $PermissionsStore.canAPI}
  <CloudApiView />
{:else if mounted}
  <Empty><span class="text-gray-500">Subscription required</span></Empty>
{:else}
  <Empty><span class="text-gray-500">Loading...</span></Empty>
{/if}
