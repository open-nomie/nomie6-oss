<svelte:options runes={true} />

<script lang="ts">
  import NdumpObject from './ndump-object.svelte'


  const { variable } = $props()
</script>

<div class="ndump border-blue-500 border-4 shadow-md rounded-md">
  <NdumpObject {variable} />
</div>
