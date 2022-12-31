<script lang="ts">
  import type NLog from '../nomie-log/nomie-log'
  import { logsToTimeline, TimelineItemType } from './timeline-utils'

  import { TrackableStore } from '../trackable/TrackableStore'
  import TrackablePill from '../trackable/trackable-pill.svelte'
  import NoteTextualizer from '../../components/note-textualizer/note-textualizer.svelte'
  import { getDateFormats, Prefs } from '../preferences/Preferences'
  import VirtualList from '@sveltejs/svelte-virtual-list'
  import { createEventDispatcher } from 'svelte'
  import LocationBadge from '../../components/location-badge/location-badge.svelte'
  import { openLocationViewer } from '../map/LocationModalStore'
  import { showTrackablePopmenu } from '../board/boardActions'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronForwardOutline, More } from '../../components/icon/nicons'
  import { Interact } from '../../store/interact'
  import Container from '../../components/container/container.svelte'
  import { openOnThisDayModal } from '../on-this-day/useOnThisDayModal'

  import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'
  import { openDropMenu } from '../../components/menu/useDropmenu'

  export let logs: Array<NLog> = []

  const dispatch = createEventDispatcher()
  let timeline: Array<TimelineItemType> = []
  let dateFormats = getDateFormats()

  let listStartIndex: number
  let listEndIndex: number

  $: if ($TrackableStore) {
    timeline = logsToTimeline(logs, $TrackableStore.trackables)
  }

  let topItem: TimelineItemType | undefined = undefined

  $: if (listStartIndex && timeline) {
    topItem = timeline[listStartIndex]
    dispatch('scrollItem', topItem)
  } else if (listStartIndex === 0 && timeline) {
    topItem = timeline[listStartIndex]
    dispatch('scrollItem', topItem)
  }

  let lastEndIndex = 0
  $: if (lastEndIndex !== listEndIndex && listEndIndex === timeline.length && timeline.length > 0) {
    lastEndIndex = listEndIndex

    dispatch('endOfItems')
  }

  const showNoteSelectMenu = (evt: any, logs: Array<NLog> = []) => {
    const menu: Array<PopMenuButton> = logs.map((log) => {
      return {
        title: log.note,

        click() {
          Interact.logOptions(log, { description: log.note })
        },
      }
    })

    openDropMenu(evt.target, menu)
  }
</script>

