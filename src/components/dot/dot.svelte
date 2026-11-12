<svelte:options runes={true} />

<script lang="ts">


  const { size, className } = $props()
</script>

<div
  class="dot z-20 inline-flex rounded-full {className}"
  style="width:{size}px; height:{size}px" />
