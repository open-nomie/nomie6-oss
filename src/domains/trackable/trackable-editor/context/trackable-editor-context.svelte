<script lang="ts">
  import Input from '../../../../components/input/input.svelte'

  import List from '../../../../components/list/list.svelte'
  import { parseNumber } from '../../../../utils/parseNumber/parseNumber'
  import type { Trackable } from '../../Trackable.class'

  export let trackable: Trackable
</script>

<List solo>
  <Input
    listItem
    type="select"
    label="Duration"
    placeholder="Duration (in Days)"
    value={`${trackable.ctx.duration || 1}`}
    on:change={(evt) => {
      trackable.ctx.duration = parseNumber(evt.detail)
    }}
  >
    {#each Array(30).fill(0) as count, index}
      <option value={`${index + 1}`}>{index + 1} days</option>
    {/each}
  </Input>
</List>
<p class="list-note">
  Duration Days is how long this context tends to impact your life. Context is used to mark specific points in your life
  with things that can impact you for multiple days. For example being sick, or rushing for a project.
</p>
