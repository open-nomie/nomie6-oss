<script lang="ts">
  import AppTabs from '../../domains/layout/tabs.svelte'

  import './layout.css'
  import { AppVersion } from '../../modules/app-version/app-version'
  import BackupMessage from '../../components/backup-message/backup-message.svelte'
  import nid from '../../modules/nid/nid'
  import { getElementPosition } from '../../modules/html-elements/position'
  import CaptureLog from '../capture-log/capture-log.svelte'
  import { Device } from '../../store/device-store'
  import DesktopSidebar from './desktop-sidebar.svelte'
  import { hideMenuBlocker, MenuBlockerStore } from '../../components/menu/useDropmenu'
import appConfig from '../../config/appConfig';

  export let style: string = ''
  export let className: string = ''
  export let pageTitle = undefined
  export let showTabs: boolean = true
  export let headerClassNames = ''
  export let showCapture: boolean = true

  let mainEle: HTMLElement
  let mainEleHeight: string = '100%'

  let id = `layout-${nid()}`

  // Controll Scrolling

  let footerBuffer: HTMLElement
  let footerEle: HTMLElement

  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty('header')
  $: hasFooter = (arguments[1].$$slots || {}).hasOwnProperty('footer')
  $: hasContent = (arguments[1].$$slots || {}).hasOwnProperty('content')
  $: hasBottom = (arguments[1].$$slots || {}).hasOwnProperty('bottom')

  $: {
    const footerPos = getElementPosition(footerEle)
    if (footerPos && footerBuffer) {
      footerBuffer.style.height = `${footerPos.eleHeight + 70}px`
    }
  }

  $: if ($Device.height && mainEle) {
    const pos = getElementPosition(mainEle)
    mainEleHeight = `${pos.eleHeight}px`
  }
</script>

<svelte:head>
  <title>{pageTitle ? `${pageTitle} → Nomie 6` : `Nomie 6`}</title>
</svelte:head>

<div
  {id}
  class="n-layout z-50 {className ? className : 'bg-gray-100 dark:bg-gray-800'}
  {hasFooter ? 'has-footer' : ''}
  {hasHeader ? 'has-header' : ''}
  {showTabs ? 'has-tabs' : 'no-tabs'}"
  {style}
>
  <div class="layout-frame z-10">
    {#if $MenuBlockerStore}
      <div
        on:click={hideMenuBlocker}
        class="menu-blocker bg-transparent fixed w-screen h-screen top-0 left-0 r-0 bottom-0 z-20"
      />
    {/if}
    <section class="xl:ml-56 layout-section-wrap">
      {#if hasHeader}
        <header class=" z-50 sticky top-0  glass {headerClassNames}">
          <BackupMessage />
          <slot name="header" />
        </header>
      {/if}
      <main id="nomie-main" bind:this={mainEle} class="layout-main  z-20" style="--mainHeight:{mainEleHeight}">
        {#if hasContent}
          <slot name="content" />
        {:else}
          <slot />
        {/if}
      </main>
    </section>
    {#if $Device.width > 899}
      <DesktopSidebar loggedIn={showTabs} />
    {/if}
  </div>
  {#if hasBottom}
    <main id="nomie-main-bottom" class="glass xl:ml-56">
      <slot name="bottom" />
    </main>
  {/if}
  <!-- <div id="footer-buffer" class="sticky bottom-0" bind:this={footerBuffer} /> -->
  <footer
    bind:this={footerEle}
    class="xl:ml-56  sticky self-justify-start left-0 right-0 bottom-0 z-50 border-t border-gray-300 layout-footer glass dark:border-gray-400 dark:border-opacity-20"
  >
    <slot name="footer" />

    {#if showTabs}
      {#if showCapture}
        <CaptureLog slot="footer" />
      {/if}
      {#if $Device.width < 900}
        <AppTabs className="{$MenuBlockerStore ? 'pointer-events-none' : ''} " />
      {:else}
        <div class="p-4" />
      {/if}
    {/if}
  </footer>
</div>
