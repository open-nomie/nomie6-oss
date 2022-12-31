<script lang="ts">
  import dayjs, { Dayjs } from 'dayjs'

  import Button from '../../components/button/button.svelte'
  import Divider from '../../components/divider/divider.svelte'

  import Empty from '../../components/empty/empty.svelte'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'

  import {  showLogTrackablePopmenu, showTrackablePopmenu } from '../board/boardActions'

  import { getDateFormats } from '../preferences/Preferences'
  import { trackOnThisDay } from '../steak/StreakStore'
  import TrackablePill from '../trackable/trackable-pill.svelte'

  import { TrackableStore } from '../trackable/TrackableStore'
  

  import type { TrackableUsage } from '../usage/trackable-usage.class'

  import type { CalendarViewProps } from './CalendarViewStore'
  import TrackableUsageCalendar from './trackableUsageCalendar.svelte'
  import { TrackableLastUsedType, UsageStore } from '../usage/UsageStore'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'

  import Panel from '../../components/panel/panel.svelte'
  import ListItemLog from '../../components/list-item-log/list-item-log.svelte'
import ListItemSingleTrackable from '../../components/list-item-log/list-item-single-trackable.svelte';

  export let id: string
  export let props: CalendarViewProps

  let starterDate: Date // capture the initial date to start  but let user change
  let activeDate: Dayjs
  let trackableUsage: TrackableUsage
  let dateFormats = getDateFormats()

  let loading = true
  let lastUsageData: TrackableLastUsedType

  const dateTapped = async (date: Date) => {
    let datejs = dayjs(date)
    const index = trackableUsage.dates.findIndex((d: Dayjs) => d.format('YYYY-MM-DD') === datejs?.format('YYYY-MM-DD'))
    if (index > -1) {
      const log = trackableUsage.logs[index]
      if (log) {
        const element = document.querySelector(`#calendar-view-list #log-${log._id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    } else {
      const confirmed = await Interact.confirm('Track on this Day?')
      if (confirmed) {
        loading = true
        await trackOnThisDay(trackableUsage.trackable, date, $TrackableStore.trackables)
        loading = false
      }
    }
  }

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal className="calendar-view-modal">
  <Panel absolute className="overflow-hidden " mainClass="flex flex-col">
    <ToolbarGrid slot="header">
      <Button slot="left" clear primary on:click={close}>{Lang.t('general.close', 'Close')}</Button>
      <div class=" flex items-center space-x-2">
        <h1 class="ntitle">
          {starterDate
            ? `${activeDate ? dayjs(activeDate).format(dateFormats.mmm_d_yyyy) : dayjs(starterDate).format('MMM YYYY')}`
            : 'Loading...'}
        </h1>
      </div>
      <TrackablePill
        on:click={() => showTrackablePopmenu(props.trackable)}
        transparent
        slot="right"
        className="rounded-full flex-row-reverse"
        trackable={props.trackable}
        hideValue
        size={32}
      />
    </ToolbarGrid>

    <Panel className="bg-gray-100 rounded-none dark:bg-gray-900 stiff shadow-2xl z-30 overflow-hidden">
      <TrackableUsageCalendar
        on:input={(evt) => {
          activeDate = dayjs(evt.detail)
          dateTapped(evt.detail)
        }}
        trackable={props.trackable}
        bind:date={starterDate}
        on:usage={(evt) => {
          loading = false

          activeDate = undefined
          trackableUsage = evt.detail
          lastUsageData = $UsageStore[trackableUsage.trackable.tag]
        }}
      />
    </Panel>

    <section id="calendar-view-list" class="flex flex-col h-auto overflow-y-auto  bg-white dark:bg-black">
      <!-- <div class="bg-transparent grid grid-cols-2 px-4 mt-2 rounded-md h-auto mb-2">
        {#if lastUsageData?.streak}
          <ListItem className="">
            <div class="font-bold text-center">
              {lastUsageData.streak.v}
              {lastUsageData.streak.v <= 1 ? Lang.t('general.days', 'day') : Lang.t('general.days', 'days')}
              <span class="text-xs text-center text-gray-500">Current</span>
            </div>
            <div class="text-xs opacity-60 py-1 text-center line-clamp-1 whitespace-nowrap">
              {dayjs(lastUsageData.last.d).subtract(lastUsageData.streak.v, 'day').format(dateFormats.shortDate)}
              -
              {dayjs(lastUsageData.longest.d).format(dateFormats.shortDate)}
            </div>
          </ListItem>
        {/if}
        {#if lastUsageData?.longest}
          <ListItem
            on:click={() => {
              // activeDate =
              props.date = dayjs(lastUsageData.longest.d).subtract(lastUsageData.longest.v, 'day').toDate()
            }}
            className="text-center"
          >
            <div class="font-bold text-center leading-none">
              {lastUsageData.longest.v}
              {lastUsageData.longest.v <= 1 ? Lang.t('general.days', 'day') : Lang.t('general.days', 'days')}
              <span class="text-xs text-center text-gray-500">Longest</span>
            </div>

            <div class="text-xs opacity-60 py-1 text-center line-clamp-1 whitespace-nowrap">
              {dayjs(lastUsageData.longest.d).subtract(lastUsageData.longest.v, 'day').format(dateFormats.shortDate)}
              -
              {dayjs(lastUsageData.longest.d).format(dateFormats.shortDate)}
            </div>
          </ListItem>
        {/if}
      </div> -->

      <Divider left={1} className="opacity-50" />

      {#if trackableUsage}
        <div class="px-2 pt-2 lg:px-4 bg-gray-300 dark:bg-gray-800">
          {#if !trackableUsage.logs.length}
            <div class="text-center p-10 text-gray-500">
              No {trackableUsage.trackable.label} data for {dayjs(activeDate || starterDate).format(
                dateFormats.mmm_d_yyyy
              )}
            </div>
          {/if}
          <!-- {#each trackableUsage.logs as log, index (index)}
            <ListItemLog className="mb-2" {log} />
          {/each} -->
          {#each trackableUsage.logs as log, index (index)}
            <ListItemSingleTrackable
              {index}
              on:click={(evt) => {
                showLogTrackablePopmenu(log, props.trackable)
              }}
              max={trackableUsage.max.value}
              trackable={props.trackable}
              {log}
            />
          {/each}
        </div>
      {:else}
        <Empty className="text-gray-500">
          {#if loading}
            Getting Data...
          {:else}
            No Data
          {/if}
        </Empty>
      {/if}
    </section>
  </Panel>
</BackdropModal>

<style lang="postcss" global>
  .bd-modal.calendar-view-modal > main {
    @apply overflow-hidden;
    @apply flex flex-col;
  }
</style>
