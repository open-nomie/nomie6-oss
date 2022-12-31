<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Container from '../../components/container/container.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CloseOutline } from '../../components/icon/nicons'
  import Input from '../../components/input/input.svelte'
  import List from '../../components/list/list.svelte'
  import ShortcutButton from '../../components/shortcut-button/shortcut-button.svelte'
  import SortableList2 from '../../components/sortable-list/sortable-list2.svelte'

  import { Device } from '../../store/device-store'
  import { Interact } from '../../store/interact'
  
  import time from '../../utils/time/time'
  
  import { Prefs } from '../preferences/Preferences'
  import { toTrackableArray } from '../trackable/trackable-utils'
  import { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'

  import { TodayStore } from '../usage/today/TodayStore'
  import { UsageLast } from '../usage/UsageStore'
  import type { UniboardType } from './UniboardStore'


  export let board: UniboardType

  const dispatch = createEventDispatcher()

  let workingBoard: UniboardType
  let allTrackables: Array<Trackable>
  let boardTrackables: Array<Trackable>

  $: if (board && !workingBoard) {
    workingBoard = { ...board }
    allTrackables = toTrackableArray($TrackableStore.trackables)
    boardTrackables = getBoardTrackables()
  }

  const getBoardTrackables = (): Array<Trackable> => {
    return workingBoard.elements
      .map((tag) => {
        return allTrackables.find((at) => at.tag === tag)
      })
      .filter((n) => n)
  }

  const dispatchChange = () => {
    dispatch('updated', workingBoard)
  }

  const localRemoveTrackable = async (trackable: Trackable) => {
    const confirmed = await Interact.confirm(
      `Remove ${trackable.tag} from this tab?`,
      'You can always add it back later.'
    )
    if (confirmed) {
      workingBoard.elements = workingBoard.elements.filter((w) => {
        return w !== trackable.tag
      })
      dispatchChange()
    }
    workingBoard.elements = workingBoard.elements
    boardTrackables = getBoardTrackables()
  }
</script>

<section aria-label="Edit this Tabs name and trackables">
  <Container>
    <List solo>
      <Input
        type="text"
        listItem
        placeholder="Tab Label"
        on:input={() => {
          dispatchChange()
        }}
        bind:value={workingBoard.label}
      />
    </List>
  </Container>
  {#key workingBoard.elements.length}
    <Container size="md">
      <SortableList2
        key="id"
        items={boardTrackables}
        direction="xy"
        let:item
        on:update={(evt) => {
          let trackablesArrayData = evt.detail
          workingBoard.elements = trackablesArrayData.map((t) => new Trackable(t).tag)
          dispatchChange()
        }}
      >
        <ShortcutButton
          hideMore
          style="width:{$Device.size === 'xs'
            ? '150px; margin:6px;'
            : $Device.size === 'sm'
            ? '150px; margin:8px;'
            : $Device.size === 'md'
            ? '150px; margin:10px;'
            : '160px; margin:12px;'}"
          compact={$Prefs.compactTrackers}
          id="tracker-{item.tag}"
          title={item.label}
          hoursUsed={$TodayStore.usage[item.tag] ? $TodayStore.usage[item.tag].hours : []}
          subtitle={$UsageLast[item.tag] ? time.fromNow($UsageLast[item.tag].d) : undefined}
          emoji={item.tracker?.emoji}
          value={$TodayStore.usage[item.tag] ? $TodayStore.usage[item.tag].displayValue : undefined}
          oneTap={item.tracker?.one_tap}
          color={item.color}
          className="tracker-{item.id} animate-shake tracker-board-button"
        >
          <button class="delete-button" on:click={() => localRemoveTrackable(item)}>
            <IonIcon icon={CloseOutline} className="text-white" size={12} />
          </button>
        </ShortcutButton>
      </SortableList2>
    </Container>
  {/key}
</section>
