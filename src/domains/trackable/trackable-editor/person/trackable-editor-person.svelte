<script lang="ts">
  import Input from '../../../../components/input/input.svelte'
  import List from '../../../../components/list/list.svelte'
  import type { Trackable } from '../../Trackable.class'

  export let trackable: Trackable
</script>

<List solo>
  <Input
    listItem
    type="textarea"
    label="Note about Person"
    placeholder="About this Person"
    bind:value={trackable.person.notes}
  />
</List>
