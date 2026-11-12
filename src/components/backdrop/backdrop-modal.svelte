<svelte:options runes={true} />

<script lang="ts">


  const { className, mainClass, headerClass, style } = $props()
</script>

<div class="bd-modal {className}" {style}>
  <header class={headerClass}><slot name="header" /></header>
  <main class={mainClass}>
    <slot />
  </main>
  <footer><slot name="footer" /></footer>
</div>

<style lang="postcss" global>
  .bd-modal {
    /* @apply h-full; */
    @apply flex flex-col;

    @apply mt-1;
    max-height: calc(100vh - 10px);
    min-width: 310px;
    width: 100%;
    @apply overflow-hidden;
    @apply rounded-2xl;
    @apply shadow-2xl;
    @apply bg-gray-100 dark:bg-gray-800;
  }
  .modal-fullscreen .bd-modal {
    @apply rounded-none lg:rounded-2xl;
  }
  .modal-fullscreen .bd-modal > main {
    max-height: 100vh !important;
  }
  .bd-modal > main {
    @apply overflow-y-auto;
    @apply z-0; 
    @apply relative;
    max-height: calc(100vh - 50px);
    @apply flex-grow flex-shrink;

  }

  .bd-modal > header,
  .bd-modal > footer {
    @apply flex-grow-0 flex-shrink-0;
    @apply w-full;
  }
</style>