<div class="timeline dark:text-gray-300 ">
  <!-- <div class="fixed top-12 bg-black w-full p-4 flex z-50">
    {listStartIndex} /
    {listEndIndex} /
    {timeline.length}
  </div> -->

  <VirtualList items={timeline} let:item bind:start={listStartIndex} height={`90vh`} bind:end={listEndIndex}>
    <Container size="md">
      {#if item !== timeline[0]}
        <header class="text-center px-6 grid grid-cols-12 items-center mt-2 font-bold text-gray-900 dark:text-gray-100">
          <div class="col-span-2" />
          <button
            type="button"
            class="col-span-8 flex-col items-center font-bold hover:text-primary-500 justify-center"
            on:click={() => {
              openOnThisDayModal(item.logs[0].end)
            }}
          >
            <span
              class="transform block transition-all duration-500 h-6"
              class:text-sm={item.logs[0].endDayjs().format('YYYY-MM-DD') ==
                topItem?.logs[0].endDayjs().format('YYYY-MM-DD')}
              class:opacity-30={item.logs[0].endDayjs().format('YYYY-MM-DD') ==
                topItem?.logs[0].endDayjs().format('YYYY-MM-DD')}
            >
              {item.logs[0].endDayjs().format(`ddd ${dateFormats.mmm_d_yyyy}`)}
              <IonIcon icon={ChevronForwardOutline} className="opacity-50" size={14} />
            </span>

            <span class="text-sm block font-normal  leading-none text-gray-500">
              {item.logs[0].endDayjs().format(`${$Prefs.use24hour ? 'HH:mm' : 'h:mm a'}`)}
            </span>
          </button>

          <div class="col-span-2 justify-end flex items-center">
            {#if item.logs[0].lat}
              <LocationBadge
                on:click={() => {
                  openLocationViewer(
                    [{ name: item.logs[0].location, lat: item.logs[0].lat, lng: item.logs[0].lng }],
                    item.logs
                  )
                }}
                location={{ name: item.logs[0].location, lat: item.logs[0].lat, lng: item.logs[0].lng }}
              />
            {/if}
          </div>
        </header>
      {/if}

      <div class="timeline-30">
        <!-- <div class="text-xs  font-semibold leading-none mb-2 text-gray-500">{item.time.format(dateFormats.time)}</div> -->
        <div class="bubble my-2 mx-4" class:hidden={!Object.keys(item.usage).length}>
          <div class="flex items-center justify-between text-xs mb-2 px-2">
            <span class="text-gray-500">{item.logs[0].endDayjs().format(dateFormats.time)}</span>
            <button
              type="button"
              class="text-gray-800 dark:text-white"
              on:click={(evt) => {
                if (item.logs.filter((l) => !l.hasNote).length === 1) {
                  Interact.logOptions(item.logs.filter((l) => !l.hasNote)[0], {
                    description: item.logs[0].note,
                  })
                } else {
                  showNoteSelectMenu(
                    evt,
                    item.logs.filter((l) => !l.hasNote)
                  )
                }
              }}><IonIcon size={22} icon={More} /></button
            >
          </div>
          <div class=" flex flex-wrap trackables">
            {#each Object.keys(item.usage) as tag}
              <TrackablePill
                on:click={() => showTrackablePopmenu(item.usage[tag].trackable)}
                value={item.usage[tag].trackable.formatValue(
                  item.usage[tag].trackable.tallyValues(item.usage[tag].values)
                )}
                hideValue={item.usage[tag].trackable.type === 'person'}
                trackable={item.usage[tag].trackable}
                size={40}
                className="mb-1 mr-1 lg:mb-2 lg:mr-2 shadow-md timeline-pill w-full"
              />
            {/each}
          </div>
        </div>
      </div>
      <div class="notes">
        {#each item.logs.filter((nlog) => nlog.hasNote) as log}
          <div class="px-4 py-2">
            <div class="note-bubble bubble">
              <div class="flex items-center justify-between text-xs mb-1 -mt-2">
                <span class="text-gray-500">{log.endDayjs().format(dateFormats.time)}</span>
                <button
                  type="button"
                  class="text-gray-800 dark:text-white"
                  on:click={() => {
                    Interact.logOptions(log, {
                      description: item.logs[0].note,
                    })
                  }}><IonIcon size={22} icon={More} /></button
                >
              </div>
              <p class="text-base   leading-tight">
                <NoteTextualizer
                  note={log.note}
                  className=" leading-snug dark:text-gray-300 text-gray-700"
                  tokenClass="timeline-token"
                  on:textClick={(evt) => {
                    const trackable = tokenToTrackable(evt.detail, $TrackableStore.trackables)
                    showTrackablePopmenu(trackable)
                  }}
                />
              </p>
            </div>
          </div>
        {/each}
      </div>
    </Container>
  </VirtualList>
</div>

<style global lang="postcss">
  .bubble {
    @apply bg-white dark:bg-black;
    @apply bg-opacity-90 dark:bg-opacity-90;
    @apply rounded-xl;
    @apply p-2 pb-1;
    @apply shadow-sm;
  }

  .timeline-token {
    @apply dark:bg-black dark:text-white;
    @apply text-black bg-gray-100 rounded-lg p-0;
  }
  .bubble.note-bubble {
    @apply p-4;
    @apply font-medium;
  }

  .bubble .timeline-pill .title-value h3 {
    @apply font-medium dark:text-gray-300;
  }

  .bubble.note-bubble .text-size-sm {
    @apply text-base;
  }
  .bubble.note-bubble .text-size-big {
    @apply text-lg;
  }
  .timeline svelte-virtual-list-row {
    /* @apply relative; */
  }
  .timeline svelte-virtual-list-viewport {
    /* @apply relative; */
  }
  .timeline svelte-virtual-list-contents {
    /* @apply relative; */
  }
</style>
