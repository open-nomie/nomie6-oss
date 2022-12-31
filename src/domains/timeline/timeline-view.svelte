<script lang="ts">
  import type NLog from '../nomie-log/nomie-log'
  import { logsToTimeline, TimelineFilterProps, TimelineItemType } from './timeline-utils'

  import { TrackableStore } from '../trackable/TrackableStore'
  import TrackablePill from '../trackable/trackable-pill.svelte'

  import { getDateFormats } from '../preferences/Preferences'
  import { createEventDispatcher } from 'svelte'

  import { showTrackablePopmenu } from '../board/boardActions'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronForwardOutline } from '../../components/icon/nicons'
  import { Interact } from '../../store/interact'
  import Container from '../../components/container/container.svelte'
  import { openOnThisDayModal } from '../on-this-day/useOnThisDayModal'

  import math from '../../utils/math/math'
  import ValueButton from '../../components/value-button/value-button.svelte'

  import { Device } from '../../store/device-store'

  import NvirtualList from '../../components/nvirtual-list/nvirtual-list.svelte'
  import { UsageStore } from '../usage/UsageStore'
  import ListItemLog from '../../components/list-item-log/list-item-log.svelte'
  import { textToId } from '../../utils/text/text'

  import ListItem from '../../components/list-item/list-item.svelte'
  

  export let logs: Array<NLog> = []
  export let filters: TimelineFilterProps = {}
  const dispatch = createEventDispatcher()

  let timeline: Array<TimelineItemType> = []
  let dateFormats = getDateFormats()

  let listStartIndex: number
  let listEndIndex: number

  $: if ($TrackableStore) {
    timeline = logsToTimeline(logs, $TrackableStore.trackables)
  }

  let topItem: TimelineItemType | undefined = undefined

  // let lastEndIndex = 0

  $: if (listEndIndex === timeline.length && timeline.length > 0) {
    dispatch('endOfItems')
  }
</script>

<NvirtualList
  on:topItem={(evt) => {
    topItem = evt.detail
    dispatch('scrollItem', evt.detail)
  }}
  items={timeline}
  let:item
  bind:start={listStartIndex}
  bind:end={listEndIndex}
>
  <Container size="md">
    <header class="text-center px-6 items-center mt-6 mb-2 font-bold text-gray-900 dark:text-gray-100">
      <button
        type="button"
        class=" text-left w-full font-bold hover:opacity-80"
        on:click={() => {
          openOnThisDayModal(item.logs[0].end)
        }}
      >
        <div class="text-sm block font-normal  leading-none text-gray-500 mb-1">
          {item.logs[0].endDayjs().fromNow()}
        </div>
        <h2
          class="transform block transition-all duration-500 filler text-xl md:text-2xl"
          class:text-sm={item.logs[0].endDayjs().format('YYYY-MM-DD') ==
            topItem?.logs[0].endDayjs().format('YYYY-MM-DD')}
        >
          {item.logs[0].endDayjs().format(`ddd ${dateFormats.mmm_d_yyyy}`)}
          <IonIcon icon={ChevronForwardOutline} className="opacity-50" size={14} />
        </h2>
      </button>
    </header>

    {#if filters.trackables}
      <div class="timeline-30">
        <div class="my-2 mx-4" class:hidden={!Object.keys(item.usage).length}>
          <div class="trackables relative z-0 rounded-lg bg-white dark:bg-gray-950">
            {#each Object.keys(item.usage)
              .map((tag) => {
                return { usage: item.usage[tag], tag: tag, item }
              })
              .sort((a, b) => {
                return a.usage.logs[a.usage.logs.length - 1].end < b.usage.logs[b.usage.logs.length - 1].end ? 1 : -1
              }) as usageMapItem, index (usageMapItem.tag)}
              <!-- <TimelineItem {item} /> -->
              <ListItem bottomLine={60} id="{textToId(usageMapItem.usage.trackable.tag)}-items">
                <TrackablePill
                  transparent
                  slot="left"
                  on:click={() => showTrackablePopmenu(usageMapItem.usage.trackable)}
                  value={usageMapItem.usage.trackable.formatValue(
                    usageMapItem.usage.trackable.tallyValues(usageMapItem.usage.values)
                  )}
                  hideValue={usageMapItem.usage.trackable.type === 'person'}
                  trackable={usageMapItem.usage.trackable}
                  size={$Device.width < 350 ? 34 : 42}
                  className="stiff z-10 hover:scale-105 focus:scale-95 transition-all transform duration-200 mb-1 mr-1  lg:mr-2 shadow-md lg:col-span-3 md:col-span-6 col-span-6 timeline-pill w-full"
                />
                <div class="w-full">
                  <div class="flex w-full justify-end items-end flex-wrap">
                    {#each usageMapItem.usage.values
                      .map((v, i) => {
                        return { value: v, log: usageMapItem.usage.logs[i], date: usageMapItem.usage.dates[i], usage: usageMapItem.usage, trackable: usageMapItem.usage.trackable, percentage: math.percentage(UsageStore[usageMapItem.usage.trackable.tag]?.max.v || v, v) }
                      })
                      .sort((a, b) => (a.log.end > b.log.end ? 1 : -1)) as usageItem, index (index)}
                      <ValueButton
                        on:click={() => {
                          Interact.logOptions(usageItem.log, {
                            description: usageItem.log.note,
                          })
                        }}
                        percentage={usageItem.percentage}
                        value={usageItem.trackable.formatValue(usageItem.value)}
                        wrapperClass="m-px"
                        size={48}
                        date={usageItem.date}
                        color={usageItem.trackable.color}
                        topLabel={usageItem.date.format(dateFormats.time).replace(/( |M)/g, '').toLowerCase()}
                      />
                    {/each}
                  </div>
                </div>
              </ListItem>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    {#if filters.notes}
      <div class="notes">
        {#each item.logs.filter((nlog) => {
          if (filters.trackables) return nlog.hasNote
          return true
        }).sort((a,b)=>{
          if(a.pinned || b.pinned) {
            return a.pinned < b.pinned ? 1 : -1
          } else {
            return a.end < b.end ? 1 : -1
          }
        }) as log}
          <div class="px-4 py-2">
            <ListItemLog {log} hideTrackables={filters.trackables} />
          </div>
        {/each}
      </div>
    {/if}
    <!-- {#if filters.maps}
      <div class="px-4 pb-4">
        {#if item.logs.filter(l=>l.lat).length}
        <div class="map relative h-28 px-4 flex items-center justify-center bg-gray-200 dark:bg-gray-900 text-gray-500 text-opacity-50 rounded-lg">
          <Map lock records={item.logs} className="h-28 rounded-lg overflow-hidden shadow-md" />
        </div>
        {/if}
      </div>
    {/if} -->
  </Container>
</NvirtualList>

<style global lang="postcss">
  .map-floater {
    @apply absolute bottom-40 left-4;
    @apply h-20 w-20;
    @apply z-50;
  }
  .map-floater .leaflet-bottom,
  .map-floater .leaflet-top,
  .map-floater .leaflet-left {
    @apply hidden;
  }
  .bubble {
    @apply bg-white dark:bg-gray-950;
    /* @apply bg-opacity-90 dark:bg-opacity-90; */
    @apply rounded-xl;
    @apply p-2 pb-1;
    @apply shadow-sm;
  }

  .timeline-token {
    @apply text-black dark:text-white rounded-lg p-0;
    @apply ring-primary-500 ring-offset-4;
    @apply bg-primary-500 bg-opacity-20;
  }
  .timeline-token:active,
  .timeline-token:focus {
    @apply ring-2;
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
</style>
