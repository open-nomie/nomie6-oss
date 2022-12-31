<script lang="ts">
  import dayjs from 'dayjs'
  import { onMount } from 'svelte'
  import Empty from '../../components/empty/empty.svelte'
  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { wait } from '../../utils/tick/tick'

  import type { TrackableUsage, TrackableUsageMap } from '../usage/trackable-usage.class'

  import math from '../../utils/math/math'
  import { showTrackablePopmenu } from '../board/boardActions'

  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  import { RelatedStore } from './RelatedStore'
  import { Lang } from '../../store/lang'

  import Button from '../../components/button/button.svelte'

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'

import RelatedView from './related-view.svelte'



  export let id: string

  let trackable: Trackable


  $: if ($RelatedStore) {
    trackable = $RelatedStore.trackable
  }

  
    const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal>
  <header class="bg-white dark:bg-black" slot="header">
    <ToolbarGrid>
      <Button on:click={close} slot="left" clear primary>{Lang.t('general.close', 'Close')}</Button>
      <h1 class="ntitle">
        {#if trackable}
          <TrackableAvatar size={24} {trackable} /> {Lang.t('general.related', 'Related')}
        {/if}
      </h1>
    </ToolbarGrid>
  </header>

  <div class="p-4 flex justify-start items-center bg-white dark:bg-black">
    {#if trackable}
      <TrackableAvatar size={44} {trackable} />
    {/if}
    <main class="ml-3">
      <h1 class="font-bold  text-2xl text-black dark:text-white">
        {trackable?.label || 'Loading...'}
      </h1>
      <p class="text-opacity-60 text-gray-500 text-sm">is possibly related to...</p>
    </main>
  </div>

  <RelatedView className="" style="" trackable={trackable} />
</BackdropModal>

<style global lang="postcss">
  .progress-bar {
    @apply flex;
    @apply w-full;
    @apply justify-start;
  }

  .progress-bar .bar {
    @apply rounded-full;
    @apply flex-grow-0;
    @apply flex-shrink-0;
    @apply justify-start;
    @apply items-center;
    @apply flex;
  }
</style>
