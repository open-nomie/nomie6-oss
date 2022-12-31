<script lang="ts">

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Lang } from '../../store/lang'
  import TrackablePill from '../trackable/trackable-pill.svelte'
  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { GoalClass } from './goal-class'
  import GoalDetail from './goal-detail/goal-detail.svelte'
  import { openGoalEditor } from './GoalStore'

  export let id: string
  export let goal: GoalClass

  let trackable: Trackable

  $: if (goal) {
    trackable = $TrackableStore.trackables[goal.tag]
  }

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal mainClass="relative">
  <ToolbarGrid slot="header" className="bg-white dark:bg-black">
    <Button slot="left" primary clear on:click={close}>
      {Lang.t('general.close', 'Close')}
    </Button>
    <div>
      <TrackablePill hideValue transparent {trackable} />
    </div>
    <Button slot="right" primary clear on:click={() => {
      openGoalEditor(goal)
    }}>
      {Lang.t('general.Edit', 'Edit')}
    </Button>
  </ToolbarGrid>
  <GoalDetail bind:goal />
</BackdropModal>
