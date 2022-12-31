<script lang="ts">
  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { AddIcon, CheckmarkCircle, ChevronForwardOutline, RibbonOutline } from '../../components/icon/nicons'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Lang } from '../../store/lang'
  import List from '../../components/list/list.svelte'
  import Layout from '../layout/layout.svelte'

  import { GoalClass, GoalDurationType } from './goal-class'

  import {
    getGoalUsage,
    GoalScoreStore,
    GoalStore,
    GoalUsageResponseType,
    openGoalDetail,
    openGoalEditor,
  } from './GoalStore'

  import Empty from '../../components/empty/empty.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'

  import ProgressBar from '../../components/progress-bar/progress-bar.svelte'

  import { TrackableStore } from '../trackable/TrackableStore'
  import { Interact } from '../../store/interact'

  import { showTrackablePopmenu } from '../board/boardActions'

  import debounce from 'lodash/debounce'

  import RemoveCircle from '../../n-icons/RemoveCircle.svelte'
  import CreateOutline from '../../n-icons/CreateOutline.svelte'

  import { onDestroy, onMount } from 'svelte'
  // import Toolbar from '../../components/toolbar/toolbar.svelte'
  // import DateRangeController from '../../components/date-range-controller/date-range-controller.svelte'
  import dayjs from 'dayjs'
  import { LedgerStore } from '../ledger/LedgerStore'
  import UpgradeMessage from '../../components/upgrade-message/upgrade-message.svelte'

  let view: GoalDurationType = 'day'
  let goals: Array<GoalClass> = []
  let goalUsages: Array<GoalUsageResponseType> = []
  let loading: boolean = true
  let mounted = false
  let activeDate = dayjs()
  let allowOpen: boolean = true

  const blockOpen = () => {
    allowOpen = false
    setTimeout(() => {
      allowOpen = true
    }, 500)
  }

  const initialzeGoalPage = debounce(() => {
    try {
      if ($GoalStore.length) {
        loading = true
        goals = [...$GoalStore]
        getGoalUsage(goals, $TrackableStore.trackables, activeDate).then((gu) => {
          goalUsages = gu
        })
      }
      loading = false
    } catch (e) {
      Interact.error(e.message)
      loading = false
    }
    goalUsages = [...goalUsages]
  }, 1000)

  let lastGoalStore = ''
  $: if ($GoalScoreStore.join(',') !== lastGoalStore && mounted) {
    lastGoalStore = $GoalScoreStore.join(',')
    initialzeGoalPage()
  }

  $: if ($GoalStore) {
    initialzeGoalPage()
  }

  const createGoal = () => {
    const goal = new GoalClass({ duration: view })
    openGoalEditor(goal)
  }
  const usageClicked = (usage) => {
    if (!editMode && allowOpen) {
      openGoalDetail(usage.goal)
    }
  }

  const deleteGoal = async (goal: GoalClass) => {
    const confirmed = await Interact.confirm(`Delete the ${goal.tag} goal?`, 'You can always recreate it')
    if (confirmed) {
      await GoalStore.remove(goal)
      initialzeGoalPage()
    }
  }

  let editMode: boolean = false

  let newPostListener

  onMount(() => {
    mounted = true
    newPostListener = LedgerStore.hook('onLogSaved', (res) => {
      initialzeGoalPage()
    })
  })

  onDestroy(() => {
    if (newPostListener) newPostListener()
  })
</script>

