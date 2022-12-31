<script lang="ts">
  import NdumpObject from './ndump-object.svelte'

  export let variable: any = undefined
</script>

<div class="ndump border-blue-500 border-4 shadow-md rounded-md">
  <NdumpObject {variable} />
</div>
