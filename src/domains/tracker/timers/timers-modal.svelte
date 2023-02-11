<script lang="ts">
  import TrackableAvatar from '../../../components/avatar/trackable-avatar.svelte'
  import Button from '../../../components/button/button.svelte'
  import Counter from '../../../components/counter/counter.svelte'
  import Divider from '../../../components/divider/divider.svelte'

  import ListItem from '../../../components/list-item/list-item.svelte'
  import List from '../../../components/list/list.svelte'

  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import type TrackerClass from '../../../modules/tracker/TrackerClass'
  import { RunningTimers, TrackerStore } from '../TrackerStore'
  import { Lang } from '../../../store/lang'

  import { onTrackerTap } from '../input/TrackerInputStore'

  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'

  export let id: string

  $: trackables = $RunningTimers.map((tracker: TrackerClass) => tracker.toTrackable())

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal className="h-full bg-gray-100 dark:bg-gray-900">
  <ToolbarGrid slot="header">
    <Button primary clear slot="left" on:click={close}>
      {Lang.t('general.close', 'Close')}
    </Button>
    <h1 class="ntitle">Running Timers</h1>
  </ToolbarGrid>
  <main style="min-height:40vh">
    <List solo>
      {#each trackables as trackable, index}
        <ListItem
          on:click={() => {
            onTrackerTap(trackable.tracker, $TrackerStore)
          }}
        >
          <TrackableAvatar {trackable} slot="left" />
          <h1 class="ntitle py-3">{trackable.label}</h1>
          <Counter slot="right" initialDuration={trackable.tracker.timeTracked} started={trackable.tracker.started} color={trackable.tracker.color} />
        </ListItem>
        {#if index < trackables.length - 1}
          <Divider center />
        {/if}
      {/each}
      {#if trackables.length === 0}
        <ListItem>{Lang.t('trackers.no-running-timers', 'No Running Timers')}</ListItem>
      {/if}
    </List>
  </main>
</BackdropModal>
