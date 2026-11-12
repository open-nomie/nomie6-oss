<svelte:options runes={true} />

<script lang="ts">
  // svelte
  import { createEventDispatcher, onDestroy, onMount, untrack } from 'svelte'
  import { getElementPosition } from '../../modules/html-elements/position'
  import nid from '../../modules/nid/nid'
  import { Device } from '../../store/device-store'

  import { wait } from '../../utils/tick/tick'



  const dispatch = createEventDispatcher()

  // Locals
  let wrapper
  let scroller
  let ready = $state(false)
  let centered = $state(true)
  let localActiveIndex = $state(undefined)

  const { activeIndex = undefined, activeClass, className, centerIfPossible, wrapperClass, wrapperStyle, captureCenter, captureCenterWindow, style, id } = $props()

  // Commenting out all effects to isolate the infinite loop source
  // $effect(() => {
  //   if (activeIndex !== undefined && ready) {
  //     untrack(() => {
  //       methods.selectIndex(activeIndex)
  //       checkForCenter()
  //     })
  //   }
  // })

  // $effect(() => {
  //   if ($Device.width) {
  //     checkForCenter()
  //   }
  // })

  const checkForCenter = () => {
    untrack(() => {
      if (centerIfPossible && wrapper) {
        let width = wrapper.offsetWidth
        let scrollWidth = wrapper.scrollWidth

        if (scrollWidth > width) {
          centered = false
        } else {
          centered = true
        }
      } else {
        centered = false
      }
    })
  }

  let timer = $state(undefined)

  const getTopChild = (element: any): HTMLElement | undefined => {
    if (element) {
      if (element?.dataset.index) {
        return element
      } else if (element) {
        return getTopChild(element.parentElement)
      }
    }
    return undefined
  }

  const tagChildren = () => {
    if (wrapper?.children) {
      for (let i = 0; i < wrapper.children.length; i++) {
        let child = wrapper.children[i]
        child.removeEventListener('click', childClickEvent)
        child.addEventListener('click', childClickEvent)
        child.dataset.childId = i
      }
    }
  }

  const clearFocused = () => {
    document.querySelectorAll(`#${id} [data-child-id]`).forEach((child) => {
      child.classList.remove(activeClass)
    })
  }

  const scrollDebounce = () => {
    if (captureCenter) {
      tagChildren()
      clearTimeout(timer)
      timer = setTimeout(() => {
        const points = getElementPosition(wrapper)
        if (points) {
          const centerPos = points.left + points.eleWidth * 0.5
          let height = points.eleHeight > window.innerHeight ? window.innerHeight : points.eleHeight
          let y = 0
          if (captureCenter) {
            y = points.top + height * 0.5
          } else if (captureCenterWindow) {
            y = Math.abs(points.eleHeight - document.body.scrollHeight) * 0.5
          }
          const x = centerPos
          const eles = document.elementsFromPoint(x, y)

          const validChildren = eles.filter((loopEle: any) => loopEle.dataset.childId)
          const selected: any = validChildren[0]

          if (selected) {
            clearFocused()
            selected.classList.add(activeClass)

            dispatch('centerElement', { ele: selected })
          }
        }
      }, 220)
    }
  }

  // Commenting out Device.width effect - causes infinite loop
  // $effect(() => {
  //   if ($Device.width) {
  //     checkForCenter()
  //     scrollDebounce()
  //     tagChildren()
  //   }
  // })

  // const getChildAt = (left: number): Element | undefined => {
  //   const children = document.querySelectorAll(`#${id} [data-child-id]`)
  //   let found: any
  //   children.forEach((child: any, index) => {
  //     const childPos = getElementPosition(child)

  //     if (childPos.left == left) {
  //       found = child
  //     }
  //   })
  //   return found
  // }

  const childClickEvent = (event) => {
    let selectedIndex = Array.prototype.indexOf.call(wrapper.children, event.target)
    methods.selectIndex(selectedIndex)
    dispatch('selected', selectedIndex)
  }

  const onScroll = (evt) => {
    scrollDebounce()
    scroller.setAttribute('data-scroll', wrapper.scrollLeft)
  }

  // Methods
  const methods = {
    init() {
      // looop over children - apply a click event
      if (wrapper && wrapper.children) {
        tagChildren()
        wrapper.addEventListener('scroll', onScroll, { passive: true })
        ready = true
      }

      checkForCenter()
    },
    // Clear currently selected index
    clearSelected() {
      if (localActiveIndex > -1 && wrapper?.children[localActiveIndex]) {
        wrapper?.children[localActiveIndex].classList.remove(activeClass)
      }
    },
    // Select new item
    selectIndex(index) {
      clearFocused()
      localActiveIndex = index
      try {
        let child = wrapper.children[localActiveIndex]
        // let parentOffset = wrapper.offsetLeft
        if (child) {
          setTimeout(() => {
            child.scrollIntoView()
            checkForCenter()
          }, 60)
        }
      } catch (e) {}
      ready = true
    },
  }

  // callback is called on intersection change

  // when component mounts
  onMount(async () => {
    await wait(60)
    methods.init()
  })

  onDestroy(() => {
    scroller.removeEventListener('scroll', onScroll)
  })
</script>

<div {id} class="n-hscroller {className}" {style} data-scroll="0" bind:this={scroller}>
  <div class="wrapper {centered ? 'force-center' : 'no-force'} {wrapperClass}" style={wrapperStyle} bind:this={wrapper}>
    <slot />
  </div>
</div>

<style lang="postcss">
  .n-hscroller .swiper-wrapper {
    -ms-overflow-style: none;
    /* for Internet Explorer, Edge */
    scrollbar-width: none;
    /* for Firefox */
  }

  .n-hscroller .swiper-wrapper::-webkit-scrollbar {
    display: none;
    /* for Chrome, Safari, and Opera */
  }
  .n-hscroller {
    @apply whitespace-nowrap;
    /* overflow-x: scroll;
    overflow-y: hidden; */
    scroll-behavior: smooth;
    min-height: 40px;
    max-width: 100%;
    @apply flex;
    @apply items-center;
  }

  .n-hscroller .wrapper {
    @apply whitespace-normal;
    @apply overflow-y-auto;
    display: flex;
    flex-direction: row;
    flex-wrap: none;
    align-items: center;
    min-width: 100%;
    height: 100%;
  }
  .n-hscroller .wrapper.force-center {
    justify-content: center;
    align-items: center;
  }
</style>
