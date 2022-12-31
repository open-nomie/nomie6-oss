<script lang="ts">
  export let style = ''
  export let rounded: boolean = false
  export let relative: boolean = true
  export let absolute: boolean = false
  export let className: string = ''
  export let mainClass: string = ''
  export let clear: boolean = false
  export let id: string | undefined = undefined
</script>

<div
  {id}
  class:relative
  class:absolute
  class:clear
  class="nui nui-panel {rounded ? 'nui-rounded' : ''}
  {className}"
  {style}
>
  <div class="nui-panel--header">
    <slot name="header" />
  </div>
  <div class="nui-panel--main {mainClass}">
    <slot />
  </div>
  <div class="nui-panel--footer">
    <slot name="footer" />
  </div>
</div>

<style global lang="postcss">
  .nui-panel {
    @apply flex;
    @apply flex-col;
    @apply max-w-full;
    @apply max-h-full;
    @apply w-full;
    @apply flex-grow;
  }

  .nui-panel.nui-rounded {
    @apply rounded-xl;
    @apply shadow-lg;
  }
  .nui-panel.clear {
    @apply bg-transparent;
    box-shadow: none !important;
  }
  .nui-panel--main {
    @apply overflow-x-hidden;
    @apply overflow-y-auto;
    @apply flex-grow;
    @apply flex-shrink;
    @apply h-full;
    @apply w-full;
  }
  .nui-panel--main.overflow-hidden {
    overflow: hidden !important;
  }
  .nui-panel--header {
    @apply flex;
    @apply flex-grow-0;
    @apply flex-shrink-0;
    @apply flex-col;
  }
  .nui-panel--footer {
    @apply flex-grow-0;
    @apply flex-shrink-0;
  }
  .nui-panel--footer [slot='footer'],
  .nui-panel--header [slot='header'] {
    @apply flex;
    @apply flex-col;
  }
</style>
