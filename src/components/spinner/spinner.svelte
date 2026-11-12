<svelte:options runes={true} />

<script lang="ts">
  import Circle3 from './circle3.svelte'

  const { size = 60, style = '' } = $props()
</script>

<Circle3 {size} {style} />
