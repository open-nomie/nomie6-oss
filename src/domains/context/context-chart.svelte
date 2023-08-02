<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'

  import type { TrackableUsage } from '../usage/trackable-usage.class'
  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { getContextOn } from './context-utils'

  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  import { hex2rgb } from '../../modules/colors/colors'

  import { showTrackablePopmenu } from '../board/boardActions'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import ExpandOutline from '../../n-icons/ExpandOutline.svelte'
  import { Interact } from '../../store/interact'
  import {
    addDividerToFirst,
    getDatePopButtons,
    getLogPopButtons,
    getTrackableDetailPopButton,
  } from '../../modules/pop-buttons/pop-buttons'

  const dispatch = createEventDispatcher()

  export let date: Date = new Date()
  export let height: number = 320
  export let className: string = ''

  export let size: 'sm' | 'md' | 'lg' | 'auto' = 'sm'

  // type ContextDetails = {
  //   date: Date
  //   trackable?: Trackable
  //   value?: number
  // }

  let boundingBox: HTMLElement
  // let focused: ContextDetails

  interface ContextMapWrapper {
    usage: TrackableUsage
    startDate: Date
    endDate: Date
    startIndex: number
    endIndex: number
    value: number
  }

  interface ContextTrackableUsage {
    trackable: Trackable
    marks: Array<ContextMapWrapper>
  }

  let contextItems: Array<TrackableUsage> = []

  // function focus(_context: any) {
  //   focused = _context
  // }

  // function clearFocus() {
  //   focused = undefined;
  // }

  let width: number = 320

  let start: Date
  let end: Date

  let rowHeight: number = 0

  let contextMap: Array<ContextTrackableUsage> = []

  /**
   * Grid of 60
   * [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
   */
  let lastDate: Date
  $: if (date && date !== lastDate) {
    // days = []
    lastDate = date
    start = dayjs(date).subtract(30, 'day').toDate()
    end = dayjs(date).add(30, 'day').toDate()
    generateContextMap()
  }

  /**
   * Generate the Needed Context Chart - should this be in a store?
   */
  async function generateContextMap() {
    const trackables = $TrackableStore.trackables
    const frameStart = dayjs(start)
    const frameEnd = dayjs(end)

    const res: any = await getContextOn(date, trackables)

    contextItems = res
      ? Object.keys(res).map((id: string) => {
          return res[id]
        })
      : []

    const final: Array<ContextTrackableUsage> = []
    // Loop over context items  (1 per trackable)
    contextItems.forEach((contextUsage: TrackableUsage) => {
      const node: ContextTrackableUsage = {
        trackable: contextUsage.trackable,
        marks: [],
      }
      const trackable = contextUsage.trackable
      ;(contextUsage.dates || []).forEach((loopDate, index) => {
        // Get Reverb Days
        let parsedValue =
          trackable.ctx.duration > trackable.value ? trackable.ctx.duration : trackable.value || trackable.ctx.duration

        let contextItem: ContextMapWrapper = {
          startDate: loopDate.toDate(),
          usage: contextUsage,
          endDate: dayjs(loopDate)
            .add(parsedValue || 1)
            .toDate(),
          startIndex: dayjs(loopDate).diff(frameStart, 'day'),
          endIndex: frameEnd.diff(dayjs(loopDate), 'day'),
          value: parsedValue,
        }
        node.marks.push(contextItem)
      })
      final.push(node)
    })

    contextMap = final.sort((a, b) => {
      const avalue = a.marks[0].endDate.getTime() + a.marks[0].value
      const bvalue = b.marks[0].endDate.getTime() + b.marks[0].value
      return avalue < bvalue ? 1 : -1
    })
    rowHeight = height / final.length
    rowHeight = rowHeight < 1 ? 10 : rowHeight
    if (contextMap.length === 0) {
      size = 'sm'
    }
    console.log(contextMap);
  }

  onMount(() => {
    if (boundingBox) {
      width = boundingBox.offsetWidth
      height = boundingBox.offsetHeight
    }
  })
</script>

