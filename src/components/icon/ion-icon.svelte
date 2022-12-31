<script lang="ts">
  export let icon: any = undefined
  export let className: string = ''
  export let style: string = ''
  // export let name: string | undefined = undefined
  // export let dynamicIcon: any | undefined = undefined
  // export let title: string = 'Icon'
  export let size: number = 24
</script>

{#if icon}
  <span class="ion-icon {className} text-current fill-current" {style}>
    <svelte:component this={icon} {size} />
  </span>
{/if}

<style global>
  .ion-icon {
    @apply inline-flex;
    @apply items-center;
    @apply pointer-events-none;
    @apply justify-center;
  }
  .ion-icon svg {
    @apply flex-grow-0 flex-shrink-0;
  }
</style>
