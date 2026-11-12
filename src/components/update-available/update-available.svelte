<svelte:options runes={true} />

<script lang="ts">
  import { pwService } from '../../modules/pwa/PWAService'

  const offlineReady = pwService.offlineReady
  const needRefresh = pwService.needRefresh
  const isCheckingForUpdates = pwService.isCheckingForUpdates
  const lastCheckTimeMs = pwService.lastCheckTimeMs

  function close() {
    pwService.dismissOfflineNotification()
    pwService.dismissUpdateNotification()
  }

  async function handleUpdate() {
    await pwService.applyUpdate()
  }

  async function handleManualCheck() {
    await pwService.manualCheckForUpdates()
  }

  let toast = $derived($needRefresh || $offlineReady)

  // Format last check time
  let lastCheckDisplay = $derived.by(() => {
    if (!$lastCheckTimeMs) return null
    const now = Date.now()
    const diffMs = now - $lastCheckTimeMs
    const diffMin = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return 'earlier'
  })
</script>

{#if toast}
  <div class="install-backdrop" style="z-index:8999">
    <div class="pwa-toast" role="alert">
      <div class="px-2 pb-2 mb-2 text-lg font-medium leading-snug text-black message">
        {#if $offlineReady}
          <span>App ready to work offline</span>
        {:else if $needRefresh}
          <h1 class="mb-2 text-2xl font-bold text-black">🎉 Update Available</h1>
          <p>A new version of Nomie is ready to use.</p>
        {/if}
      </div>

      <div class="text-xs text-gray-600 px-2 pb-2">
        {#if lastCheckDisplay}
          Last checked: {lastCheckDisplay}
        {/if}
      </div>

      <div class="flex items-center justify-end space-x-4">
        {#if $offlineReady}
          <button
            disabled={$isCheckingForUpdates}
            class="px-4 py-2 filler font-bold bg-white shadow-sm rounded-xl text-primary-600 disabled:opacity-50"
            title="Check for updates manually"
            on:click={handleManualCheck}
          >
            {#if $isCheckingForUpdates}
              Checking...
            {:else}
              Check Now
            {/if}
          </button>
        {/if}

        <button
          class="px-4 py-2 filler font-bold bg-white shadow-sm rounded-xl text-primary-600"
          on:click={close}
        >
          Later
        </button>

        {#if $needRefresh}
          <button
            aria-label="Update the App"
            on:click={handleUpdate}
            class="px-4 py-2 font-bold filler bg-white shadow-sm rounded-xl text-primary-600"
          >
            Update Now
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .install-backdrop {
    @apply fixed;
    @apply top-0;
    @apply left-0;
    @apply right-0;
    @apply bottom-0;
    @apply flex;
    @apply flex-col;
    @apply justify-center;
    @apply items-center;
    @apply bg-gray-500;
    @apply bg-opacity-50;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    @apply backdrop-filter backdrop-saturate-150 backdrop-blur-sm;
    padding-bottom: calc(env(safe-area-inset-bottom));
  }
  .pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    min-width: 200px;
    @apply p-4;
    border: 1px solid #8885;
    @apply rounded-xl;
    z-index: 1;
    text-align: left;
    @apply shadow-xl;
    @apply bg-primary-500;
    @apply text-white;
    @apply rounded-xl;
  }
</style>
