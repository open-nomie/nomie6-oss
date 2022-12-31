<!-- <script lang="ts">
import ListItem from "../../../components/list-item/list-item.svelte";
import List from "../../../components/list/list.svelte";
import { onMount } from "svelte";
import { getS3Connection, openS3ConnectionModal, S3ConnectionType } from "../engines/engine.s3";

let connection:S3ConnectionType;
onMount(async ()=>{
  connection = await getS3Connection();
})

</script>
{#if connection?.validated}
<List solo>
  <ListItem clickable on:click={()=>openS3ConnectionModal()}>
    <h2 class="line-clamp-2 leading-tight dark:text-gray-300 text-xs w-full">
      {connection.server}
    </h2>
    <div slot="right" class="text-primary-500">
      Manage
    </div>
  </ListItem>
</List>
{/if} -->