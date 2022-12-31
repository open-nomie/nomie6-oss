<script lang="ts">
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import { Lang } from '../../store/lang'
  import { CloudAPIStore } from '../cloud-api/CloudApiStore'
  import { navigate } from 'svelte-navigator'
</script>

<List solo title="API" outside>
  <ListItem
    detail
    clickable
    title={Lang.t('settings.nomie-cloud-API', 'Nomie Cloud API')}
    on:click={() => navigate('/cloud-api')}
  >
    <span slot="left">☁️</span>
    <span slot="right">
      {#if $CloudAPIStore.fresh.length}
        <div class="nbtn nbtn-xs nbtn-rounded nbtn-danger">
          {$CloudAPIStore.fresh.length}
        </div>
      {/if}
    </span>
  </ListItem>
</List>
