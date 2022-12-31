<script lang="ts">
  import { onMount } from 'svelte'
  import type { UomType } from '../../../utils/nomie-uom/uoms'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import { getGroupedUoms } from '../uom-utils'
  import Storage from '../../../domains/storage/storage'

  import { openUomEditor } from './useUomModal'
  import NPaths from '../../../paths'

  //
  const groupedUoms = getGroupedUoms()
  const customUoms: Array<UomType> = []

  const mounted = async () => {
    const customUomsFromStorage: Array<UomType> = await Storage.get(NPaths.storage.uom())
    // Lets really check the data quality here
    if (customUomsFromStorage instanceof Array) {
      customUomsFromStorage.forEach((uom: UomType) => {
        // customUoms.push(NomieUOM.toUom(uom))
      })
    }
  }

  const createUom = () => {
    openUomEditor({
      onSave(ele) {},
    })
  }

  // const editUom = (uom: UomType) => {
  //   openUomEditor({
  //     uom,
  //     onSave(ele) {

  //     },
  //   })
  // }

  onMount(mounted)
</script>

<section aria-label="Units of Measurment">
  <List solo outside title="Custom UOMs" className="mb-4">
    {#if customUoms.length === 0}
      <div class="px-4 pt-2 text-gray-500">No custom uoms found</div>
      <ListItem on:click={createUom} clickable><span class="text-primary-500">Add a Custom UOM</span></ListItem>
    {:else}{/if}
  </List>

  {#each Object.keys(groupedUoms).filter((t) => t != 'Timer') as uomType}
    <List solo outside title={uomType} className="mb-4">
      {#each groupedUoms[uomType] as uom}
        <ListItem>
          {uom.plural}
        </ListItem>
      {/each}
    </List>
  {/each}
</section>
