<script lang="ts">
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
  export let className: string = ''
</script>

<div class={`nui-container nui-container-${size} ${className}`}>
  <slot />
</div>

<style global lang="postcss">
  .nui-container-sm {
    max-width: 600px;
  }
  .nui-container-xs {
    @apply max-w-screen-sm;
  }
  .nui-container-md {
    max-width: 768px;
  }
  .nui-container-lg {
    @apply max-w-screen-xl;
  }
  .nui-container-xl {
    max-width: 1200px;
  }
  .nui-container {
    @apply w-full;
    @apply mx-auto;
  }
</style>
