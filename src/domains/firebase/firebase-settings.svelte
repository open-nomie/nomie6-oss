<script lang="ts">
  import ListItem from '../../components/list-item/list-item.svelte'

  import { FirebaseStore } from './FirebaseStore'
  import { onMount } from 'svelte'
  import { getKeyBackup } from '../../domains/encryption/EncryptionStore'

  import { openManageEncryptionModal } from './useEncryptionModal'
import List from '../../components/list/list.svelte';

  let secretBackedUp: any = false
  let ready: boolean = false

  $: if ($FirebaseStore.user) {
    getKeyBackup().then((b) => {
      secretBackedUp = b ? true : false
    })
  }
  onMount(() => {
    setTimeout(() => {
      ready = true
    }, 1000)
  })
</script>

<!-- {#if !$PermissionsStore.canWrite}
  <div class="bg-red-500 text-red-50 font-bold text-sm py-1 px-2 mb-4">Account is in read only mode.</div>
{/if} -->

{#if ready}
 <List solo>
  <ListItem bottomLine={42} clickable detail on:click={openManageEncryptionModal}>
    <div slot="left">🔐</div>
    Manage Security
    <div slot="right">
      {#if !secretBackedUp}
        <div class=" text-red-500 animate-pulse">⚠️</div>
      {/if}
    </div>
  </ListItem>
 </List>
{/if}