<div class="relative context-wrapper size-{size} {className}">
  <div class="cc-now-mark" />

  <div
    class=" context-chart-bound md:rounded-xl"
    style="--cc-width:{width}px; --cc-height:{height}px; --cc-item-count:{contextMap.length}; --cc-row-height:{rowHeight}px;"
    bind:this={boundingBox}
  >
    {#if contextMap.length == 0}
      <div class="w-full h-full flex items-center justify-center text-gray-500 text-xs">
        No Context for this time period.
      </div>
    {/if}
    {#each contextMap as contextItem}
      <div
        class="text-white cc-item-holder"
        on:click={() => {
          dispatch('click', contextItem.trackable)
        }}
        style="--trackable-color:{contextItem.trackable.color}; --trackable-color-rgb:{hex2rgb(
          contextItem.trackable.color
        )}"
        data-label={contextItem.trackable.label}
      >
        <button
          on:click={() => {
            showTrackablePopmenu(contextItem.trackable)
          }}
          class="mr-1 bar-trackable-label flex items-center"
        >
          {contextItem.trackable.label}
          <TrackableAvatar trackable={contextItem.trackable} size={16} className="ml-1 shadow-md" />
        </button>
        {#each contextItem.marks as mark, index}
          <div
            class="cc-bar"
            on:click={() => {
              dispatch('item-click', mark)
              Interact.popmenu({
                id: `context-item-${mark.usage.trackable.tag}`,
                buttons: [
                  ...getLogPopButtons(mark.usage.logs[0]),
                  ...addDividerToFirst(getTrackableDetailPopButton(mark.usage.trackable)),
                  ...addDividerToFirst(getDatePopButtons(mark.startDate)),
                ],
              })
            }}
            style="--cc-start-index:{mark.startIndex}; --cc-bar-parts:{mark.value};"
          >
            <div class="cover" />
          </div>
        {/each}
      </div>
    {/each}
  </div>
  {#if size !== 'auto'}
    <button
      class="absolute transition-all rounded-lg h-7 w-7 flex items-center justify-center border-opacity-70 duration-200 bottom-1 left-1 z-40 {size ==
      'sm'
        ? 'bg-white bg-opacity-10 text-white'
        : 'bg-white bg-opacity-30 text-white'} "
      on:click={() => {
        size = size == 'sm' ? 'lg' : 'sm'
      }}
    >
      <IonIcon size={16} icon={ExpandOutline} />
    </button>
  {/if}
</div>

<style global lang="postcss">
  .context-chart-bound {
    @apply relative;
    @apply bg-black;
    @apply h-full;
    @apply w-full;
    @apply flex-grow;
    @apply flex-shrink;
    @apply flex;

    @apply overflow-y-auto;
    @apply overflow-x-hidden;
    @apply flex-col;
    --cc-unit: calc((var(--cc-width)) / 60);
    @apply transition-all duration-500 ease-in-out;
    @apply py-1;
    /* height: var(--cc-height); */
  }

  .context-wrapper {
  }

  .context-wrapper.size-sm {
  }
  .context-wrapper.size-auto {
    @apply h-auto;
    @appy min-h-screen;
    @apply overflow-visible;
    @apply rounded-none;
  }

  .context-wrapper.size-sm .context-chart-bound {
    @apply h-20;
    @apply overflow-hidden;
  }

  .context-wrapper.size-lg .context-chart-bound {
    @apply h-auto;
    @apply overflow-y-auto;
  }
  .size-auto .context-chart-bound {
    border-radius: 0 !important;
  }

  .context-wrapper.size-sm .cc-item-holder,
  .context-wrapper.size-sm .cc-bar {
    min-height: 2px;
    height: calc(80px / var(--cc-item-count));
    max-height: 100px;
  }

  .context-wrapper.size-lg .cc-item-holder,
  .context-wrapper.size-lg .cc-bar {
  }
  .context-wrapper.size-sm .cc-item-holder .bar-trackable-label {
    @apply hidden;
  }

  .cc-now-mark {
    @apply absolute;
    @apply z-50;
    @apply top-0;
    @apply bottom-0;
    left: 50%;
    border-left: solid 2px rgba(255, 255, 255, 0.2);
  }
  .context-wrapper.size-auto .cc-bar,
  .context-wrapper.size-auto .cc-item-holder {
    @apply text-xs;
    min-height: 24px;
  }

  .cc-item-holder {
    height: var(--cc-row-height);
    @apply relative;
    @apply w-full;
    @apply items-center;
    @apply justify-center;
    @apply flex;
    @apply flex-shrink-0;
    min-height: 12px;
  }
  .context-wrapper.size-lg .cc-item-holder {
    @apply h-5;
    @apply text-sm;
  }
  .context-wrapper.size-lg .cc-item-holder .bar-trackable-label {
    @apply text-sm;
  }
  .context-wrapper.size-lg .cc-bar {
    @apply h-5;
  }
  .cc-item-holder .bar-trackable-label {
    display: flex;
    position: absolute;
    @apply right-3;
  }
  .cc-bar {
    @apply absolute;
    @apply flex;
    @apply items-center;
    @apply rounded-full;
    max-height: 100px;
    height: var(--cc-row-height);
    left: calc(var(--cc-unit) * var(--cc-start-index));
    width: calc(var(--cc-unit) * var(--cc-bar-parts));
    @apply items-center;
  }
  .cc-bar .cover {
    @apply flex;
    @apply items-center;
    @apply pl-1;
    content: '';
    /* @apply bg-green-500; */
    background-color: var(--trackable-color);
    background: linear-gradient(
      45deg,
      rgba(var(--trackable-color-rgb), 1) 0%,
      rgba(var(--trackable-color-rgb), 0.06) 100%
    );
    @apply rounded-full;
    @apply absolute;
    @apply top-0;
    @apply left-0;
    @apply bottom-0;
    @apply right-0;
    overflow: hidden;
  }
</style>
