<script lang="ts">
  import Divider from '../../components/divider/divider.svelte'

  import Input from '../../components/input/input.svelte'
  import List from '../../components/list/list.svelte'
  import type { ContextClass } from './context-class'

  export let context: ContextClass
</script>

<List outside solo title="Context Settings" className="context-editor">
  <Input listItem name="Label" bind:value={context.label} placeholder="Context Label" label="Context Label" />
  <Divider left={24} />
  <Input listItem name="Label" bind:value={context.label} placeholder="Context Label" label="Context Label" />
</List>
