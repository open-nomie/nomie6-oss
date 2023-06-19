<script lang="ts">
  import { strToTokens } from './../../modules/tokenizer/lite'
  import { CombinedBoards } from './../board/UniboardStore'
  
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'

  import Button from '../../components/button/button.svelte'

  import Empty from '../../components/empty/empty.svelte'
  import { openPopMenu, PopMenuButton } from '../../components/pop-menu/usePopmenu'
  
  import type { DashboardClass } from '../dashboard2/dashboard-class'
  import DashboardListItem from '../dashboard2/dashboard-list-item.svelte'
  import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'
  import { selectTrackables } from '../trackable/trackable-selector/TrackableSelectorStore'
  import { Trackable } from '../trackable/Trackable.class'

  import Input from './../../components/input/input.svelte'
  import List from './../../components/list/list.svelte'
  import type { Template } from './templates-utils'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { UniboardType } from '../board/UniboardStore'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { strToToken, Token } from '../../modules/tokenizer/lite'

  import ListItem from '../../components/list-item/list-item.svelte'
  import { onMount } from 'svelte/internal'
  import array_utils from '../../utils/array/array_utils'
  import { DashStore, initializeDashStore } from '../dashboard2/DashStore'
  import type { ITrackables } from '../ledger/ledger-tools'
  import { GoalStore } from '../goals/GoalStore'
  import type { GoalClass } from '../goals/goal-class'
  import { PivotStore } from '../analytics/PivotStore'
  import type { PivotClass } from '../analytics/pivot-class'
  // import download from '../../modules/download/download'
  // import { strToTagSafe } from '../trackable/trackable-utils'

  export let template: Template

  const strToTrackable = (str: string): Trackable => {
    return tokenToTrackable(strToToken(str), $TrackableStore.trackables)
  }

  const addTrackableFromTag = (str) => {
    const trackable = strToTrackable(str)
    addTrackableToTemplate(trackable)
  }

  const templateTrackablesToMap = (): ITrackables => {
    const localTrackables: ITrackables = {}
    template.trackables.forEach((trackable) => {
      localTrackables[trackable.tag] = trackable
    })
    return localTrackables
  }

  // const exportTemplate = () => {
  //   const obj = template.asObject
  //   console.log({ obj })
  //   const filename = `${strToTagSafe(template.name)}-${template.id}.json`
  //   download.json(filename, JSON.stringify(obj, null, 2))
  // }

  const addTokenToTemplate = (token: Token) => {
    const allKnown = { ...$TrackableStore.trackables, ...templateTrackablesToMap() }
    const trackable = tokenToTrackable(token, allKnown)
    addTrackableToTemplate(trackable)
  }

  const addTrackableToTemplate = (trackable: Trackable) => {
    if (!template.trackables.find((t) => t.id == trackable.id)) {
      template.trackables.push(trackable)

      // Import Combo / Note Trackables too
      if (trackable.type == 'tracker' && trackable.tracker.type == 'note') {
        const tokens = strToTokens(trackable.tracker.note || '')
       
        tokens.forEach((token: Token) => {
          const includedTrackable = tokenToTrackable(token, $TrackableStore.trackables)
          addTrackableToTemplate(includedTrackable)
        })
      }
    }
    template.trackables = template.trackables
  }

  onMount(() => {
    initializeDashStore()
  })

  const getTrackerOptions = (trackable: Trackable) => {
    const buttons = [
      {
        id: 'edit',
        title: 'Edit Trackable',
        click() {
          openTrackableEditor(trackable, (trackable) => {
            template.trackables = template.trackables.map((t) => {
              if (t.id == trackable.id) {
                return trackable
              }
              return t
            })
          })
        },
      },
      {
        id: 'remove',
        title: 'Remove from Template',
        click() {
          template.trackables = template.trackables.filter((t) => t.id != trackable.id)
          template.trackables = template.trackables
        },
      },
    ]
    openPopMenu({
      id: 'trackable-options',
      buttons,
    })
  }

  const importFromExistingTabs = () => {
    const boardButtons = $CombinedBoards.map((board: UniboardType) => {
      return {
        id: board.id,
        title: board.label,
        click() {
          board.elements.map((tag) => {
            addTrackableFromTag(tag)
          })
          if (!template.boards.find((b) => b.id === board.id)) {
            board.elements = array_utils.unique(board.elements) as Array<string>
            template.boards.push(board)
          }
        },
      }
    })
    openPopMenu({
      title: 'Which Tab would you like to import?',
      id: 'existing-boards',
      buttons: boardButtons,
    })
  }

  const addBoardTab = () => {
    importFromExistingTabs()
    // const createTab: PopMenuButton = {
    //   id: 'create-tab',
    //   title: 'Create new Tab',
    //   click() {},
    // }
    // const existingTab: PopMenuButton = {
    //   id: 'existing-tab',
    //   title: 'Import from my Tabs',
    //   click() {
    //     importFromExistingTabs()
    //   },
    // }
    // openPopMenu({
    //   id: 'add-board-options',
    //   buttons: [createTab, existingTab],
    // })
  }

  const trackerAddButtons: Array<PopMenuButton> = [
    {
      id: 'existing',
      title: 'Pick from my Trackables',
      async click() {
        const selected = await selectTrackables()
       
        if (selected) {
          selected.forEach((trackable) => {
            addTrackableToTemplate(trackable)
          })
          template.trackables = template.trackables
        }
      },
    },
    {
      id: 'new',
      title: 'Create a Tracker',
      async click() {
        openTrackableEditor(new Trackable({ type: 'tracker' }), (trackable) => {
          
          template.trackables.push(trackable)
          template.trackables = template.trackables
        })
      },
    },
    {
      id: 'new',
      title: 'Create a Person',
      async click() {
        openTrackableEditor(new Trackable({ type: 'person' }), (trackable) => {
          
          template.trackables.push(trackable)
          template.trackables = template.trackables
        })
      },
    },
    {
      id: 'new',
      title: 'Create a Context',
      async click() {
        openTrackableEditor(new Trackable({ type: 'context' }), (trackable) => {
          
          template.trackables.push(trackable)
          template.trackables = template.trackables
        })
      },
    },
  ]

  const addRequiredTrackablesFromDashboard = (dashboard: DashboardClass) => {
    const tokens = dashboard.widgets.map((widget) => {
      return widget.token
    })
    tokens.forEach((token) => {
      addTokenToTemplate(token)
    })
  }

  const openDashboardImporter = (dashboards: Array<DashboardClass>) => {
    
    const boardButtons = dashboards.map((dashboard: DashboardClass) => {
      return {
        id: dashboard.id,
        title: dashboard.label,
        click() {
          const index = template.dashboards.findIndex((d) => d.id == dashboard.id)
          if (index > -1) {
            template.dashboards[index] = dashboard
          } else {
            template.dashboards.push(dashboard)
          }
          addRequiredTrackablesFromDashboard(dashboard)
          template.dashboards = template.dashboards
        },
      }
    })
    openPopMenu({
      title: 'Which dashboard would you like to import?',
      id: 'existing-dsahboards',
      buttons: boardButtons,
    })
  }

  const addDashboard = async () => {
    openDashboardImporter($DashStore.dashboards)
    // const addNewDashboard: PopMenuButton = {
    //   id: 'new-dashboard',
    //   title: 'Create new Dashboard',
    //   async click() {
    //     const label = await Interact.prompt('Dashboard Tab Title')
    //     if (label) {
    //       let dashboard = new DashboardClass({ widgets: [], label, id: nid() })
    //       template.dashboards.push(dashboard)
    //       template.dashboards = template.dashboards
    //     }
    //   },
    // }
    // const importDashboard: PopMenuButton = {
    //   id: 'import-dashboard',
    //   title: 'Import Existing Dashboard',
    //   click() {
    //     openDashboardImporter($DashStore.dashboards)
    //   },
    // }
    // openPopMenu({
    //   title: 'Add a Dashboard to this Template',
    //   id: 'add-trackable',
    //   buttons: [addNewDashboard, importDashboard],
    // })
  }

  const openGoalImporter = (goals: Array<GoalClass>) => {
    const buttons = goals.map((goal: GoalClass) => {
      return {
        title: `${goal.tag} ${goal.comparison} ${goal.target}`,
        id: goal.tag,
        click() {
          let index = template.goals.findIndex((g) => g.id === goal.id)
          if (index > -1) {
            template.goals[index] = goal
          } else {
            template.goals.push(goal)
          }
          template.goals = template.goals
          addTrackableFromTag(goal.tag)
        },
      }
    })
    
    openPopMenu({
      id: 'import-goal',
      title: 'Which goal would you like to import?',
      buttons: buttons,
    })
  }

  const addGoal = async () => {
    openGoalImporter($GoalStore)
    // const addNewGoal: PopMenuButton = {
    //   id: 'new-goal',
    //   title: 'Create new Goal',
    //   async click() {},
    // }
    // const importGoal: PopMenuButton = {
    //   id: 'import-goals',
    //   title: 'Import Existing Goals',
    //   click() {
    //     openGoalImporter($GoalStore)
    //   },
    // }
    // openPopMenu({
    //   title: 'Add a Goal to this Template',
    //   id: 'add-goal',
    //   buttons: [addNewGoal, importGoal],
    // })
  }

  const openPivotImporter = (pivots: Array<PivotClass>) => {
    const buttons = pivots.map((pivot: PivotClass) => {
      return {
        title: `${pivot.emoji}${pivot.tag}`,
        id: pivot.tag,
        click() {
          let index = template.pivots.findIndex((g) => g.id === pivot.id)
          if (index > -1) {
            template.pivots[index] = pivot
          } else {
            template.pivots.push(pivot)
          }
          template.pivots = template.pivots
        },
      }
    })
    
    openPopMenu({
      id: 'import-pivot',
      title: 'Which pivot would you like to import?',
      buttons: buttons,
    })
  }

  const addPivot = async () => {
    openPivotImporter($PivotStore)
    
  }

  const addTrackableOptions = () => {
    openPopMenu({
      id: 'add-trackable',
      buttons: trackerAddButtons,
    })
  }
