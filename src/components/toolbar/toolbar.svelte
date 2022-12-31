<script lang="ts">
  export let pinTop = undefined
  export let className = ''
  export let style = ''
</script>

<div class="n-toolbar {pinTop ? 'pin-top' : ''} {className}" {style}>
  <slot />
</div>

<style global lang="postcss">
  .n-toolbar {
    transition: all 0.2s ease-in-out;
    min-height: 50px;
    display: flex;
    align-items: center;

    padding: 0 8pt;
  }
  .n-toolbar h1,
  .n-toolbar h2,
  .n-toolbar h3 {
    font-size: 1em !important;
    margin: 0;
  }
  .n-toolbar .btn-sm {
    max-height: 40px;
  }
  .n-toolbar.hidden {
    opacity: 0;
    pointer-events: none;
  }
  .n-toolbar.pin-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 300;
    background-color: var(--color-solid);
    color: var(--color-inverse);
    min-height: 50px;
    border-bottom: solid 1px rgba(0, 0, 0, 0.1);
    box-shadow: 0px 4px 4px -2px rgba(0, 0, 0, 0.1);
    padding-top: env(safe-area-inset-top);
  }
  .n-toolbar.pin-top.sub-header {
    top: 49px !important;
  }
  .n-toolbar [slot='sub-header'] {
    width: 100%;
  }
  .n-toolbar.stretch {
    justify-content: stretch;
  }
  .n-toolbar .btn-clear,
  .n-toolbar-grid .btn-clear {
    border-radius: 0 !important;
    outline: none !important;
    padding: 0 10px;
    font-size: 1em;
  }
</style>
