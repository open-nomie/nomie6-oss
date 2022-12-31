<script lang="ts">
  import ListItem from '../../../components/list-item/list-item.svelte'

  import List from '../../../components/list/list.svelte'

  import { AwardStore } from '../AwardsStore'

  $: awardsToShow = $AwardStore.awards
    .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
    .filter((a, index) => index < 4)
</script>


  <ListItem title="Awards" detail to="/awards">
    <div slot="left">🥇</div>
    <div slot="right" class="flex items-center space-x-1">
      {#if awardsToShow.length}
        {#each awardsToShow as award, index}
          <img alt="award" src={`/images/awards/${award.id}.svg`} class="h-4 w-4" />
        {/each}
      {:else}
        None
      {/if}
    </div>
  </ListItem>