</script>

{#if template}
  <p class="description text-gray-500 text-center pb-2 px-3 text-sm leading-tight">
    Create a sharable Nomie configuration
  </p>
  <List solo>
    <Input listItem type="text" placeholder="Template Name" bind:value={template.name} />
    <Input listItem type="textarea" placeholder="Description" bind:value={template.description} />
  </List>
  <List solo outside title="Trackables">
    <Button size="sm" on:click={() => addTrackableOptions()} primary clear slot="header-right">+ Add</Button>
    {#if !template.trackables.length}
      <Empty small>
        <span class="text-gray-500">No Trackables</span>
      </Empty>
    {:else}
      <div class="pill-holder px-1 flex flex-wrap py-2">
        {#each template.trackables as trackable}
          <button
            on:click={() => {
              getTrackerOptions(trackable)
            }}
            class="pill"
            on:click={() => {}}
          >
            <TrackableAvatar {trackable} size={20} />
            <span class="label">{trackable.label}</span>
          </button>
        {/each}
      </div>
    {/if}
  </List>
  <List solo outside title="Tabs">
    <Button size="sm" on:click={() => addBoardTab()} primary clear slot="header-right">+ Add</Button>
    {#if !template.boards.length}
      <Empty small>
        <span class="text-gray-500 text-sm">No Board Tabs</span>
      </Empty>
    {:else}
      {#each template.boards as board, index}
        <ListItem>
          <div>
            <h2 class="ntitle">{board.label}</h2>
            <div class="py-1 flex flex-wrap">
              {#each array_utils.unique(board.elements) as element, eindex}
                <button class="pill sm">{element}</button>
              {/each}
            </div>
          </div>
        </ListItem>
      {/each}
    {/if}
  </List>
  <List solo outside title="Dashboards">
    <Button size="sm" on:click={() => addDashboard()} primary clear slot="header-right">+ Add</Button>
    {#if !template.dashboards.length}
      <Empty small>
        <span class="text-gray-500">No Dashboards</span>
      </Empty>
    {:else}
      {#each template.dashboards as dashboard, index}
        <DashboardListItem {dashboard} />
      {/each}
    {/if}
  </List>
  <List solo outside title="Goals">
    <Button size="sm" on:click={() => addGoal()} primary clear slot="header-right">+ Add</Button>
    {#if !template.goals.length}
      <Empty small>
        <span class="text-gray-500">No Goals</span>
      </Empty>
    {:else}
      {#each template.goals as goal, index}
        <ListItem>
          <div class="ntitle">
            <span>{goal.tag}</span>
            <span>{goal.comparison}</span>
            <span>{goal.target}</span>
          </div>
        </ListItem>
      {/each}
    {/if}
  </List>
  <List solo outside title="Pivots">
    <Button size="sm" on:click={() => addPivot()} primary clear slot="header-right">+ Add</Button>
    {#if !template.pivots.length}
      <Empty small>
        <span class="text-gray-500">No Pivots</span>
      </Empty>
    {:else}
      {#each template.pivots as pivot, index}
        <ListItem>
          <div class="ntitle">
            <span>{pivot.emoji}{pivot.tag}</span>
          </div>
        </ListItem>
      {/each}
    {/if}
  </List>
{:else}
  No template found
{/if}
<div class="h-12" />

<style global lang="postcss">
  .pill {
    @apply flex items-center;
    @apply space-x-2;
    @apply rounded-md;
    @apply m-1 text-xs px-2 py-1;
    @apply bg-white dark:bg-black;
    @apply text-gray-900 dark:text-white;
    @apply shadow-md;
  }

  .pill.sm {
    @apply px-1 py-px;
    @apply space-x-1;
    font-size: 0.7rem;
  }
  .pill .label {
    @apply font-medium;
  }
</style>