<Layout pageTitle={Lang.t('goals.goals', 'Goals')}>
  <header slot="header" class="glass z-50">
    <ToolbarGrid>
      <div slot="left">
        <Button primary clear icon on:click={createGoal}>
          <IonIcon icon={AddIcon} size={32} />
        </Button>
      </div>
      <h1 class="ntitle outline-none focus:ring-none">{Lang.t('goals.my-goals', 'My Goals')}</h1>
      <div slot="right">
        {#if editMode}
          <Button
            clear
            primary
            on:click={() => {
              editMode = false
            }}>Done</Button
          >
        {:else if goals.length}
          <Button
            clear
            primary
            on:click={() => {
              editMode = true
            }}>Edit</Button
          >
        {/if}
      </div>
    </ToolbarGrid>
    <!-- <div class=" items-center justify-center">
      <DateRangeController
        on:next={() => {
          activeDate = activeDate.add(1, 'day')
          initialzeGoalPage()
        }}
        on:previous={() => {
          activeDate = activeDate.subtract(1, 'day')
          initialzeGoalPage()
        }}
        date={activeDate}
        dateClass="text-xl font-bold text-center dark:text-white"
      />
    </div> -->
    <!-- <Toolbar>
      <ButtonGroup
        bind:value={view}
        className="max-w-sm mx-auto"
        buttons={[
          { label: Lang.t('general.daily', 'Daily'), value: 'day' },
          // { label: Lang.t('general.weekly', 'Weekly'), value: 'week' },
          { label: Lang.t('general.monthly', 'Monthly'), value: 'month' },
        ]}
      />
    </Toolbar> -->
  </header>
  <main class="py-4 relative z-10 px-2 lg:px-4">
    {#if goals.length}
      <List solo className="max-w-screen-lg mx-auto">
        {#each goalUsages as item, index (item.id)}
          <ListItem
            clickable
            bottomLine={72}
            className="relative transition-all duration-200"
            on:click={(evt) => {
              usageClicked(item)
            }}
          >
            <div slot="left" class="flex items-center space-x-2 stiff">
              <button
                on:click|preventDefault|stopPropagation|capture={(evt) => {
                  blockOpen()
                  showTrackablePopmenu($TrackableStore.trackables[item.goal.tag])
                }}
              >
                <TrackableAvatar
                  className=" my-2"
                  trackable={$TrackableStore.trackables[item.goal.tag]}
                  size={48}
                /></button
              >
            </div>

            <div class="title-progress filler">
              <div class="flex items-center justify-between mb-2">
                <h1 class="font-semibold flex items-center space-x-2">
                  <div class="line-clamp-1">{$TrackableStore.trackables[item.goal.tag]?.label}</div>
                  {#if (item.scores && item.scores[0]?.success) || (item.goal.isDontDoIt && !item.scores.length)}
                    <IonIcon icon={CheckmarkCircle} className="text-green-500" />
                  {/if}
                </h1>
                {#if !editMode}
                  <div class="filler whitespace-nowrap text-right">
                    <span>
                      <span class="usage-value font-semibold ">
                        {#if !item.trackableUsage}
                          0
                        {:else}
                          {item.trackableUsage.totalOnly}
                        {/if}
                      </span>
                      <span class="opacity-40">/</span>
                      <span class="target-value opacity-70">
                        {$TrackableStore.trackables[item.goal.tag]?.formatValue(item.goal.target)}
                      </span>
                    </span>
                    <IonIcon icon={ChevronForwardOutline} size={14} className="opacity-50" />
                  </div>
                {/if}
              </div>
              <div class="progress pb-2">
                {#if !item.scores.length}
                  <ProgressBar percentage={0} />
                {/if}
                {#each item.scores || [] as score}
                  {#if score.failure}
                    <ProgressBar barClass="bg-red-500" r2l={item.goal.isDontDoIt} percentage={score.percent || 0} />
                  {:else if item.goal.isDontDoIt && score.percent > 80}
                    <ProgressBar r2l={item.goal.isDontDoIt} barClass="bg-yellow-500" percentage={score.percent || 0} />
                  {:else if score.success}
                    <ProgressBar percentage={score.percent || 0} r2l={item.goal.isDontDoIt} barClass="bg-green-500" />
                  {:else}
                    <ProgressBar r2l={item.goal.isDontDoIt} percentage={score.percent || 0} />
                  {/if}
                {/each}
              </div>
            </div>
            <div slot="right" class=" flex items-center">
              {#if editMode}
                <div class="w-4 stiff" />
                <div class="flex items-center space-x-1">
                  <Button
                    clear
                    icon
                    on:click={(evt) => {
                      evt.detail.preventDefault()
                      evt.detail.stopPropagation()
                      openGoalEditor(item.goal)
                    }}
                  >
                    <IonIcon icon={CreateOutline} size={28} className="text-black dark:text-white" />
                  </Button>
                  <Button
                    clear
                    icon
                    on:click={(evt) => {
                      evt.detail.preventDefault()
                      evt.detail.stopPropagation()
                      deleteGoal(item.goal)
                    }}
                  >
                    <IonIcon icon={RemoveCircle} size={28} className="text-red-500" />
                  </Button>
                </div>
              {/if}
            </div>
          </ListItem>
        {/each}
        <ListItem on:click={createGoal}>
          <div class="text-center text-primary">Add Goal</div>
        </ListItem>
      </List>
    {/if}

    <List transparent className="max-w-md mx-auto">
      {#if goals.length === 0 && !loading}
        <Empty icon={RibbonOutline} title="No goals found">
          {#if view === 'day'}
            <Button on:click={createGoal} className="mt-2" clear primary>Create a Daily Goal →</Button>
          {:else if view === 'week'}
            <Button on:click={createGoal} className="mt-2" clear primary>Create a Weekly Goal →</Button>
          {:else if view === 'month'}
            <Button on:click={createGoal} className="mt-2" clear primary>Create a Monthly Goal →</Button>
          {/if}
        </Empty>
      {:else if loading}
        <Empty>
          <Spinner size={32} />
        </Empty>
      {/if}
    </List>
  </main>
</Layout>
