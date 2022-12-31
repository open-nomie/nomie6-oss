<script lang="ts">
  /**
   * Timeline Page
   * Mon Feb 21 2022 - Brandon
   * The timeine page will show an infinite scrolling list of your activities
   */

  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'

  import Layout from '../domains/layout/layout.svelte'

  import { getDateFormats } from '../domains/preferences/Preferences'
  import LetterTicker from '../components/letter-ticker/letter-ticker.svelte'
  import { TrackableStore } from '../domains/trackable/TrackableStore'
  import { onMount } from 'svelte/internal'

  import Button from '../components/button/button.svelte'
  import IonIcon from '../components/icon/ion-icon.svelte'
  import { CalendarOutline, ChevronForwardOutline, SearchIcon } from '../components/icon/nicons'

  import { selectFuzzyDate } from '../domains/timeline/select-date-fuzzy'
  import { openOnThisDayModal } from '../domains/on-this-day/useOnThisDayModal'

  import Toolbar from '../components/toolbar/toolbar.svelte'
  import type { TimelineFilterProps, TimelineItemType } from '../domains/timeline/timeline-utils'
  import { openUnisearch } from '../domains/search/UnisearchStore'

  import { TimelineOptionsStore } from '../domains/timeline/timeline-helpers'
  import ContextChart from '../domains/context/context-chart.svelte'

  import Container from '../components/container/container.svelte'

  import MenuInline from '../components/menu/menu-inline.svelte'

  import type { PopMenuButton } from '../components/pop-menu/usePopmenu'

  import CreateOutline from '../n-icons/CreateOutline.svelte'
  import AppsOutline from '../n-icons/AppsOutline.svelte'
  import BarChartOutline from '../n-icons/BarChartOutline.svelte'

  import CaretDownCircle from '../n-icons/CaretDownCircle.svelte'
  import PositivityGrid from '../components/positivity-bar/positivity-grid.svelte'

  import TimelineLoader from '../domains/timeline/timeline-loader.svelte'

  let startingDate: Date = new Date()
  let date: Dayjs = dayjs(startingDate)
  let displayDate = dayjs()
  let topItem: TimelineItemType
  let inPast: boolean = false

  const dateFormats = getDateFormats()

  let hashDate: any

  $: if (date && date !== hashDate && $TrackableStore.ready) {
    hashDate = date
  }

  /**
   * Jump to specific point in time
   */
  const jumpTo = async () => {
    const jumpDate = await selectFuzzyDate(dayjs(date), false)
    if (jumpDate) {
      date = dayjs(jumpDate)
      startingDate = jumpDate.toDate()
      displayDate = date
      if (startingDate.toDateString() !== new Date().toDateString()) {
        inPast = true
      } else {
        inPast = false
      }
    }
  }

  /**
   * View Base Filters
   * This allows you to show and hide different elements in the timeline
   */
  const baseFilters: TimelineFilterProps = {
    notes: true,
    maps: false,
    trackables: false,
    context: false,
  }

  // A function that takes a filter object and returns a new filter object with the search and startingDate properties set to undefined.
  export function clearFilterSearch(filter: TimelineFilterProps): TimelineFilterProps {
    const f = { ...filter }
    f.search = undefined
    return f
  }

  let filters: TimelineFilterProps = { ...baseFilters }

  /**
   * Show the Menu Filter
   * Popdown
   */
  const showFilterMenu = () => {
    let options = [
      {
        title: 'Notes',
        checked: filters.notes,
        icon: CreateOutline,
        click() {
          filters.notes = !filters.notes
          TimelineOptionsStore.setItem('filters', clearFilterSearch(filters))
        },
      },
      {
        title: 'Trackables',
        checked: filters.trackables,
        icon: AppsOutline,
        click() {
          filters.trackables = !filters.trackables
          TimelineOptionsStore.setItem('filters', clearFilterSearch(filters))
        },
      },
      {
        title: 'Context Chart',
        icon: BarChartOutline,
        checked: filters.context,
        click() {
          filters.context = !filters.context
          TimelineOptionsStore.setItem('filters', clearFilterSearch(filters))
        },
      },
    ]

    return options
  }

  let filterMenu: Array<PopMenuButton> = showFilterMenu()

  $: if ($TimelineOptionsStore.filters) {
    filters = $TimelineOptionsStore.filters
    filterMenu = showFilterMenu()
  }

  let mounted: boolean

  onMount(async () => {
    mounted = true
  })
</script>

<Layout pageTitle="Timeline" className="timeline-layout bg-gray-200 dark:bg-gray-800">
  <Toolbar slot="header" className="py-2 h-14">
    <MenuInline id="timeline-filter" menuButtons={filterMenu} buttonClass="menu-icon-button">
      <IonIcon className="text-primary-500" icon={CaretDownCircle} size={32} />
    </MenuInline>
    <div class="ntitle w-full mt-2 px-4  justify-center items-center  grid grid-cols-1">
      <button
        type="button"
        class="mx-auto mb-1 hover:text-gray-500 transform-gpu transition-all duration-200 items-center grid grid-cols-1"
        on:click={() => {
          openOnThisDayModal(displayDate.toDate())
        }}
      >
        {#key mounted}
          <h1 class="flex-nowrap flex items-center">
            <LetterTicker className="font-bold" text={displayDate.format(`ddd ${dateFormats.mmm_d_yyyy}`)} />
            <IonIcon icon={ChevronForwardOutline} className="text-gray-500" size={12} />
          </h1>
        {/key}
      </button>

      <div class="max-w-xl w-full mt-1 mx-auto items-center stiff">
        <PositivityGrid className="h-3" logs={topItem?.logs || []} />
      </div>
    </div>
    <div class="space-x-2 flex-nowrap flex">
      <Button className={`${inPast ? 'bg-red-500 ' : ''}`} icon on:click={() => jumpTo()}>
        <IonIcon className={inPast ? 'text-white' : 'text-primary'} icon={CalendarOutline} size={28} />
      </Button>
      <Button icon on:click={() => openUnisearch()} className="mr-6">
        <IonIcon className="text-primary-500" icon={SearchIcon} size={28} />
      </Button>
    </div>
  </Toolbar>

  {#if filters.context}
    <Container className="px-4 py-2">
      <ContextChart height={150} bind:date={displayDate} on:item-click={(evt) => {}} />
    </Container>
  {/if}

  <TimelineLoader
    on:xfilters={(evt) => {
      filters = { ...filters, ...evt.detail }
      TimelineOptionsStore.setItem('filters', filters)
    }}
    bind:startingDate
    on:topItem={(evt) => {
      topItem = evt.detail
      displayDate = topItem.time
    }}
    bind:filters
  />
  <div class="h-14" />
</Layout>

<style lang="postcss" global>
</style>
