<script lang="ts">
  import { onMount } from 'svelte'
  import AppTabs from './tabs.svelte'
  import { Device } from '../../store/device-store'
  export let title = 'Welcome'
  export let refresh = undefined
  export let showTabs = true

  $: if (title) {
    document.title = `Nomie ${title}`
  }

  onMount(async () => {
    Device.scrollToTop()
  })
</script>

<div class="header-slot">
  {#if showTabs}
    <div class="header-fade" />
  {/if}
  <slot name="header" />
</div>
<div class="content-slot">
  <!-- Insert Slotted Content -->
  <slot name="content" />
</div>
<div class="footer-slot">
  <slot name="footer" />
  {#if showTabs}
    <div class="footer-fade" />
    <AppTabs />
  {/if}
</div>

<style lang="postcss" global>
  .content-slot {
    background-color: var(--color-bg);
    -webkit-overflow-scrolling: touch;
    z-index: 0;
    flex-grow: 1;
  }
  .header-slot .n-toolbar {
    z-index: 10;
    position: relative;
  }
  .header-slot .n-toolbar-grid {
    z-index: 10;
    position: relative;
    min-height: 50px;
  }
  .header-slot .btn {
    font-weight: bold;
    font-size: 0.9em;
  }
  .header-slot {
    padding-top: env(safe-area-inset-top);
    background: transparent;
    flex-grow: 0;
    flex-shrink: 0;
    z-index: 1200;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }

  .header-slot .header-fade {
    position: absolute;
    pointer-events: none;
    z-index: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: -30px;
    background: var(--header-fade);
  }
  .footer-fade {
    position: absolute;
    pointer-events: none;
    z-index: 0;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0px;
  }
  .footer-slot {
    z-index: 1200;
    flex-grow: 0;
    flex-shrink: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
