<svelte:options runes={true} />

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

  const { style = '', className = '', pageTitle, showTabs = true, headerClassNames = '', showCapture = true } = $props<{
    style?: string
    className?: string
    pageTitle?: string
    showTabs?: boolean
    headerClassNames?: string
    showCapture?: boolean
  }>()

  let mainEle: HTMLElement | undefined = $state(undefined)
  let mainEleHeight: string = $state('100%')

  let id = `layout-${nid()}`

  // Controll Scrolling

  let footerBuffer: HTMLElement | undefined = $state(undefined)
  let footerEle: HTMLElement | undefined = $state(undefined)

  let hasHeader = $derived(!!$$slots.header)
  let hasFooter = $derived(!!$$slots.footer)
  let hasContent = $derived(!!$$slots.content)
  let hasBottom = $derived(!!$$slots.bottom)

  $effect(() => {
    const footerPos = getElementPosition(footerEle)
    if (footerPos && footerBuffer) {
      footerBuffer.style.height = `${footerPos.eleHeight + 70}px`
    }
  })

  $effect(() => {
    if ($Device.height && mainEle) {
      const pos = getElementPosition(mainEle)
      mainEleHeight = `${pos.eleHeight}px`
    }
  })
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
        <header class=" non-printable z-50 sticky top-0  glass {headerClassNames}">
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
    <div class="non-printable">
      <DesktopSidebar loggedIn={showTabs} />
    </div>
    {/if}
  </div>
  {#if hasBottom}
    <main id="nomie-main-bottom" class="glass xl:ml-56 non-printable">
      <slot name="bottom" />
    </main>
  {/if}
  <!-- <div id="footer-buffer" class="sticky bottom-0" bind:this={footerBuffer} /> -->
  <footer
    bind:this={footerEle}
    class="non-printable xl:ml-56  sticky self-justify-start left-0 right-0 bottom-0 z-50 border-t border-gray-300 layout-footer glass dark:border-gray-400 dark:border-opacity-20"
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

<style>
  @media print {
      .non-printable { display: none; }
  }
</style>