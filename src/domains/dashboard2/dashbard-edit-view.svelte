<script lang="ts">


  import { onMount } from 'svelte'
  import { CloseOutline } from '../../components/icon/nicons'
  import { createEventDispatcher } from 'svelte'
  import { DashboardClass } from './dashboard-class'
  import { dedupArray } from '../../utils/array/array_utils'
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { getWidgetTypes , IWidgetType } from './widget/widget-types'
  import Button from '../../components/button/button.svelte'
  import Container from '../../components/container/container.svelte'
  import Input from '../../components/input/input.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import SortableList2 from '../../components/sortable-list/sortable-list2.svelte'
  import TrackablePill from '../trackable/trackable-pill.svelte'
  import { PluginStore } from '../plugins/PluginStore'

  export let dashboard: DashboardClass

  const dispatch = createEventDispatcher()

  let workingDashboard: DashboardClass
  let allWidgetTypes: Array<IWidgetType> = []
  let mounted = false

  $: if (mounted && !allWidgetTypes.length) {
    allWidgetTypes = getWidgetTypes($PluginStore)
  }

  $: if (dashboard && !workingDashboard) {
    workingDashboard = new DashboardClass(dashboard)
    workingDashboard.widgets = dedupArray(workingDashboard.widgets, 'id')
  }

  const removeWidget = async (widget) => {
    const confirmed = await Interact.confirm('Remove Widget?', 'You can always add it back later.')
    if (confirmed) {
      workingDashboard.widgets = dedupArray(workingDashboard.widgets, 'id')
    }
    workingDashboard.widgets = workingDashboard.widgets
  }

  onMount(() => {
    mounted = true
  })
</script>

<section class="max-w-full w-96 lg:w-full lg:max-w-screen-xl mx-auto">
  <Container size="md" className="px-4 lg:px-0">
    <div class="bg-white rounded-md dark:bg-black mt-4 ">
      <Input
        listItem
        label="Dashboard Label"
        placeholder="Dashboard Label"
        type="text"
        bind:value={workingDashboard.label}
      >
        <div slot="right">
          {#if workingDashboard.label !== dashboard.label}
            <Button
              className="bg-primary-500 text-white"
              shape="round"
              size="sm"
              on:click={() => {
                dispatch('save', workingDashboard)
              }}
            >
              {Lang.t('general.save', 'Save Changes')}
            </Button>
          {/if}
        </div>
      </Input>
    </div>
  </Container>
  {#key workingDashboard.hash}
    <SortableList2
      direction="xy"
      className=""
      items={workingDashboard.widgets}
      key="id"
      on:update={(evt) => {
        workingDashboard.widgets = evt.detail
        workingDashboard = new DashboardClass(workingDashboard)
        dispatch('update', workingDashboard)
      }}
      let:item
    >
      <div
        class={`mock-widget animate-shake
        ${item.size == 'sm' ? 'w-40 lg:w-60' : ''} 
        ${item.size == 'md' ? 'w-80 lg:w-80' : ''} 
        ${item.size == 'lg' ? 'w-96' : ''} 
      `}
      >
        <button class="delete-button" on:click={() => removeWidget(item)}>
          <IonIcon icon={CloseOutline} className="text-white" size={12} />
        </button>
        {#if item.token && $TrackableStore?.trackables[item.token?.raw]}
          <TrackablePill transparent trackable={$TrackableStore.trackables[item.token?.raw]} hideValue size={32} />
        {:else if item.token}
          {item.token.raw}
        {/if}
        <div class="text-gray-500 text-sm">
        {#if item.type == "plugin"}
          <span class="text-2xl">{allWidgetTypes.find((a) => a.data && a.data.pluginId === item.data.pluginId)?.emoji}</span>
          <span> {allWidgetTypes.find((a) => a.data && a.data.pluginId === item.data.pluginId)?.label}</span>
        {:else}
          {allWidgetTypes.find((a) => a.id === item.type)?.label}
          {item.timeRange}
        {/if}
        </div>
      </div>
    </SortableList2>
  {/key}
</section>

<style lang="postcss" global>
  .mock-widget {
    @apply rounded-xl;
    @apply shadow-lg;
    @apply bg-white dark:bg-black;
    @apply text-black dark:text-white;
    @apply h-28 lg:h-40;
    @apply m-2;
    @apply flex items-center flex-col justify-center;
    @apply relative;
  }
</style>
