<script lang="ts">
  import { onMount } from 'svelte'

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import { openDropMenu } from '../../components/menu/useDropmenu'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { AddCircleOutline, ChevronDownOutline } from '../../components/icon/nicons'
  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'

  import { showToast } from '../../components/toast/ToastStore'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Interact } from '../../store/interact'

  import { Lang } from '../../store/lang'
  import { parseNumber } from '../../utils/parseNumber/parseNumber'
  import { wait } from '../../utils/tick/tick'

  import TrackablePill from '../trackable/trackable-pill.svelte'
  import { selectTrackable } from '../trackable/trackable-selector/TrackableSelectorStore'
  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { getTrackableInputValue } from '../tracker/input/TrackerInputStore'
  import { GoalClass, GoalComparisonType } from './goal-class'
  import { GoalComparisonItems } from './goal-utils'
  import { GoalStore } from './GoalStore'
  import is from '../../utils/is/is'

  export let id: string
  export let goal: GoalClass

  let goalTargetValue: number
  let comparison: GoalComparisonType
  let trackable: Trackable
  let workingGoal: GoalClass

  let mounted = false
  $: if (goal && mounted && !workingGoal) {
    workingGoal = new GoalClass(goal)
    comparison = workingGoal.comparison
    trackable = $TrackableStore.trackables[workingGoal.tag]
    goalTargetValue = workingGoal.target
  }

  onMount(() => {
    mounted = true
  })

  const deleteGoal = async () => {
    const confirmed = await Interact.confirm('Delete this goal?', 'You can always recreate it later.')
    if (confirmed) {
      await GoalStore.remove(workingGoal)
      closeModal(id)
    }
  }

  const save = async () => {
    let newGoal = new GoalClass({
      id: workingGoal.id,
      comparison: comparison,
      tag: trackable.tag,
      duration: workingGoal.duration,
      target: goalTargetValue,
    })
    Interact.blocker(`Saving ${trackable.label} goal...`)
    await GoalStore.upsert(newGoal)
    Interact.stopBlocker()
    showToast({ message: 'Goal Saved' })
    close()
  }

  const select = async () => {
    await wait(100)
    trackable = await selectTrackable()
  }

  const selectTargetValue = async () => {
    // let tracker = trackable?.tracker || new TrackerClass({ emoji: '🎛', tag: 'Input', type: 'value' })
    const response = await getTrackableInputValue(trackable, $TrackableStore.trackables)
    const value = parseNumber(response.value)
    if (is.number(value)) goalTargetValue = value
  }

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal mainClass="px-2 lg:px-4 py-2 lg:py-4">
  <ToolbarGrid slot="header">
    <Button slot="left" primary clear on:click={close}>
      {Lang.t('general.close', 'Close')}
    </Button>

    <h1 class="ntitle capitalize">{trackable?.label || ''} Goal</h1>

    <Button slot="right" primary clear disabled={!goalTargetValue || !trackable || !comparison} on:click={save}>
      {Lang.t('general.save', 'Save')}
    </Button>
  </ToolbarGrid>

  <List solo>
    <ListItem clickable on:click={select}>
      <div class="py-2">Which Trackable?</div>
      <div slot="right">
        {#if trackable}
          <TrackablePill {trackable} size={32} hideValue />
        {:else}
          <span class="text-primary-500">Select</span>
        {/if}
      </div>
    </ListItem>
    <Divider left={16} />
    <ListItem
      on:click={(evt) => {
        openDropMenu(
          evt.detail.target,
          GoalComparisonItems.map((item) => {
            return {
              title: item.label,
              click() {
                comparison = item.id
              },
            }
          })
        )
      }}
    >
      <div class="py-2">
        {#if comparison}
          {GoalComparisonItems.find((g) => g.id == comparison).label}
        {:else}
          Should be...
        {/if}
      </div>
      <IonIcon slot="right" icon={ChevronDownOutline} className="opacity-40 pointer-events-none" />
    </ListItem>

    <Divider left={16} />
    <Input
      type="number"
      value={goalTargetValue}
      on:input={(evt) => (goalTargetValue = evt.detail)}
      listItem
      label="Target"
      placeholder="Goal Target"
    >
      <div slot="right" class="flex items-center space-x-2 whitespace-nowrap text-xs">
        {#if goalTargetValue && trackable}
          <div class="text-gray-500">{trackable.formatValue(goalTargetValue)}</div>
        {/if}
        <Button
          clear
          primary
          icon
          on:click={() => {
            selectTargetValue()
          }}
        >
          <IonIcon icon={AddCircleOutline} />
        </Button>
      </div>
    </Input>
  </List>

  <Button clear className="text-red-500 mt-10 mx-auto text-sm" on:click={() => deleteGoal()}>Delete Goal</Button>
</BackdropModal>
