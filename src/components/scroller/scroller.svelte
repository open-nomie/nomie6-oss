<script lang="ts">
  /**
   * Scroller
   * Created Feb 11th 2022
   *
   * 2/11/22: This replaces the HScroller - as a generalized scroll container that can
   * report on the first, center and last items. It supports vertical and horizontal
   * scrolling, as well as starting in the center or the end.
   */

  import throttle from 'lodash/throttle'
  import { createEventDispatcher, onMount } from 'svelte'
  import { getElementPosition } from '../../modules/html-elements/position'

  import math from '../../utils/math/math'
  import { wait } from '../../utils/tick/tick'

  export let items: Array<any>
  export let direction: 'x' | 'y' = 'x'
  export let className: string = ''
  export let itemsClass: string = ''
  export let itemClass: string = ''
  export let snapToItem: 'center' | 'start' | 'end' = 'start'
  export let start: 'center' | 'start' | 'end' = 'start'
  export let centerPoint: boolean = false

  export let scrollToIndex: number = undefined

  const dispatch = createEventDispatcher()

  let mounted: boolean = false
  let firstPosItem: any
  let firstPos: ItemDetailType
  let centerPos: ItemDetailType
  let centerPosItem: any
  let scrollWrap: HTMLElement
  let center: number
  let itemDetails: Array<ItemDetailType> = []

  type ItemDetailType = {
    item: any
    index: number
    left: number
    right: number
    top: number
    bottom: number
    width: number
    height: number
  }

  $: if (mounted && scrollToIndex) {
    setTimeout(() => {
      const child = scrollWrap.children[scrollToIndex]

      child?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      })
      main()
    }, 100)
  }

  const initialScroll = () => {
    if (start == 'center') {
      /**
       * Start in the Center
       * We will need to add some padding
       * to the top bottom / left right
       * so that we can still select the firs
       * and last items
       */
      let centerCount = math.round(items.length * 0.5, 0) - 1

      // Scroll it in to View
      scrollWrap.children[centerCount]?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      })
    } else if (start == 'end') {
      /**
       * Start at the End
       * Scroll to the Last Child in the list
       */

      scrollWrap.children[items.length - 1]?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      })
    }
  }

  /**
   * Main Observer
   * This is what adjusts everything after a scroll
   * or the initial mounting.
   * @param first
   */
  const main = (first?: boolean) => {
    // Get Parent Scroll Position
    let scrollAmount = direction == 'x' ? scrollWrap.scrollLeft : scrollWrap.scrollTop

    // Find the Center of this Parent
    center = direction == 'x' ? scrollWrap.clientWidth * 0.5 : scrollWrap.clientHeight * 0.5

    // Create an item Details based on a map of the items provided
    itemDetails = items.map((item, i) => {
      // Get the Child item and position details
      const itemEle = scrollWrap.children[i]

      //@ts-ignore
      // It's an HTML element Typescript!
      const itemPos = getElementPosition(itemEle)

      /**
       * Determin Top Position
       * If its a vertical list, then the top is adjusted
       * why? I'm not really sure why it'd be different
       * but it's working, so - i guess its ok?
       */
      const top = direction == 'x' ? itemPos.top - itemPos.eleHeight : itemPos.top - itemPos.eleHeight * 2

      /**
       * Compile Item Detail Payload
       */
      const itemDetail = {
        index: i,
        item,
        left: itemPos.left,
        right: itemPos.left + itemPos.eleWidth,
        top,
        bottom: top + itemPos.eleHeight,
        width: itemPos.eleWidth,
        height: itemPos.eleHeight,
      }
      return itemDetail
    })

    /**
     * Filter only the visible Items
     * This removes anything that the bottom or left
     * is outside of the parents view port.
     */
    let visible = itemDetails
      .sort((a: ItemDetailType, b: ItemDetailType) => {
        return direction == 'x' ? (a.left > b.left ? 1 : -1) : a.top > b.top ? 1 : -1
      })
      .filter((itemDetail: ItemDetailType) => {
        return direction == 'x' ? itemDetail.right >= 0 : itemDetail.bottom >= 0
      })

    /**
     * Determin Item in First Positiom
     */
    firstPos = visible[0]
    firstPosItem = firstPos?.item

    /**
     * Get item in Center Position
     */
    centerPos = visible.find((vItem) => {
      if (direction == 'x') {
        return vItem.left <= center && vItem.right >= center
      } else {
        return vItem.top <= center && vItem.bottom >= center
      }
    })
    centerPosItem = centerPos?.item

    /**
     * If this is not the first
     * inital load - call a change
     * dispatch
     */
    if (!first) {
      dispatch('change', {
        firstPosItem: {
          item: firstPosItem,
          details: firstPos,
        },
        centerPosItem: {
          item: centerPosItem,
          details: centerPos,
        },
        scrollAmount,
      })
    } else {
      wait(100).then(() => {
        initialScroll()
      })
    }
  } // end Main

  /**
   * Throttle the Call so it doesn't
   * get called all the time
   */
  const onScroll = throttle((evt) => {
    main()
  }, 200)

  // $: if ($Device.width && mounted) {
  //   main()
  // }

  onMount(() => {
    main(true)
    mounted = true
  })
</script>

<div
  class:center-start={start === 'center' || centerPoint}
  class="scroller relative {className} {direction == 'x' ? 'w-full dir-x' : 'h-full dir-y'}"
  style="--ele-width:{scrollWrap?.clientWidth};--ele-height:{scrollWrap?.clientHeight}"
>
  <div
    bind:this={scrollWrap}
    on:scroll={(evt) => {
      onScroll(evt)
    }}
    class="scroller-items {itemsClass} flex {direction == 'x'
      ? 'snap-scroll-x flex-row overflow-x-auto w-full'
      : 'snap-scroll-y flex-col overflow-y-auto h-full'}"
  >
    {#each items as item, index}
      <div
        data-index={index}
        class:snap-center={snapToItem == 'center'}
        class:snap-start={snapToItem == 'start'}
        class:snap-end={snapToItem == 'end'}
        class="scroller-item {itemClass}"
      >
        <slot {item} {index} {firstPosItem} {centerPosItem} />
      </div>
    {/each}
  </div>
</div>

<style lang="postcss" global>
  .center-start.dir-x .scroller-items::after,
  .center-point.dir-x .scroller-items::after {
    content: '';
    width: calc(var(--ele-width) * 0.5px);
    min-width: calc(var(--ele-width) * 0.5px);
    @apply flex-shrink-0;
  }
  .center-start.dir-x .scroller-items::before,
  .center-point.dir-x .scroller-items::before {
    content: '';
    width: calc(var(--ele-width) * 0.5px);
    min-width: calc(var(--ele-width) * 0.5px);
    @apply flex-shrink-0;
  }
  .scroller-items {
    -webkit-overflow-scrolling: touch;
  }
  .center-start.dir-y .scroller-items::after,
  .center-point.dir-y .scroller-items::after {
    content: '';
    height: calc(var(--ele-height) * 0.5px);
    min-height: calc(var(--ele-height) * 0.5px);
    @apply flex-shrink-0;
  }
  .center-start.dir-y .scroller-items::before,
  .center-point.dir-y .scroller-items::before {
    content: '';
    height: calc(var(--ele-height) * 0.5px);
    min-height: calc(var(--ele-height) * 0.5px);
    @apply flex-shrink-0;
  }
</style>
