<script lang="ts">
  import { onMount } from 'svelte'

  // modules

  // components

  // Slides
  import WelcomeSlide from './slide-welcome.svelte'
  import PWASlide from './slide-pwa-install.svelte'
  import TimeFormatSlide from './slide-time-format.svelte'

  import StorageSlide from './slide-storage.svelte'

  // Local components

  // Stores

  import { Device } from '../../store/device-store'

  import { Prefs } from '../../domains/preferences/Preferences'

  import SlideTemplate from './slide-template.svelte'

  import Slide from './slide.svelte'

  import { wait } from '../../utils/tick/tick'

  const state = {
    ready: false,
    showMore: false,
    activeSlide: 0,
    showNext: true,
    transitioning: false,
    isTiny: false,
    redirecting: false,
    timeFormat: $Prefs.use24hour,
    theme: $Prefs.theme,
  }

  let slides = [WelcomeSlide]
  if (Device.iOS() && !$Device.pwa) {
    slides.push(PWASlide)
  }
  // slides.push(ThemeSlide)
  slides.push(TimeFormatSlide)
  slides.push(StorageSlide)
  slides.push(SlideTemplate)
  // slides.push(FirstDayOfWeekSlide)
  // slides.push(LocationSlide)
  // slides.push(NomieCloudSlide)

  onMount(() => {
    setTimeout(() => {
      if (window.document.body.offsetHeight < 640) {
        state.isTiny = true
      }
    }, 12)
  })

  let nextEnabled = true
  let nextTitle: string = 'Next'
  let activeSlide: any
  $: {
    activeSlide = slides[state.activeSlide]
    nextTitle = 'Next'

    if (activeSlide == StorageSlide && !$Prefs.storageType) {
      nextEnabled = false
    } else if (activeSlide == PWASlide) {
      nextTitle = 'Skip'
    } else if (activeSlide == StorageSlide && !$Prefs.storageType) {
      nextEnabled = false
    } else if (activeSlide == SlideTemplate) {
      nextTitle = 'Begin'
    } else {
      nextEnabled = true
    }
  }
</script>

{#if activeSlide}
  <Slide
    activeIndex={state.activeSlide}
    totalSlides={slides.length}
    hideBack={state.activeSlide == 0}
    nextDisabled={!nextEnabled}
    {nextTitle}
    on:next={() => {
      if (state.activeSlide < slides.length - 1) {
        state.activeSlide = state.activeSlide + 1
      } else if (state.activeSlide === slides.length - 1) {
        $Prefs.onboarded = true
        wait(100).then(() => {
          window.location.href = '/'
        })
      }
    }}
    on:back={() => {
      if (state.activeSlide > 0) state.activeSlide = state.activeSlide - 1
    }}
    bind:component={activeSlide}
  />
{/if}

<style lang="postcss" global>
  .setup-main {
    @apply bg-gray-100 dark:bg-gray-900;
  }
</style>
