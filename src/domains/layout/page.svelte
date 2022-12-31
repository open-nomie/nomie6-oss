<script lang="ts">
  // svlete
  import { navigate } from 'svelte-navigator'
  // components
  import NToolbar from '../../components/toolbar/toolbar.svelte'
  import NLayout from './layout.svelte'
  //props
  export let className = undefined
  // export let withBack = false;
  export let title = undefined
  // Dynamic
  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty('header') || title
  $: hasSubHeader = (arguments[1].$$slots || {}).hasOwnProperty('sub-header')

  // methods
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
