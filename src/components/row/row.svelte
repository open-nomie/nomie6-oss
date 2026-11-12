<svelte:options runes={true} />

<script lang="ts">


  const { className, style, insetLeft, insetRight } = $props()
</script>

<style>
  .inset-left {
    margin-left: -12px;
  }
  .inset-right {
    margin-right: -12px;
  }
</style>

<div
  class="flex w-full {className}
  {insetRight ? 'inset-right' : ''}
  {insetLeft ? 'inset-left' : ''}"
  {style}>
  <slot />
</div>
