<script lang="ts">
  import dayjs from 'dayjs'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'

  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Button from '../../components/button/button.svelte'
  import List from '../../components/list/list.svelte'
import NextPrevCal from '../../components/next-prev-cal/next-prev-cal.svelte'

  import Spinner from '../../components/spinner/spinner.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  // import math from '../../utils/math/math'
  import { wait } from '../../utils/tick/tick'

  import { queryToUsageMap } from '../ledger/LedgerStore'
  import { getDateFormats } from '../preferences/Preferences'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { trackEvent } from '../usage/stat-ping'

  import TrendingItem from './trending-item.svelte'

  import {
    ATTFocalUnit,
    getAroundThisTimeDateRanges,
    UsageComparedType,
    usageMapToSortedArray,
  } from './TrendingModalStore'
  import { AroundThisTimeStore } from './TrendingModalStore'

  export let id: string

  let loading: boolean = true
  let activeDate: Date = new Date()
  let activeFocal: ATTFocalUnit = 'day'
  let onlyShow: 'all' | 'tracker' | 'people' | 'context' = 'all'

  let usageArray: Array<UsageComparedType> = []
  let trendingUp: Array<UsageComparedType> = []
  let trendingDown: Array<UsageComparedType> = []
  let newItems: Array<UsageComparedType> = []
  // let max: number = 100

  let dateFormats = getDateFormats()
  let title: string = 'Loading...'

  const init = async () => {
    trackEvent('trending-modal')
    loading = true
    const dateRange = getAroundThisTimeDateRanges($AroundThisTimeStore.date, $AroundThisTimeStore.focalPeriod)
    const usage = await queryToUsageMap(
      {
        start: dateRange.start,
        end: dateRange.end,
      },
      $TrackableStore.trackables
    )
    usageArray = usageMapToSortedArray(usage, dateRange)
    // max = math.max(usageArray.map((uct) => uct.trackableUsage.values.length))
    loading = false
  }
  $: activeDate = $AroundThisTimeStore.date
  $: activeFocal = $AroundThisTimeStore.focalPeriod

  // $: filter = (uct: UsageComparedType) => {
  //   if (onlyShow === 'all') return true
  //   return uct.trackableUsage.trackable.type === onlyShow
  // }

  $: if (!loading && onlyShow) {
    trendingDown = usageArray
      .filter((uct) => {
        if (onlyShow === 'all') return true
        return uct.trackableUsage.trackable.type === onlyShow
      })
      .filter((uct) => {
        return (
          uct.compared.value.direction === 'down' &&
          [uct.compared.value.from, uct.compared.value.to].join(',') !== '0,1'
        )
      })

    trendingUp = usageArray
      .filter((uct) => {
        if (onlyShow === 'all') return true
        return uct.trackableUsage.trackable.type === onlyShow
      })
      .filter((uct) => {
        return (
          uct.compared.value.direction === 'up' && [uct.compared.value.from, uct.compared.value.to].join(',') !== '0,1'
        )
      })

    newItems = trendingUp.filter((uct) => {
      return uct.compared.value.from === 0
    })
    trendingUp = trendingUp.filter((uct) => {
      return uct.compared.value.from
    })
  }

  $: if ($AroundThisTimeStore) {
    init()

    if (activeFocal === 'day') {
      title = dayjs(activeDate).format(dateFormats.mmm_d_yyyy)
    } else if (activeFocal === 'week') {
      title = `${dayjs(activeDate).startOf('week').format(dateFormats.tinyDate)} - ${dayjs(activeDate)
        .endOf('week')
        .format(`${dateFormats.tinyDate} YYYY`)}`
    } else if (activeFocal === 'month') {
      title = `${dayjs(activeDate).format('MMM YYYY')}`
    }
  }

  const close = () => {
    closeModal(id)
  }

  const changeDate = (dir: 'forward'|'backward') => {
    let wDate = dayjs(activeDate);
    if(activeFocal === 'day') {
      $AroundThisTimeStore.date = dir == 'forward' ? wDate.add(1,'day').toDate() : wDate.subtract(1,'day').toDate()
    } else if(activeFocal == 'week') {
      $AroundThisTimeStore.date = dir == 'forward' ? wDate.add(1,'week').toDate() : wDate.subtract(1,'week').toDate()
    }  else if(activeFocal == 'month') {
      $AroundThisTimeStore.date = dir == 'forward' ? wDate.add(1,'month').toDate() : wDate.subtract(1,'month').toDate()
    } 
  }

  const onNext = ()=>{
    changeDate('forward');
  }
  const onPrev = ()=>{
    changeDate('backward');
  }

  type FocalTypes = Array<{ id: ATTFocalUnit; label: string }>
  const types: FocalTypes = [
    {
      id: 'day',
      label: Lang.t('general.day', 'Day'),
    },
    // {
    //   id: 'hour',
    //   label: Lang.t('general.hour', 'Hour'),
    // },
    {
      id: 'week',
      label: Lang.t('general.week', 'Week'),
    },
    {
      id: 'month',
      label: Lang.t('general.month', 'Month'),
    },
  ]

  const changeFocal = () => {
    Interact.popmenu({
      id: `trending-${activeDate.toDateString()}`,
      buttons: types.map((t) => {
        return {
          title: t.label,
          async click() {
            await wait(200)
            $AroundThisTimeStore.focalPeriod = t.id
            init()
          },
        }
      }),
    })
  }
</script>

<BackdropModal>
  <header slot="header" class="bg-white dark:bg-black">
    <ToolbarGrid>
      <Button slot="left" clear primary on:click={close}>
        {Lang.t('general.close', 'Close')}
      </Button>
      <!-- <h2 class="ntitle">{title}</h2> -->
      <NextPrevCal hideCal on:next={onNext} on:previous={onPrev}>
        <h2 class="text-xs text-solid font-bold leading-tight text-center">{title}</h2>
      </NextPrevCal>
        
      <Button slot="right" clear primary on:click={changeFocal}>
        {types.find((d) => d.id === activeFocal)?.label}
      </Button>
    </ToolbarGrid>

    <div role="menubar" class="px-4 pb-1">
      <ButtonGroup
        bind:value={onlyShow}
        buttons={[
          { label: 'All', value: 'all' },
          { label: 'Trackers', value: 'tracker' },
          { label: 'People', value: 'person' },
          { label: 'Context', value: 'context' },
        ]}
      />
    </div>
  </header>
  <section class="trending px-1">

    {#if loading}
      <div class="w-full h-40 flex items-center justify-center">
        <Spinner size={42} />
      </div>
    {:else}
      {#if newItems.length}
        <List solo outside title="New">
          {#each newItems as uct, index (uct.trackableUsage.trackable)}
            <TrendingItem {uct} />
          {/each}
        </List>
      {/if}

      <List solo outside title="Trending Up">
        {#each trendingUp as uct, index (uct.trackableUsage.trackable)}
          <TrendingItem {uct} />
        {/each}
        {#if !trendingUp.length}
          <div class="text-gray-500 px-4 py-4">No Up Trends</div>
        {/if}
      </List>

      <List solo outside title="Trending Down ">
        {#if !trendingDown.length}
          <div class="text-gray-500 px-4 py-4">No Down Trends</div>
        {/if}
        {#each trendingDown as uct, index (uct.trackableUsage.trackable)}
          <TrendingItem {uct} />
        {/each}
      </List>
    {/if}
  </section>
  <div class="h-20" />
</BackdropModal>
