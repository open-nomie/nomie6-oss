<svelte:options runes={true} />

<script lang="ts">
  import './toolbar.css'

  const { className = '', style = '', mainClass = '', shadow = false } = $props()
</script>

<div  class="n-toolbar-grid {shadow ? 'shadow' : ''} {className}" {style}>
  <div class="left">
    <slot name="left" />
  </div>
  <div class="main {mainClass}">
    <slot name="main" />
    <slot />
  </div>
  <div class="flex items-center justify-end text-right right">
    <slot name="right" />
  </div>
</div>

<style global lang="postcss">
  .n-toolbar-grid .right [slot] {
    @apply flex;
    @apply items-center;
    @apply justify-end;
  }
  .n-toolbar-grid [slot='left'] > button,
  .n-toolbar-grid .left > button {
    @apply -ml-2;
    @apply font-semibold;
  }
  .n-toolbar-grid [slot='right'] > button:last-child,
  .n-toolbar-grid .right > button:last-child {
    @apply -mr-2;
    @apply font-semibold;
  }
</style>
