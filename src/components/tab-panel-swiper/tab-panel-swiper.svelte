<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte/internal'
  import nid from '../../modules/nid/nid'
  import { wait } from '../../utils/tick/tick'

  import HScroller from '../h-scroller/h-scroller.svelte'
  import Panel from '../panel/panel.svelte'
  import Swiper from '../swiper/swiper.svelte'

  import TabButton from './tab-button.svelte'

  const dispatch = createEventDispatcher()

  type TabChildType = {
    child: any
    index: number
    title?: string
    active?: boolean
  }

  const id = `sw-${nid()}`

  let tabChildren: Array<TabChildType> = []
  let activeIndex: number = 0

  const initialize = async () => {
    tabChildren = []
    const wrapper = document.querySelector(`#${id} .panels .wrapper`)
    if (wrapper) {
      const children = wrapper.children
      for (let i = 0; i < children.length; i++) {
        let child = children[i] as HTMLElement
        tabChildren.push({
          index: i,
          child: child,
          title: child.dataset.title,
        })
      }
    }
    // TODO: make this sticky
    tabChildren[activeIndex].active = true
    activeIndex = 0
  }

  const setActiveIndex = (index: number, from: 'swipe' | 'tab' = 'tab') => {
    activeIndex = index
    scrollToIndex(activeIndex, from)
    dispatch('index', activeIndex)
  }

  const scrollToIndex = async (index: number, from: 'swipe' | 'tab' = 'tab') => {
    const panelTarget = document.querySelectorAll(`#${id} .panels .tab-panel`)[index]
    const buttonTarget = document.querySelectorAll(`#${id} .tab-control button`)[index]
    if (from === 'swipe' && buttonTarget) buttonTarget.scrollIntoView({ behavior: 'smooth' })
    if (from === 'tab' && panelTarget) panelTarget.scrollIntoView({ behavior: 'smooth' })
  }

  onMount(async () => {
    await wait(100)
    initialize()
  })
</script>

<Panel className="h-full  tab-panel-swiper" {id}>
  <header slot="header">
    <slot name="above-header" />
    <div class="py-2">
      <div class="stiff"><slot name="header-left" /></div>
      <HScroller className="px-2 flex-grow flex-shrink w-full min-w-0">
        {#each tabChildren as tab, index}
          <TabButton
            {index}
            isActive={activeIndex == index}
            on:click={() => {
              setActiveIndex(index, 'tab')
            }}>{tab.title}</TabButton
          >
        {/each}
      </HScroller>
      <div class="stiff"><slot name="header-right" /></div>
    </div>
    <slot name="below-header" />
  </header>
  <Swiper
    className=" h-full filler panels"
    id={`sw-${id}`}
    on:index={(evt) => {
      setActiveIndex(evt.detail, 'swipe')
    }}
  >
    <slot />
  </Swiper>
</Panel>

<style lang="postcss" global>
  .tab-panel-swiper .n-hscroller {
    @apply h-full;
  }
</style>
