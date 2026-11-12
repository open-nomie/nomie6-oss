<svelte:options runes={true} />

<script lang="ts">
  import Divider from '../../components/divider/divider.svelte'

  import Input from '../../components/input/input.svelte'
  import List from '../../components/list/list.svelte'
  import type { PointerClass } from './pointer-class'


  const { pointer } = $props()
</script>

<List outside solo title="Pointer Settings" className="context-editor">
  <Input listItem name="Label" bind:value={pointer.label} placeholder="Pointer Label" label="Pointer Label" />
  <Divider left={24} />
  <Input listItem name="Label" bind:value={pointer.label} placeholder="Pointer Label" label="Pointer Label" />
</List>
