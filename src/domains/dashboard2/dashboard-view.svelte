<script lang="ts">
	import { Prefs } from './../preferences/Preferences';
	import { PermissionsStore } from './../my-account/PermissionsStore';
  import Button from '../../components/button/button.svelte'

  import Container from '../../components/container/container.svelte'

  import IonIcon from '../../components/icon/ion-icon.svelte'

  import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'

  import Toolbar from '../../components/toolbar/toolbar.svelte'

  import { Interact } from '../../store/interact'

  import Layout from '../layout/layout.svelte'
  import { TrackableStore } from '../trackable/TrackableStore'
  import DashbardEditView from './dashbard-edit-view.svelte'
  import type { DashboardClass } from './dashboard-class'
  import DashboardEmptyView from './dashboard-empty-view.svelte'
  import DashboardTabs from './dashboard-tabs.svelte'
  import DashboardWidgetGrid from './dashboard-widget-grid.svelte'
  import {
    createNewDashboard,
    DashStore,
    deleteDashboard,
    initializeDashStore,
    saveDashboard,
    selectDashboardByIndex,
    toggleDashboardEditMode,
  } from './DashStore'

  import { createNewWidget } from './widget/widget-editor/useWidgetEditorModal'

  import MenuInline from '../../components/menu/menu-inline.svelte'

  import AddCircleOutline from '../../n-icons/AddCircleOutline.svelte'
  import EaselOutline from '../../n-icons/EaselOutline.svelte'

  import CreateOutline from '../../n-icons/CreateOutline.svelte'
  import CaretDownCircle from '../../n-icons/CaretDownCircle.svelte'
  import Empty from '../../components/empty/empty.svelte'
  import List from '../../components/list/list.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import { toBlob } from 'html-to-image'
  import shareOptions from '../../modules/share/share'
  import { wait } from '../../utils/tick/tick'
import TrashOutline from '../../n-icons/TrashOutline.svelte';
import PencilOutline from '../../n-icons/PencilOutline.svelte';
import ShareOutline from '../../n-icons/ShareOutline.svelte';
import UpgradeMessage from '../../components/upgrade-message/upgrade-message.svelte';

  $: if (Object.keys($TrackableStore.trackables)) {
    initializeDashStore()
  }

  let mainMenu: Array<PopMenuButton> = []
  $: if ($DashStore) {
    mainMenu = getMainActionMenu()
  }

  const getMainActionMenu = (): Array<PopMenuButton> => {
    return [
      {
        title: 'Add New Widget',
        icon: AddCircleOutline,
        click() {
          createNewWidget()
        },
      },
      {
        title: 'Add New Dashboard',
        icon: EaselOutline,
        click() {
          createNewDashboard()
        },
      },
      {
        title: `Edit ${$DashStore.activeDashboard?.label || ''}`,
        disabled: !$DashStore.activeDashboard,
        icon: CreateOutline,
        divider: true,
        click() {
          toggleDashboardEditMode()
        },
      },
    ]
  }

  const confirmDashboardDelete = async () => {
    const confirmed = await Interact.confirm('Delete this dashboard?', 'This cannot be undone')
    if (confirmed) {
      try {
        const deleted = await deleteDashboard($DashStore.activeDashboard)
        
        selectDashboardByIndex(0)
        $DashStore.editMode = false
      } catch (e) {
        Interact.error(e.message)
      }
    }
  }

  // let previewImage: string | undefined = undefined
  let showDate: boolean = false
  // let screenshotImage:File | undefined;

  const getSharedImageFile = async ():Promise<File | undefined> => {
    Interact.blocker('Generating...')
    showDate = true
    try {
      await wait(600)
      const node = document.getElementById('widgets-frame')
      let blob = await toBlob(node, {
        pixelRatio: 1
      })
      blob = await toBlob(node, {
        pixelRatio: 1
      })
      const screenshotImage = new File([blob], `${$DashStore.activeDashboard.id.substring(0,5)}-dashboard.png`, { type: 'image/png' })
      showDate = false
      Interact.stopBlocker()

      Interact.popmenu({
        title:'Dashboard Report Generated',
        description:'You can now share this as an image',
        id:'share-dashboard',
        buttons:[
          {
            title: (navigator.share ? 'Share...' : 'Download...'),
            click() {
              shareOptions($DashStore.activeDashboard.label, undefined, screenshotImage)
            }
          }
        ]
      })

      return screenshotImage;
    } catch (e) {
      Interact.error(e.message)
      showDate = false
      Interact.stopBlocker()
      return undefined;
    }

  }

  const saveChanges = (edittedDashboard: DashboardClass, silent: boolean = false) => {
    try {
      saveDashboard(edittedDashboard)
      if (!silent) {
        toggleDashboardEditMode()
      }
    } catch (e) {
      Interact.error(e.message)
    }
  }
</script>

<Layout className="h-full">
  <Toolbar slot="header" className="pr-8">
    <MenuInline id="dashboard-menu" menuButtons={mainMenu} buttonClass="menu-button-icon">
      <IonIcon className="text-primary-500" icon={CaretDownCircle} size={32} />
    </MenuInline>

    {#if !$DashStore.editMode}
      <DashboardTabs />
    {:else}
      <Button
        shape="round"
        size="sm"
        className="ml-2 bg-primary-500 text-white w-32"
        on:click={() => {
          toggleDashboardEditMode()
        }}
        >Done
      </Button>
    {/if}
  </Toolbar>

  {#if !$PermissionsStore.canWrite && $PermissionsStore.loggedIn && $Prefs.storageType == 'firebase'}
   <UpgradeMessage />
  {:else if $DashStore.activeDashboard}
    <Container size="xl">
      {#if $DashStore.activeDashboard.widgets.length === 0}
        <DashboardEmptyView />
      {:else if $DashStore.editMode}
        <DashbardEditView
          dashboard={$DashStore.activeDashboard}
          on:save={(evt) => {
            saveChanges(evt.detail)
          }}
          on:update={(evt) => {
            saveChanges(evt.detail, true)
          }}
        />
      {:else}
        <DashboardWidgetGrid {showDate} dashboard={$DashStore.activeDashboard} />
      {/if}
    </Container>
    <hr class="mt-4 mb-6 border-gray-500 dark:border-opacity-20 dark:border-gray-200 border-opacity-20" />
    <Container size="md">
      
        <ListItem clickable on:click={() => createNewWidget()} bottomLine={24}>
          <IonIcon icon={AddCircleOutline} slot="left" />
          <span class="">Add Widget</span></ListItem
        >

        {#if $DashStore.activeDashboard?.widgets?.length > 0}
          <ListItem clickable on:click={async() => {
            await getSharedImageFile();
            
          }} bottomLine={24}>
            <IonIcon icon={ShareOutline} slot="left" />
            Share Dashboard View</ListItem
          >
          <ListItem
            bottomLine={24}
            clickable
            on:click={() => {
              toggleDashboardEditMode()
            }}
          >
            <IonIcon icon={PencilOutline} slot="left" />
            <span>Edit Dashboard</span></ListItem
          >
        {/if}
        <ListItem
          clickable
          on:click={() => {
            confirmDashboardDelete()
          }}
        >
          <IonIcon icon={TrashOutline} slot="left" />
          <span class="text-danger">Delete Dashboard</span></ListItem
        >

    </Container>
  {:else}
    <Empty
      title="No Dashboard Selected"
      description="Create custom dashboards to highlight your data"
      buttonLabel="Create a Dashboard"
      buttonClick={() => {
        createNewDashboard()
      }}
    />
  {/if}
  <div class="h-40" />
</Layout>
