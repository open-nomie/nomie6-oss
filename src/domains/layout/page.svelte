<svelte:options runes={true} />

<script lang="ts">
  // svlete
  import { navigate } from '../../vendor/svelte-navigator'
  // components
  import NToolbar from '../../components/toolbar/toolbar.svelte'
  import NLayout from './layout.svelte'
  //props
  const { className = undefined, title = undefined } = $props<{
    className?: any
    title?: any
  }>()
  let hasHeader = $derived(!!$$slots.header || title)
  let hasSubHeader = $derived(!!$$slots['sub-header'])
</script>

<NLayout pageTitle={title} {className}>
  <div slot="header">
    <slot name="header" />
    {#if hasSubHeader}
      <NToolbar className="sub-header">
        <slot name="sub-header" />
      </NToolbar>
    {/if}
  </div>
  <div slot="content">
    <slot />
  </div>
</NLayout>
