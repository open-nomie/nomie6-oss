<script lang="ts">
  import { LedgerStore } from '../ledger/LedgerStore'
  import dayjs from 'dayjs'
  import Button from '../../components/button/button.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'

  import { getContext, getNotes, getPeople, OTDViews, processTrackers } from './on-this-day-helpers'

  import type { OTDViewOption } from './on-this-day-helpers'
  import OnThisDayViews from './on-this-day-views.svelte'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CalendarOutline } from '../../components/icon/nicons'
  import NextPrevCal from '../../components/next-prev-cal/next-prev-cal.svelte'

  import { onMount } from 'svelte'
  import { changeOnThisDay, OnThisDayModalStore } from './useOnThisDayModal'
  import { Lang } from '../../store/lang'
  import { selectFuzzyDate } from '../timeline/select-date-fuzzy'
  import Empty from '../../components/empty/empty.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import { PeopleStore } from '../people/PeopleStore'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'

  export let id: string

  const state = {
    notes: [],
    trackers: [],
    trackers1: [],
    trackers2: [],
    records: [],
    people: [],
    context: [],
    locations: [],
  }

  let loading = true

  let views: typeof OTDViews = OTDViews

  let view: OTDViewOption = 'all'

  function setView(v: OTDViewOption) {
    view = v
  }

  async function loadDay() {
    loading = true
    let day = await LedgerStore.getDay($OnThisDayModalStore)
    let trackersUsed = LedgerStore.extractTrackerTagAndValues(day)
    state.people = getPeople(day, $PeopleStore)
    state.context = getContext(day)
    state.notes = getNotes(day)
    state.trackers = processTrackers(trackersUsed)

    state.records = day
    loading = false
  }

  function nextDay() {
    let date = dayjs($OnThisDayModalStore).add(1, 'day').toDate()
    changeOnThisDay(date)
    loadDay()
  }

  function previousDay() {
    let date = dayjs($OnThisDayModalStore).subtract(1, 'day').toDate()
    changeOnThisDay(date)
    loadDay()
  }

  const close = () => {
    closeModal(id)
  }

  const gotoDate = (date:Date)=>{
    if (date) {
      changeOnThisDay(date)
      loadDay()
    }
  }

  const jumpTo = async () => {
    let date = await selectFuzzyDate(dayjs($OnThisDayModalStore), false)
    gotoDate(date.toDate());
  }

  const mounted = async () => {
    loadDay()
  }

  onMount(() => {
    mounted()
  })
</script>

<BackdropModal>
  <header slot="header" class="bg-white dark:bg-black">
    <ToolbarGrid>
      <Button slot="left" primary clear on:click={close}>
        {Lang.t('general.close', 'Close')}
      </Button>

      <div class="title">
        <h2 class="text-center text-black dark:text-white font-bold leading-none text-sm line-clamp-1">
          {dayjs($OnThisDayModalStore).format('ddd MMM D, YYYY')}
        </h2>
        <div class="text-xs text-gray-500 font-medium leading-none mt-1">
          {dayjs($OnThisDayModalStore).fromNow()}
        </div>
      </div>

      <div class="-mr-2" slot="right">
        <NextPrevCal
          on:previous={() => {
            previousDay()
          }}
          on:next={() => {
            nextDay()
          }}
          hideCal={true}
        >
          <Button icon clear primary on:click={() => jumpTo()}>
            <IonIcon icon={CalendarOutline} />
          </Button>
        </NextPrevCal>
      </div>
    </ToolbarGrid>

    <Toolbar className="px-4">
      <ButtonGroup compact>
        {#each views as loopView}
          <!-- {#if loopView.view !== 'all'} -->
          <Button
            className={view === loopView.view ? 'active' : ''}
            icon
            on:click={() => {
              setView(loopView.view)
            }}
          >
            <IonIcon icon={loopView.icon} size={20} />
          </Button>
          <!-- {/if} -->
        {/each}
      </ButtonGroup>
    </Toolbar>
  </header>

  <main class="h-full relative min-h-full h-50vh pt-3">
    {#if !loading}
      <OnThisDayViews {view} on:date={(evt)=>{
        gotoDate(evt.detail);
      }} logs={state.records} />
    {:else if loading}
      <Empty>
        <Spinner />
      </Empty>
    {:else}
      <Empty className="text-gray-500">No data on this day</Empty>
    {/if}
  </main>
</BackdropModal>
