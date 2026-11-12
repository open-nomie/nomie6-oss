<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'

  import nid from '../../modules/nid/nid'
  import HScroller from '../h-scroller/h-scroller.svelte'

  const dispatch = createEventDispatcher()

  export const scrollTo: Function = (index: number) => {
    if (index > -1) {
      const ele: any = document.querySelector(`#${id} [data-child-id='${index}']`)
      if (ele) {
        ele.scrollIntoView()
      }
    }
  }

  onMount(() => {
    setTimeout(() => {
      const first = document.querySelector('.n-swiper [data-index]')
      if (first) {
        first.classList.add('active-slide')
      }
    }, 100)
  })

  const { id, className } = $props()
</script>

<div class="n-swiper {className}" {id}>
  <HScroller
    wrapperClass="swiper-wrapper"
    captureCenter
    on:centerElement={(evt) => {
      const index = evt.detail.ele.dataset.childId
      if (!isNaN(index)) {
        dispatch('index', index)
      }
    }}
  >
    <slot />
  </HScroller>
</div>

<style lang="postcss" global>
  .n-swiper {
    @apply w-full;
    @apply max-w-full;
    @apply min-w-full;
  }

  /* .n-swiper * {
    background-color: rgba(255, 0, 0, 0.5) !important;
  } */

  .n-swiper .n-hscroller .wrapper {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    @apply h-auto;
    /* @apply bg-green-500; */
    align-items: stretch !important;
  }
  .n-swiper .n-hscroller .wrapper > div,
  .n-swiper .n-hscroller .wrapper > section {
    @apply w-full;
    @apply min-w-full;
    scroll-snap-align: start;
    @apply flex-grow flex-shrink;
  }
  .n-swiper-all-frames {
  }
</style>
