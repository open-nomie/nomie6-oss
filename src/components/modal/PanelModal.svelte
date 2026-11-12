<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Panel from '../panel/panel.svelte'
  import ToolbarGrid from '../toolbar/toolbar-grid.svelte'
  import Modal2 from './modal2.svelte'

  const dispatch = createEventDispatcher()

  const { id, tappable, title, visible, mainClass, headerClass, panelClass } = $props()
</script>

<Modal2
  {id}
  {visible}
  {tappable}
  on:close={() => {
    dispatch('close')
  }}
>
  <Panel className="h-full {panelClass ? panelClass : 'bg-gray-200 dark:bg-gray-800'}">
    <header slot="header" class={headerClass ? headerClass : 'shadow-md'}>
      <ToolbarGrid>
        <div slot="left"><slot name="header-left" /></div>
        {#if title}<h1 class="ntitle">{title}</h1>{/if}
        <slot name="title" />
        <div slot="right"><slot name="header-right" /></div>
      </ToolbarGrid>
      <slot name="subheader" />
    </header>

    <main class="h-full {mainClass}">
      <slot />
    </main>
    <footer slot="footer">
      <slot name="footer" />
    </footer>
  </Panel>
</Modal2>
