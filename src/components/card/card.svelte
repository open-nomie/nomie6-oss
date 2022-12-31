<script lang="ts">
  import Toolbar from '../toolbar/toolbar.svelte'
  import Text from '../text/text.svelte'

  export let className = ''
  export let style = ''
  export let title = undefined
  export let pad = false
  export let compact = false
  export let shadow = true
  export let bodyClass = ''
</script>

<div class="n-card {className} {pad ? 'p-3' : ''} {compact ? 'comapct' : ''} {!shadow ? 'box-shadow-off' : ''}" {style}>
  {#if title || $$slots['header']}
    <Toolbar className="justify-between stiff h-10">
      <div class="flex-grow w-full">
        <Text className="title {pad ? 'pb-3' : 'p-3'}" bold>{title}</Text>
      </div>
      <slot name="header" />
    </Toolbar>
  {/if}
  <div class="n-card-body h-full relative {bodyClass}"><slot /></div>
</div>

<style global>
  .n-card {
    @apply relative;
    @apply bg-white dark:bg-gray-900;
    @apply shadow-md;
    @apply flex flex-col;
    @apply rounded-lg;
    @apply overflow-auto;
    @apply text-gray-900 dark:text-white;
  }
  .n-card.compact .title {
    font-size: 0.7em;
  }
</style>
