<svelte:options runes={true} />

<script lang="ts">
  import { strToTokens } from './../../modules/tokenizer/lite'
  import { get } from 'svelte/store'
  import { CombinedBoards } from './../board/UniboardStore'
  
  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'

  import Button from '../../components/button/button.svelte'

  import Empty from '../../components/empty/empty.svelte'
  import { openPopMenu, type PopMenuButton } from '../../components/pop-menu/usePopmenu'
  
  import type { DashboardClass } from '../dashboard2/dashboard-class'
  import { WidgetClass } from '../dashboard2/widget/widget-class'
  import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'
  import { selectTrackables } from '../trackable/trackable-selector/TrackableSelectorStore'
  import { Trackable } from '../trackable/Trackable.class'

  import Input from './../../components/input/input.svelte'
  import List from './../../components/list/list.svelte'
  import type { Template } from './templates-utils'
  import { TrackableStore } from '../trackable/TrackableStore'
  import type { UniboardType } from '../board/UniboardStore'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { strToToken, type Token } from '../../modules/tokenizer/lite'

  import ListItem from '../../components/list-item/list-item.svelte'
  import { onMount } from 'svelte'
  import array_utils from '../../utils/array/array_utils'
  import { DashStore, initializeDashStore } from '../dashboard2/DashStore'
  import type { ITrackables } from '../ledger/ledger-tools'
  import { GoalStore } from '../goals/GoalStore'
  import type { GoalClass } from '../goals/goal-class'
  import { PivotStore } from '../analytics/PivotStore'
  import type { PivotClass } from '../analytics/pivot-class'
  import { LocationStore } from '../locations/LocationStore'
  import type { ILocation } from '../locations/LocationClass'
  import { PluginStore } from '../plugins/PluginStore'
  import type { PluginType } from '../plugins/plugin-helpers'
  import LockClosedSolid from '../../n-icons/LockClosedSolid.svelte'
  import TrashOutline from '../../n-icons/TrashOutline.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  // import download from '../../modules/download/download'
  // import { strToTagSafe } from '../trackable/trackable-utils'

  const { template: originalTemplate = $bindable(), onNameChange } = $props<{ template: Template, onNameChange?: (name: string) => void }>()

  let template = $state(originalTemplate)

  $effect(() => {
    template = originalTemplate
  })

  $effect(() => {
    // Sync local changes back to the bindable prop
    // This updates the parent component with changes made in this editor
    originalTemplate.name = template.name
    originalTemplate.description = template.description
    originalTemplate.trackables = template.trackables
    originalTemplate.boards = template.boards
    originalTemplate.dashboards = template.dashboards
    originalTemplate.goals = template.goals
    originalTemplate.pivots = template.pivots
    originalTemplate.locations = template.locations
    originalTemplate.plugins = template.plugins
  })

  const strToTrackable = (str: string): Trackable | undefined => {
    const token = strToToken(str)
    if (!token) {
      return undefined
    }
    return tokenToTrackable(token, $TrackableStore.trackables)
  }

  const addTrackableFromTag = (str) => {
    const trackable = strToTrackable(str)
    if (trackable) {
      addTrackableToTemplate(trackable)
    }
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
    if (trackable) {
      addTrackableToTemplate(trackable)
    }
  }

  const addTrackableToTemplate = (trackable: Trackable | undefined) => {
    if (!trackable) {
      return
    }
    if (!template.trackables.find((t) => t.id == trackable.id)) {
      template = { ...template, trackables: [...template.trackables, trackable] }

      // Import Combo / Note Trackables too
      if (trackable.type == 'tracker' && trackable.tracker.type == 'note') {
        const tokens = strToTokens(trackable.tracker.note || '')

        tokens.forEach((token: Token) => {
          const includedTrackable = tokenToTrackable(token, $TrackableStore.trackables)
          if (includedTrackable) {
            addTrackableToTemplate(includedTrackable)
          }
        })
      }
    }
  }

  onMount(() => {
    initializeDashStore()
  })

  const getTrackableTag = (trackable: Trackable): string | undefined => {
    if (trackable.type === 'tracker') return trackable.tracker?.tag
    if (trackable.type === 'context') return trackable.ctx?.tag
    if (trackable.type === 'person') return trackable.person?.username || trackable.person?.displayName
    if (trackable.type === 'pointer') return trackable.ptr?.tag
    return trackable.tag
  }

  const getTrackableRemovalReason = (trackable: Trackable): string | null => {
    const reasons: string[] = []
    const trackableTag = getTrackableTag(trackable)

    if (!trackableTag) return null

    // Check if used by any goal (strip # prefix from goal tag for comparison)
    if (template.goals.some((goal) => {
      const goalTag = goal?.tag?.replace(/^#/, '') || ''
      return goalTag === trackableTag
    })) {
      reasons.push('a goal')
    }

    // Check if used by any dashboard widget
    let usedByDashboard = false
    for (const dashboard of template.dashboards) {
      if (!dashboard?.widgets) continue
      for (const widget of dashboard.widgets) {
        if (!widget) continue
        if (widget.tokens && Array.isArray(widget.tokens)) {
          if (widget.tokens.some((t) => t && t.id === trackableTag)) {
            usedByDashboard = true
            break
          }
        }
      }
      if (usedByDashboard) break
    }

    if (usedByDashboard) {
      reasons.push('a dashboard widget')
    }

    // Check if used by any pivot (rows, cols, or vals)
    if (template.pivots.some((pivot) => {
      if (!pivot?.options) return false
      const { rows = [], cols = [], vals = [] } = pivot.options
      const allTags = [...rows, ...cols, ...vals]
      // Strip emoji from pivot tags for comparison
      return allTags.some((tag) => {
        const cleanTag = tag.replace(/^[^\p{L}\p{N}]+/u, '').trim()
        return cleanTag === trackableTag
      })
    })) {
      reasons.push('a pivot')
    }

    // Note: Trackables used in tabs are removable since they're automatically cleaned up from tabs when removed

    if (reasons.length === 0) {
      return null
    }

    // Format reasons: "Used by a goal and a dashboard widget"
    if (reasons.length === 1) {
      return `Used by ${reasons[0]}`
    }

    return `Used by ${reasons.join(' and ')}`
  }

  const removeTrackable = (trackable: Trackable) => {
    // Remove from trackables array
    template.trackables = template.trackables.filter((t) => t.id !== trackable.id)

    // Remove from boards/tabs
    template.boards = template.boards.map((board) => ({
      ...board,
      elements: board.elements.filter((tag) => tag !== trackable.tag),
    }))

    // Reassign template to trigger reactivity
    template = { ...template }
  }

  const removeTab = (boardId: string) => {
    template.boards = template.boards.filter((b) => b.id !== boardId)
    template = { ...template }
  }

  const removeDashboard = (dashboardId: string) => {
    template.dashboards = template.dashboards.filter((d) => d.id !== dashboardId)
    template = { ...template }
  }

  const removeGoal = (goalId: string) => {
    template.goals = template.goals.filter((g) => g.id !== goalId)
    template = { ...template }
  }

  const removeGoalsByDuration = (duration: string) => {
    template.goals = template.goals.filter((g) => g.duration !== duration)
    template = { ...template }
  }

  const removeLocation = (locationId: string) => {
    template.locations = template.locations.filter((l) => l.id !== locationId)
    template = { ...template }
  }

  const removePlugin = (pluginId: string) => {
    template.plugins = template.plugins.filter((p) => p.id !== pluginId)
    template = { ...template }
  }

  const removePivot = (pivotId: string) => {
    template.pivots = template.pivots.filter((pv) => pv.id !== pivotId)
    template = { ...template }
  }

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
          // Reassign template to trigger reactivity for trackable removal reasons
          template = { ...template }
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
          template.trackables = [...template.trackables, trackable]
        })
      },
    },
    {
      id: 'new',
      title: 'Create a Person',
      async click() {
        openTrackableEditor(new Trackable({ type: 'person' }), (trackable) => {
          template.trackables = [...template.trackables, trackable]
        })
      },
    },
    {
      id: 'new',
      title: 'Create a Context',
      async click() {
        openTrackableEditor(new Trackable({ type: 'context' }), (trackable) => {
          template.trackables = [...template.trackables, trackable]
        })
      },
    },
    {
      id: 'new',
      title: 'Create a Pointer',
      async click() {
        openTrackableEditor(new Trackable({ type: 'pointer' }), (trackable) => {
          template.trackables = [...template.trackables, trackable]
        })
      },
    },
  ]

  const addRequiredTrackablesFromDashboard = (dashboard: DashboardClass) => {
    const tokens: Array<Token> = []

    // Extract single tokens from widgets
    dashboard.widgets.forEach((widget) => {
      if (widget.token) {
        tokens.push(widget.token)
      }
      // Also extract array of tokens if present
      if (widget.tokens && Array.isArray(widget.tokens)) {
        tokens.push(...widget.tokens)
      }
    })

    // Add all extracted tokens to template
    tokens.forEach((token) => {
      if (token) {
        addTokenToTemplate(token)
      }
    })
  }

  const extractPluginIdsFromDashboard = (dashboard: DashboardClass): Array<string> => {
    return dashboard.widgets
      .filter((widget) => widget.type === 'plugin' && widget.data?.pluginId)
      .map((widget) => widget.data.pluginId)
  }

  const addRequiredPluginsFromDashboard = (dashboard: DashboardClass) => {
    const pluginIds = extractPluginIdsFromDashboard(dashboard)
    pluginIds.forEach((pluginId) => {
      const plugin = $PluginStore.find((p) => p.id === pluginId)
      if (plugin && !template.plugins.find((p) => p.id === pluginId)) {
        template = { ...template, plugins: [...template.plugins, plugin] }
      }
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
          addRequiredPluginsFromDashboard(dashboard)
          // Reassign entire template to trigger reactivity for trackable removal reasons
          template = { ...template }
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

  const groupGoalsByDuration = (goals: Array<GoalClass>) => {
    return {
      day: goals.filter(g => g.duration === 'day'),
      week: goals.filter(g => g.duration === 'week'),
      month: goals.filter(g => g.duration === 'month'),
      year: goals.filter(g => g.duration === 'year'),
    }
  }

  const getDurationLabel = (duration: string): string => {
    const labels: { [key: string]: string } = {
      day: 'Daily',
      week: 'Weekly',
      month: 'Monthly',
      year: 'Yearly',
    }
    return labels[duration] || duration
  }

  const openGoalsByDurationImporter = (goals: Array<GoalClass>, duration: string) => {
    const goalsForDuration = goals.filter(g => g.duration === duration)

    const buttons = goalsForDuration.map((goal: GoalClass) => {
      return {
        title: `${goal.tag} ${goal.comparison} ${goal.target}`,
        id: goal.id,
        click() {
          let index = template.goals.findIndex((g) => g.id === goal.id)
          if (index > -1) {
            template.goals[index] = goal
          } else {
            template.goals.push(goal)
          }
          addTrackableFromTag(goal.tag)
          // Reassign template to trigger reactivity for trackable removal reasons
          template = { ...template }
        },
      }
    })

    if (buttons.length === 0) {
      openPopMenu({
        id: 'import-goal-empty',
        title: `No ${getDurationLabel(duration)} Goals`,
        buttons: [{ title: 'Go Back', id: 'back', click() { openGoalImporter($GoalStore) } }],
      })
      return
    }

    // Add "Add All" button
    buttons.unshift({
      title: `✓ Add All ${getDurationLabel(duration)} Goals (${goalsForDuration.length})`,
      id: 'add-all',
      click() {
        // Add all goals for this duration
        goalsForDuration.forEach((goal) => {
          let index = template.goals.findIndex((g) => g.id === goal.id)
          if (index > -1) {
            template.goals[index] = goal
          } else {
            template.goals.push(goal)
          }
          // Add goal's trackable
          addTrackableFromTag(goal.tag)
        })
        // Reassign template to trigger reactivity for trackable removal reasons
        template = { ...template }
      },
    })

    // Add back button
    buttons.unshift({
      title: '← Back to Duration Selection',
      id: 'back',
      click() {
        openGoalImporter($GoalStore)
      },
    })

    openPopMenu({
      id: 'import-goal-by-duration',
      title: `${getDurationLabel(duration)} Goals`,
      buttons: buttons,
    })
  }

  const openGoalImporter = (goals: Array<GoalClass>) => {
    const grouped = groupGoalsByDuration(goals)

    const buttons = [
      {
        title: `Daily Goals (${grouped.day.length})`,
        id: 'day',
        click() {
          openGoalsByDurationImporter(goals, 'day')
        },
      },
      {
        title: `Weekly Goals (${grouped.week.length})`,
        id: 'week',
        click() {
          openGoalsByDurationImporter(goals, 'week')
        },
      },
      {
        title: `Monthly Goals (${grouped.month.length})`,
        id: 'month',
        click() {
          openGoalsByDurationImporter(goals, 'month')
        },
      },
      ...(grouped.year.length > 0 ? [{
        title: `Yearly Goals (${grouped.year.length})`,
        id: 'year',
        click() {
          openGoalsByDurationImporter(goals, 'year')
        },
      }] : []),
    ]

    openPopMenu({
      id: 'import-goal',
      title: 'Select Goal Period',
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

          // Add trackables used in pivot (rows, cols, vals) to template if not already present
          if (pivot.options) {
            const { rows = [], cols = [], vals = [] } = pivot.options
            const tagsToAdd = new Set([...rows, ...cols, ...vals])
            const trackableStoreValue = get(TrackableStore)
            const trackablesToAdd = []

            for (const tag of tagsToAdd) {
              // Strip emoji prefix from tag (pivot tags have emoji prefixes)
              const cleanTag = tag.replace(/^[^\p{L}\p{N}]+/u, '').trim()
              console.log('Original tag:', tag, '-> Clean tag:', cleanTag)

              // Check if trackable already in template
              const alreadyExists = template.trackables.some(t => {
                const tTag = getTrackableTag(t)
                return tTag === cleanTag || tTag?.replace(/^[#@]/, '') === cleanTag
              })

              console.log('Already exists in template?', alreadyExists)

              if (!alreadyExists) {
                // Try to find trackable in store with different prefixes
                console.log('Trying keys:', cleanTag, `#${cleanTag}`, `@${cleanTag}`)
                let storeTrackable = trackableStoreValue.trackables?.[cleanTag]
                console.log('Try 1 (no prefix):', !!storeTrackable)
                if (!storeTrackable) storeTrackable = trackableStoreValue.trackables?.[`#${cleanTag}`]
                console.log('Try 2 (# prefix):', !!storeTrackable)
                if (!storeTrackable) storeTrackable = trackableStoreValue.trackables?.[`@${cleanTag}`]
                console.log('Try 3 (@ prefix):', !!storeTrackable)

                if (storeTrackable) {
                  console.log('Found! Adding:', storeTrackable)
                  trackablesToAdd.push(storeTrackable)
                }
              }
            }

            // Reassign template with new trackables array to trigger reactivity
            if (trackablesToAdd.length > 0) {
              template = { ...template, trackables: [...template.trackables, ...trackablesToAdd] }
              return
            }
          }

          // Reassign template to trigger reactivity for trackable removal reasons
          template = { ...template }
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

  const openLocationImporter = (locations: Array<ILocation>) => {
    const buttons = locations.map((location: ILocation) => {
      const lat = typeof location.lat === 'number' ? location.lat : parseFloat(location.lat as any)
      const lng = typeof location.lng === 'number' ? location.lng : parseFloat(location.lng as any)
      const latStr = isNaN(lat) ? '?' : lat.toFixed(2)
      const lngStr = isNaN(lng) ? '?' : lng.toFixed(2)

      return {
        title: `${location.name} (${latStr}, ${lngStr})`,
        id: location.id || location.hash,
        click() {
          let index = template.locations.findIndex((l) => l.id === location.id)
          if (index > -1) {
            const updatedLocations = [...template.locations]
            updatedLocations[index] = location
            template = { ...template, locations: updatedLocations }
          } else {
            template = { ...template, locations: [...template.locations, location] }
          }
        },
      }
    })

    if (buttons.length === 0) {
      openPopMenu({
        id: 'import-location-empty',
        title: 'No Saved Locations',
        buttons: [{ title: 'Go Back', id: 'back', click() { } }],
      })
      return
    }

    // Add "Add All" button
    buttons.unshift({
      title: `✓ Add All Locations (${locations.length})`,
      id: 'add-all',
      click() {
        const updatedLocations = [...template.locations]
        locations.forEach((location) => {
          let index = updatedLocations.findIndex((l) => l.id === location.id)
          if (index > -1) {
            updatedLocations[index] = location
          } else {
            updatedLocations.push(location)
          }
        })
        template = { ...template, locations: updatedLocations }
      },
    })

    openPopMenu({
      id: 'import-location',
      title: 'Saved Locations',
      buttons: buttons,
    })
  }

  const addLocation = async () => {
    openLocationImporter($LocationStore)
  }

  const openPluginImporter = (plugins: Array<PluginType>) => {
    const filteredPlugins = plugins.filter((plugin) => !plugin.buildin)

    const buttons = filteredPlugins.map((plugin: PluginType) => {
      return {
        title: `${plugin.emoji || '🔌'} ${plugin.name}`,
        id: plugin.id,
        click() {
          let index = template.plugins.findIndex((p) => p.id === plugin.id)
          if (index > -1) {
            const updatedPlugins = [...template.plugins]
            updatedPlugins[index] = plugin
            template = { ...template, plugins: updatedPlugins }
          } else {
            template = { ...template, plugins: [...template.plugins, plugin] }
          }
        },
      }
    })

    // Add "Add All" button
    buttons.unshift({
      title: `✓ Add All Plugins (${filteredPlugins.length})`,
      id: 'add-all',
      click() {
        const updatedPlugins = [...template.plugins]
        filteredPlugins.forEach((plugin) => {
          let index = updatedPlugins.findIndex((p) => p.id === plugin.id)
          if (index > -1) {
            updatedPlugins[index] = plugin
          } else {
            updatedPlugins.push(plugin)
          }
        })
        template = { ...template, plugins: updatedPlugins }
      },
    })

    openPopMenu({
      id: 'import-plugin',
      title: 'Saved Plugins',
      buttons: buttons,
    })
  }

  const addPlugin = async () => {
    openPluginImporter($PluginStore)
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
    <Input listItem type="text" placeholder="Template Name" bind:value={template.name} on:input={() => onNameChange?.(template.name)} />
    <Input listItem type="textarea" placeholder="Description" bind:value={template.description} />
  </List>
  <List solo outside title="Trackables">
    <Button size="sm" on:click={() => addTrackableOptions()} primary clear slot="header-right">+ Add</Button>
    {#if !template.trackables.length}
      <Empty small>
        <span class="text-gray-500">No Trackables</span>
      </Empty>
    {:else}
      {#key template.goals.length + template.dashboards.length + template.pivots.length + template.locations.length + template.plugins.length}
        <div class="pill-holder px-1 flex flex-wrap py-2">
          {#each template.trackables as trackable (trackable.id)}
            {@const removalReason = getTrackableRemovalReason(trackable)}
          <div class="pill-wrapper relative" data-trackable-id={trackable.id}>
            <button
              on:click={() => {
                getTrackerOptions(trackable)
              }}
              class="pill"
            >
              <TrackableAvatar {trackable} size={20} />
              {#if trackable.type == 'tracker'}
              <span class="label">{trackable.tracker.label}</span>
              {:else if trackable.type == 'person'}
              <span class="label">{trackable.person.displayName}</span>
              {:else if trackable.type == 'context'}
              <span class="label">{trackable.ctx.label}</span>
              {:else if trackable.type == 'pointer'}
              <span class="label">{trackable.ptr.label}</span>
              {/if}
            </button>
            {#if removalReason}
              <div class="icon-badge lock-badge cursor-help group" title={removalReason}>
                <IonIcon icon={LockClosedSolid} size={10} className="text-white" />
                <div class="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {removalReason}
                </div>
              </div>
            {:else}
            {:else}
              <button
                on:click={() => removeTrackable(trackable)}
                class="icon-badge trash-badge hover:brightness-110"
                title="Remove trackable"
              >
                <IonIcon icon={TrashOutline} size={10} className="text-white" />
              </button>
            {/if}
          </div>
        {/each}
      </div>
      {/key}
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
          <div class="relative pr-20">
            <div class="mb-2">
              <h2 class="ntitle">{board.label}</h2>
            </div>
            <button
              on:click={() => removeTab(board.id)}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove this tab"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
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
        <ListItem>
          <div class="relative pr-12 w-full">
            <div class="mb-2">
              <h2 class="ntitle">{dashboard.label}</h2>
            </div>
            <button
              on:click={() => removeDashboard(dashboard.id)}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove this dashboard"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
            <div class="widgets -ml-1 text-xs p-1 rounded-md flex flex-wrap">
              {#if dashboard.widgets.length}
                {#each dashboard.widgets as widget}
                  <button class="pill sm space-x- flex">
                    <strong>{new WidgetClass(widget).getTitle()}</strong>
                    <span>{widget.type}</span>
                    <span>{new WidgetClass(widget).getLabel().replace('days','')}</span>
                  </button>
                {/each}
              {/if}
            </div>
          </div>
        </ListItem>
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
      {#if groupGoalsByDuration(template.goals).day.length > 0}
        <div class="goal-section pr-5">
          <div class="relative">
            <h3 class="goal-period-label">Daily Goals</h3>
            <button
              on:click={() => removeGoalsByDuration('day')}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove all daily goals"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
          </div>
          {#each groupGoalsByDuration(template.goals).day as goal}
            <ListItem>
              <div class="relative pr-12 w-full">
                <div class="ntitle text-sm">
                  <span>{goal.tag}</span>
                  <span>{goal.comparison}</span>
                  <span>{goal.target}</span>
                </div>
                <button
                  on:click={() => removeGoal(goal.id)}
                  class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
                  title="Remove this goal"
                >
                  <IonIcon icon={TrashOutline} size={10} className="text-white" />
                </button>
              </div>
            </ListItem>
          {/each}
        </div>
      {/if}
      {#if groupGoalsByDuration(template.goals).week.length > 0}
        <div class="goal-section pr-5">
          <div class="relative">
            <h3 class="goal-period-label">Weekly Goals</h3>
            <button
              on:click={() => removeGoalsByDuration('week')}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove all weekly goals"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
          </div>
          {#each groupGoalsByDuration(template.goals).week as goal}
            <ListItem>
              <div class="relative pr-12 w-full">
                <div class="ntitle text-sm">
                  <span>{goal.tag}</span>
                  <span>{goal.comparison}</span>
                  <span>{goal.target}</span>
                </div>
                <button
                  on:click={() => removeGoal(goal.id)}
                  class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
                  title="Remove this goal"
                >
                  <IonIcon icon={TrashOutline} size={10} className="text-white" />
                </button>
              </div>
            </ListItem>
          {/each}
        </div>
      {/if}
      {#if groupGoalsByDuration(template.goals).month.length > 0}
        <div class="goal-section pr-5">
          <div class="relative">
            <h3 class="goal-period-label">Monthly Goals</h3>
            <button
              on:click={() => removeGoalsByDuration('month')}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove all monthly goals"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
          </div>
          {#each groupGoalsByDuration(template.goals).month as goal}
            <ListItem>
              <div class="relative pr-12 w-full">
                <div class="ntitle text-sm">
                  <span>{goal.tag}</span>
                  <span>{goal.comparison}</span>
                  <span>{goal.target}</span>
                </div>
                <button
                  on:click={() => removeGoal(goal.id)}
                  class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
                  title="Remove this goal"
                >
                  <IonIcon icon={TrashOutline} size={10} className="text-white" />
                </button>
              </div>
            </ListItem>
          {/each}
        </div>
      {/if}
      {#if groupGoalsByDuration(template.goals).year.length > 0}
        <div class="goal-section pr-5">
          <div class="relative">
            <h3 class="goal-period-label">Yearly Goals</h3>
            <button
              on:click={() => removeGoalsByDuration('year')}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove all yearly goals"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
          </div>
          {#each groupGoalsByDuration(template.goals).year as goal}
            <ListItem>
              <div class="relative pr-12 w-full">
                <div class="ntitle text-sm">
                  <span>{goal.tag}</span>
                  <span>{goal.comparison}</span>
                  <span>{goal.target}</span>
                </div>
                <button
                  on:click={() => removeGoal(goal.id)}
                  class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
                  title="Remove this goal"
                >
                  <IonIcon icon={TrashOutline} size={10} className="text-white" />
                </button>
              </div>
            </ListItem>
          {/each}
        </div>
      {/if}
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
          <div class="relative pr-12 w-full">
            <div class="ntitle">
              <span>{pivot.emoji}{pivot.tag}</span>
            </div>
            <button
              on:click={() => removePivot(pivot.id)}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove this pivot"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
          </div>
        </ListItem>
      {/each}
    {/if}
  </List>
  <List solo outside title="Locations">
    <Button size="sm" on:click={() => addLocation()} primary clear slot="header-right">+ Add</Button>
    {@const locationList = template.locations}
    {#if !locationList.length}
      <Empty small>
        <span class="text-gray-500">No Locations</span>
      </Empty>
    {:else}
      {#each locationList as location, index}
        {@const lat = typeof location.lat === 'number' ? location.lat : parseFloat(location.lat as any)}
        {@const lng = typeof location.lng === 'number' ? location.lng : parseFloat(location.lng as any)}
        {@const latStr = isNaN(lat) ? '?' : lat.toFixed(2)}
        {@const lngStr = isNaN(lng) ? '?' : lng.toFixed(2)}
        <ListItem>
          <div class="relative pr-12 w-full">
            <div class="ntitle text-sm">
              <span>{location.name}</span>
              <span class="text-gray-500 text-xs">({latStr}, {lngStr})</span>
            </div>
            <button
              on:click={() => removeLocation(location.id)}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove this location"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
          </div>
        </ListItem>
      {/each}
    {/if}
  </List>
  <List solo outside title="Plugins">
    <Button size="sm" on:click={() => addPlugin()} primary clear slot="header-right">+ Add</Button>
    {#if !template.plugins.length}
      <Empty small>
        <span class="text-gray-500">No Plugins</span>
      </Empty>
    {:else}
      {#each template.plugins as plugin, index}
        <ListItem>
          <div class="relative pr-12 w-full">
            <div class="ntitle text-sm">
              <span>{plugin.emoji || '🔌'} {plugin.name}</span>
              <span class="text-gray-500 text-xs">{plugin.version}</span>
            </div>
            <button
              on:click={() => removePlugin(plugin.id)}
              class="absolute top-0 right-0 icon-badge trash-badge hover:brightness-110"
              title="Remove this plugin"
            >
              <IonIcon icon={TrashOutline} size={10} className="text-white" />
            </button>
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

  .goal-section {
    @apply pt-2;
  }

  .goal-period-label {
    @apply text-xs font-semibold text-gray-600 dark:text-gray-400;
    @apply px-4 py-2 uppercase tracking-wide;
    @apply bg-gray-50 dark:bg-gray-900;
  }

  .pill-wrapper {
    @apply m-1;
  }

  .pill-wrapper .group:hover > div {
    @apply block;
  }

  .icon-badge {
    @apply absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center;
    border-radius: 50%;
  }

  .lock-badge {
    @apply bg-gray-600 dark:bg-gray-500;
  }

  .trash-badge {
    @apply bg-red-500;
  }
</style>
