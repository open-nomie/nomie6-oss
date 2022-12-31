<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import Muuri from 'muuri'
  import type { GridOptions } from 'muuri'
  import nid from '../../modules/nid/nid'

  const dispatch = createEventDispatcher()

  export let items: Array<any> = []
  export let sortable: boolean = true
  export let direction: 'x' | 'y' | 'xy' = 'xy'
  // export let gap = 0
  // export let itemWidth = '120px'
  export let className = ''
  export let containerClass = ''
  export let handleClass: undefined | string = undefined
  export let key: string
  export let id: string = `sl2-${nid()}`

  export let enabled: boolean = true

  // const console = new Logger('↕️ NSortable');
  let cleanItems: Array<any> = []
  $: if (items && items.length) {
    // cleanItems = dedupArray(items, key)
    cleanItems = [...items]
  }

  let grid: Muuri

  let gridEle: HTMLElement
  // let sortableItems: HTMLElement
  let ready: boolean = false

  let lastItemCount: number
  $: if (ready && grid && cleanItems.length !== lastItemCount && sortable) {
    try {
      lastItemCount = cleanItems.length
      // const children = sortableItems.children
      // grid.add(children)
      grid.refreshItems(grid.getItems(), true).layout()
    } catch (e) {
      console.error(`${e.message}`)
    }
  }

  const getMurriConfig = (): GridOptions => {
    return {
      // Initial item elements
      items: '*',

      // Default show animation
      showDuration: 300,
      showEasing: 'ease',

      // Default hide animation
      hideDuration: 300,
      hideEasing: 'ease',

      // layout: (grid, layoutId, items, width, height, callback) => {
      //   Muuri.defaultPacker.setOptions({ horizontal: direction === 'x' })
      //   return Muuri.defaultPacker.createLayout(grid, layoutId, items, width, height, (layoutData) => {
      //     delete layoutData.styles
      //     callback(layoutData)
      //   })
      // },

      dragAutoScroll: {
        targets: [
          // Scroll window on both x-axis and y-axis.
          { element: window, priority: 0, axis: Muuri.AutoScroller.AXIS_Y },
          // Scroll scrollElement (can be any scrollable element) on y-axis only,
          // and prefer it over window in conflict scenarios.
          {
            element: gridEle,
            priority: 1,
            axis: direction == 'x' ? Muuri.AutoScroller.AXIS_X : Muuri.AutoScroller.AXIS_Y,
          },
        ],
      },

      // Item's visible/hidden state styles
      visibleStyles: {
        opacity: '1',
        transform: 'scale(1)',
      },
      hiddenStyles: {
        opacity: '0',
        transform: 'scale(0.5)',
      },
      // Layout
      layout: {
        fillGaps: false,
        horizontal: direction === 'x',
        alignRight: false,
        alignBottom: false,
        rounding: false,
      },
      layoutOnResize: 150,
      layoutOnInit: true,
      layoutDuration: 300,
      layoutEasing: 'ease',

      // Sorting
      sortData: null,

      // Drag & Drop
      dragEnabled: enabled,
      dragContainer: null,
      dragHandle: handleClass,
      dragStartPredicate: {
        distance: 0,
        delay: 0,
      },
      dragAxis: direction,
      dragSort: true,
      dragSortHeuristics: {
        sortInterval: 100,
        minDragDistance: 10,
        minBounceBackAngle: 1,
      },
      dragSortPredicate: {
        threshold: 50,
        action: 'move',
        migrateAction: 'move',
      },
      dragRelease: {
        duration: 300,
        easing: 'ease',
        useDragContainer: true,
      },
      dragCssProps: {
        touchAction: 'none',
        userSelect: 'none',
        userDrag: 'none',
        tapHighlightColor: 'rgba(0, 0, 0, 0)',
        touchCallout: 'none',
        contentZooming: 'none',
      },
      dragPlaceholder: {
        enabled: true,
        createElement: null,
        onCreate: null,
        onRemove: null,
      },

      // Classnames
      containerClass: 'muuri',
      itemClass: 'muuri-item',
      itemVisibleClass: 'muuri-item-shown',
      itemHiddenClass: 'muuri-item-hidden',
      itemPositioningClass: 'muuri-item-positioning',
      itemDraggingClass: 'muuri-item-dragging',
      itemReleasingClass: 'muuri-item-releasing',
      itemPlaceholderClass: 'muuri-item-placeholder',
    }
  }

  let fireDebounce: any
  let firstFire: boolean = false
  const fireSorted = (items: Array<any>) => {
    if (!firstFire) {
      firstFire = true
    } else {
      clearTimeout(fireDebounce)
      fireDebounce = setTimeout(() => {
        dispatch('update', items)
      }, 1000)
    }
  }

  function main() {
    // let isFirst = true
    grid = new Muuri(`#${id} .sl2-grid`, getMurriConfig())

    grid.on('layoutEnd', function (updatedItems) {
      let final = updatedItems.map((item: any) => {
        return JSON.parse(item._element.getAttribute('data-item'))
      })
      fireSorted(final)
      // if (!isFirst)
      // isFirst = false
    })

    ready = true
  }

  onMount(() => {
    main()
  })
</script>

<div {id} class="sortable-list2 {containerClass} h-full w-full" bind:this={gridEle}>
  <div class="sl2-grid flex {className} dir-{direction}">
    {#each cleanItems as item, index (key ? item[key] : index)}
      <div class="item {direction == 'x' ? 'mx-1' : ''}" data-item={JSON.stringify(item)}>
        <div class="item-content" />
        <slot {item} {index} />
      </div>
    {/each}
  </div>

  <!-- <div
    class="n-sortable  {className} {gridId}"
    class:direction-y={direction == 'y'}
    class:direction-x={direction == 'x'}
    class:direction-xy={direction == 'xy'}
    style="--item-width:{itemWidth}; --grid-gap:{gap}px"
    bind:this={gridEle}
  /> -->
</div>

<style global lang="postcss">
  .sl2-grid {
    @apply relative;
  }
  .sl2-grid .item {
    @apply block;
    @apply absolute;
    @apply z-10;
  }

  .sl2-grid.dir-y {
    /* @apply flex flex-col; */
  }
  .sl2-grid.dir-x {
    @apply flex-nowrap;
    @apply flex-row;
  }
  .sl2-grid.dir-y .item {
    @apply min-w-full;
    @apply left-0 right-0;
  }
  .sl2-grid .item.murri-item-dragging {
    @apply z-20;
    @apply opacity-60;
  }
  .sl2-grid .item.murri-item-hidden {
    @apply z-0;
    @apply opacity-40;
  }

  .sl2-grid .item .item-content {
    @apply w-full;
    @apply h-full;
    @apply relative;
  }

  .sl2-grid .murri {
    @apply border-4 border-blue-500;
  }

  .n-sortable {
  }

  /* .n-sortable.direction-x {
    @apply flex flex-row flex-nowrap;
    @apply items-center justify-start;
    @apply px-4;
    @apply bg-pink-800;
    @apply w-full min-w-full;
    @apply relative;
  } */

  /* .n-sortable .item {
    border: solid 1px red !important;
    @apply relative;
  } */

  /* .n-sortable.direction-y .item {
    width: 100%;
  }

  .n-sortable .item.muuri-item-dragging {
    z-index: 3;
  }
  .n-sortable .item.muuri-item-releasing {
    z-index: 2;
  }
  .n-sortable .item.muuri-item-hidden {
    z-index: 0;
  }
  .n-sortable .item-content {
     position: relative;
    width: 100%;
    height: 100%; 
  } */
</style>
