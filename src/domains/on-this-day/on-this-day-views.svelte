<script lang="ts">
  import Button from '../../components/button/button.svelte'
  import Container from '../../components/container/container.svelte'

  import Empty from '../../components/empty/empty.svelte'
  import Grid from '../../components/grid/grid.svelte'
  import { People } from '../../components/icon/nicons'
  import ListItemLog from '../../components/list-item-log/list-item-log.svelte'
  

  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { TrackerStore } from '../tracker/TrackerStore'
  import { Device } from '../../store/device-store'
  import { Lang } from '../../store/lang'

  import { showTrackablePopmenu } from '../board/boardActions'
  import { getFocusScoresFromLogs, IFocusResults } from '../focus/focus-utils'
  import { getTrackersAndValuesFromLogs } from '../ledger/ledger-tools'
  import Map from '../map/map.svelte'
  import type NLog from '../nomie-log/nomie-log'
  import { PeopleStore } from '../people/PeopleStore'
  import type Person from '../people/Person.class'
  import TrackablePill from '../trackable/trackable-pill.svelte'
  import { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { OTDViewOption, TrackerProcessedConfig } from './on-this-day-helpers'
  import { getContext, getNotes, getPeople, processTrackers } from './on-this-day-helpers'
  import ContextChart from '../context/context-chart.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  
  import PositivityGrid from '../../components/positivity-bar/positivity-grid.svelte'
  import Memories from '../ledger/Memories.svelte'
  import { createEventDispatcher } from 'svelte'

  export let view: OTDViewOption = 'notes'
  export let logs: Array<NLog> = []

  let trackers: Array<TrackerProcessedConfig> = []
  let notes: Array<NLog> = []
  let people: Array<Person> = []
  let context: Array<string> = []

  const dispatch = createEventDispatcher()

  let lastLogs: string
  let startDate: Date = new Date()

  let columns: number = 3

  $: if ($Device.width < 400) {
    columns = 2
  } else if ($Device.width < 700) {
    columns = 3
  } else if ($Device.width > 900) {
    columns = 3
  }

  let focusScores: Array<IFocusResults>
  let hasFocusScores: boolean

  $: if (logs && logs.length && lastLogs !== logs.map((l) => l._id).join(',')) {
    startDate = logs[0].end
    lastLogs = logs.map((l) => l._id).join(',')
    let trackersUsed = getTrackersAndValuesFromLogs(logs)

    notes = getNotes(logs)
    people = getPeople(logs, $PeopleStore)
    context = getContext(logs)
    trackers = processTrackers(trackersUsed, $TrackerStore)
    focusScores = getFocusScoresFromLogs(logs, $TrackableStore.trackables)

    hasFocusScores =
      focusScores && (focusScores[0].score !== 0 || focusScores[1].score !== 0 || focusScores[2].score !== 0)
  }
</script>

{#if view !== 'context'}
  <Container className="px-2 z-10">
    <div class="px-2 flex space-y-2 lg:space-y-0 lg:space-x-2 lg:flex-row flex-col items-center">
      <PositivityGrid {logs} />
      <!-- <PositivityScorebar {logs} /> -->
      <!-- {#if hasFocusScores}
        <Scorebar
          scores={focusScores.map((fs) => {
            return {
              score: fs.score,
              color: fs.focus.color,
              label: fs.focus.label,
              className: 'text-white',
            }
          })}
        />
      {/if} -->
    </div>
  </Container>
{/if}

{#if view === 'trackers'}
  <Container className="p-3">
    <Grid gap={0} {columns}>
      {#each trackers as tracker (tracker.tag)}
        <TrackablePill
          trackable={tracker.tracker.toTrackable(tracker.value)}
          on:click={() => {
            showTrackablePopmenu(tracker.tracker.toTrackable(tracker.value))
          }}
        />
      {/each}
    </Grid>
  </Container>
{:else if view === 'context'}
  <ContextChart size="auto" date={startDate} />
{:else if view === 'all'}
  {#if !logs.length}
    <slot name="empty" />
  {:else}
    <Container className="p-2 py-4 space-y-4">
      {#each logs as note}
        <!-- Loop over the logs for this day -->
        <ListItemLog
          className="mb-2"
          log={note}
          on:textClick={(evt) => {
            showTrackablePopmenu(tokenToTrackable(evt.detail, $TrackableStore.trackables))
          }}
        />
      {/each}
    </Container>
  {/if}
  
{:else if view === 'notes'}
  {#if !notes.length}
    <Empty title={Lang.t('on-this-day.no-notes', 'No Notes on this Day')} emoji="✍🏽" />
  {:else}
    <Container className="p-2 py-4 space-y-4">
      {#each notes as note}
        <ListItemLog log={note} />
      {/each}
    </Container>
  {/if}
{:else if view === 'people'}
  {#if !people.length}
    <Empty title={Lang.t('on-this-day.no-people', 'No People on this Day')} icon={People} />
  {:else}
    <Container>
      {#each people as person}
        <ListItem
          bottomLine={68}
          clickable
          on:click={() => {
            showTrackablePopmenu(person.toTrackable())
          }}
        >
          <TrackableAvatar trackable={person.toTrackable()} slot="left" size={42} />
          <h2 class="ntitle">{person.displayName}</h2>
          <div class="text-sm text-gray-500" slot="right">@{person.username}</div>
        </ListItem>
      {/each}
    </Container>
  {/if}
{:else if view === 'context'}
  {#if !context.length}
    <Empty title={Lang.t('on-this-day.no-context', 'No Context on this Day')} emoji="🤷‍♂️" />
  {:else}
    <Container>
      <div class="mt-3 n-grid">
        {#each context as context}
          <Button
            shape="round"
            size="lg"
            color="light"
            className="m-2"
            on:click={() => {
              showTrackablePopmenu(
                new Trackable({
                  id: context,
                  type: 'context',
                  context: context,
                })
              )
            }}
          >
            {context}
          </Button>
        {/each}
      </div>
    </Container>
  {/if}
{:else if view === 'locations'}
  {#key logs}
    <Map records={logs} className="h-full h-75vh" />
  {/key}
{/if}

{#if startDate.toDateString() === new Date().toDateString()}
  <Memories
    on:date={(evt) => {
      dispatch('date', evt.detail)
    }}
  />
{/if}
