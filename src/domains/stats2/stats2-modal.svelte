<script lang="ts">
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Button from '../../components/button/button.svelte'
  import DateRangeController from '../../components/date-range-controller/date-range-controller.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CloseOutline } from '../../components/icon/nicons'

  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import CalendarOutline from '../../n-icons/CalendarOutline.svelte'
  import { wait } from '../../utils/tick/tick'
  import { openCalendarView } from '../calendar-view/CalendarViewStore'

  import Map from '../map/map.svelte'
  import RelatedView from '../related/related-view.svelte'

  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { uomSymbol } from '../uom/uom-utils'

  import Overview from './overview/overview.svelte'

  import { Stats2TimeTypes } from './stats2-time-formats'
  import {
    changeStats2StoreTime,
    initStatsStore,
    nextStatsPeriod,
    previousStatsPeriod,
    Stats2DateRange,
    Stats2Store,
  } from './Stats2Store'

  import WhenView from './when-view.svelte'

  export let id: string

  let loading: boolean = false
  let showRelated: boolean = false
  // let activeIndex: number = 0

  /**
   * On TimeSpan Change
   * */
  let lastTimeSpan = ''
  let lastTrackable: Trackable
  $: if ($Stats2Store.time !== lastTimeSpan || lastTrackable !== $Stats2Store.trackable) {
    lastTrackable = $Stats2Store.trackable
    lastTimeSpan = $Stats2Store.time
    initStats()
  }

  const initStats = async () => {
    loading = true
    await initStatsStore($Stats2Store.trackable, {
      known: $TrackableStore.trackables,
      date: new Date(),
    })
    loading = false
  }

  /**
   * Close The Moda
   */
  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal headerClass="shadow-lg z-40">
  <header slot="header" class="bg-white dark:bg-gray-800">
    {#if $Stats2Store.trackable}
      <Toolbar className="space-x-2">
        <Button icon on:click={close}>
          <IonIcon icon={CloseOutline} size={28} className="text-primary-500" />
        </Button>

        <ButtonGroup
          className=""
          compact
          value={$Stats2Store.time}
          buttons={Object.keys(Stats2TimeTypes).map((id) => {
            return {
              label: id,
              value: id,
              click() {
                //@ts-ignore
                changeStats2StoreTime(id)
              },
            }
          })}
        />
        <Button
          icon
          on:click={async () => {
            await wait(100)
            openCalendarView({ trackable: $Stats2Store.trackable })
          }}
        >
          <IonIcon icon={CalendarOutline} size={28} className="text-primary-500" />
        </Button>
      </Toolbar>
    {:else}
      <div class="ntitle">Loading...</div>
    {/if}

    <DateRangeController
      start={$Stats2DateRange.start}
      end={$Stats2DateRange.end}
      on:next={() => nextStatsPeriod()}
      on:previous={() => previousStatsPeriod()}
     >
     <h1 class="text-black text-center flex items-center justify-center dark:text-white font-bold leading-none line-clamp-1 w-full">
      <TrackableAvatar trackable={$Stats2Store.trackable} size={20} className="mr-2" />
      <span>{$Stats2Store.trackable.label}</span>
    </h1>
    </DateRangeController>
     
  </header>

  <section class="pt-2 px-3 w-full grid grid-cols-1 pb-4  overflow-y-auto gap-4 relative bg-gray-200 dark:bg-gray-800">
    <!-- <div  class="flex items-center justify-center pt-1 px-4">
      {#if $Stats2Store.trackable}
        
      {/if}
      {#if $Stats2Store.trackable && $Stats2Store.usage}
        <div class="stiff pr-2">
          <span class="text-lg font-semibold text-black dark:text-white whitespace-nowrap"
            >{$Stats2Store.trackable.formatValue($Stats2Store.usage.min.value, false)} - {$Stats2Store.trackable.formatValue(
              $Stats2Store.usage.max.value,
              false
            )}</span
          >
          <span class="text-gray-500 whitespace-nowrap"
            >{$Stats2Store.trackable.tracker?.uom ? uomSymbol($Stats2Store.trackable.tracker.uom) : ''}</span
          >
        </div>
      {/if}
    </div> -->
    <Overview className="-mx-2" trackable={$Stats2Store.trackable} usage={$Stats2Store.usage} />
    <WhenView bind:logs={$Stats2Store.logs} trackable={$Stats2Store.trackable} usage={$Stats2Store.usage} />
    <div class="map-wrap rounded-md h-60 shadow-md {$Stats2Store.loading ? 'skeleton-item' : ''}">
      {#if !$Stats2Store.loading}
        <Map lock bind:records={$Stats2Store.logs} className="rounded-lg overflow-hidden shadow-lg" />
      {/if}
    </div>
  </section>
  <section class="px-3 w-full">
    <div class="related bg-white dark:bg-black rounded-xl shadow-lg border-gray-500 border-opacity-20">
      {#if showRelated}
        <RelatedView trackable={$Stats2Store.trackable} />
      {:else}
        <button
          on:click={() => (showRelated = true)}
          class="w-full text-primary-500 py-20"
          title="Find potentially related trackables"
        >
          <span class="text-primary-500">Find Related...</span>
        </button>
      {/if}
    </div>
  </section>
  <div class="h-10" />
</BackdropModal>
