<script lang="ts">
  import ListItem from '../../components/list-item/list-item.svelte'
  import type { PluginClass } from './plugin-helpers'
  import { openPluginModal, PluginStore } from './PluginStore'

  let list: Array<PluginClass> = []

  $: if ($PluginStore) {
    list = $PluginStore.filter((p) => p.addToMoreMenu && p.active)
  }
</script>

{#each list as plugin}
  <ListItem detail bottomLine={16} on:click={() => openPluginModal(plugin)} title={plugin.name}>
    <span slot="left">{plugin.emoji}</span>
  </ListItem>
{/each}
