<script lang="ts">
  import ListItem from '../../components/list-item/list-item.svelte'
  import Title from '../../components/title/title.svelte'
  import { openTemplateRef } from './templates-svelte-helpers'

  import { templateRefs } from './templates-utils'
</script>

{#each templateRefs as templateRef, index}
  <ListItem
    detail
    bottomLine={16}
    clickable
    on:click={() => {
      openTemplateRef(templateRef.url)
    }}
  >
    <Title>{templateRef.title}</Title>
  </ListItem>
{/each}
