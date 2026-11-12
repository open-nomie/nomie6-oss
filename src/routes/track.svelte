<svelte:options runes={true} />

<script lang="ts">
  import Toolbar from '../components/toolbar/toolbar.svelte'
  import Button from '../components/button/button.svelte'
  import BoardTabs from '../components/board-tabs/board-tabs.svelte'
  import { AlarmOutline } from '../components/icon/nicons'

  import Uniboard from '../domains/board/Uniboard.svelte'
  import Layout from '../domains/layout/layout.svelte'
  import TrackHeader from './track-header.svelte'

  import {
    ActiveBoard,
    CombinedBoards,
    disableBoardEditMode,
    setActiveBoard,
    toggleBoardEditMode,
    UniboardStore,
  } from '../domains/board/UniboardStore'

  // import UsageStoreVisualizer from '../domains/usage/usage-store-visualizer.svelte'
  import { addDividerToFirst } from '../modules/pop-buttons/pop-buttons'
  import { Device } from '../store/device-store'
  import { getBoardAddOptions, getBoardMenu, saveBoard } from '../domains/board/boardActions'
  import { openUnisearch } from '../domains/search/UnisearchStore'
  import { Prefs } from '../domains/preferences/Preferences'
  import { quintOut } from 'svelte/easing'
  import { RunningTimers } from '../domains/tracker/TrackerStore'
  import { showRunningTimersModal } from '../domains/tracker/timers/useTimersModal'
  import { showToast } from '../components/toast/ToastStore'
  import { slide } from 'svelte/transition'
  import { TodayStore } from '../domains/usage/today/TodayStore'
  import { TrackableStore } from '../domains/trackable/TrackableStore'
  import appConfig from '../config/appConfig'
  import CaretDownCircle from '../n-icons/CaretDownCircle.svelte'
  import ExpandOutline from '../n-icons/ExpandOutline.svelte'
  import IonIcon from '../components/icon/ion-icon.svelte'
  import Logo from '../components/logo/logo.svelte'
  import MenuInline from '../components/menu/menu-inline.svelte'
  import SearchBar from '../components/search-bar/search-bar.svelte'
  import SearchIcon from '../n-icons/SearchIcon.svelte'
  import TodayDateController from '../domains/usage/today-date-controller.svelte'
  import type { Trackable } from '../domains/trackable/Trackable.class'
  import type { UniboardType } from '../domains/board/UniboardStore'
  import UpgradeMessage from '../components/upgrade-message/upgrade-message.svelte'

  const location = undefined
  const style = ''

  /**
   * Get Dynamic boards
   * So we don't store them in user data
   */
  // let allBoard: UniboardType = getDynamicBoard('all')
  // let peopleBoard: UniboardType = getDynamicBoard('people')

  /**
   * Setup Default Boards
   * We will default to ALL if nothing is selected
   * TODO: look what happens if these do not match up
   */

  let activeBoard: UniboardType | undefined = $state(undefined)
  let searchFor: string | undefined = $state(undefined)

  let edittedUniboard: UniboardType = $state()

  let lastActiveHash = $state('')
  let boardAddMenu = $state([])
  let searching = $state(false)

  $effect(() => {
    if (
      $CombinedBoards &&
      $CombinedBoards.length &&
      $UniboardStore.activeId &&
      $UniboardStore.activeId !== activeBoard?.id
    ) {
      activeBoard = $CombinedBoards.find((b) => b.id === $UniboardStore.activeId)
      if (activeBoard) {
        setBoardFilters(activeBoard)
      }
    }
  })

  $effect(() => {
    if ($Prefs) {
      boardAddMenu = [
        ...getBoardAddOptions($ActiveBoard, $TrackableStore.trackables),
        ...addDividerToFirst(getBoardMenu($ActiveBoard)),
        ...[
          {
            title: 'Search Nomie',
            divider: true,
            icon: SearchIcon,
            click() {
              openUnisearch()
            },
          },
        ],
      ]
    }
  })

  $effect(() => {
    if ($UniboardStore.hash !== lastActiveHash) {
      lastActiveHash = $UniboardStore.hash
      setBoardFilters($ActiveBoard)
    }
  })

  $effect(() => {
    if (searchFor) {
      searching = true
      trackableFilter = (trackable: Trackable): any => {
        return JSON.stringify(trackable).toLowerCase().search(searchFor.toLowerCase()) > -1 ? true : false
      }
    } else if (searching) {
      searching = false
      setBoardFilters(activeBoard)
    }
  })

  let trackableFilter: (ele: Trackable) => boolean = $state((ele: Trackable) => {
    return ele.type
  })

  let trackableSort: (ele1: Trackable, ele2: Trackable) => number = $state((ele1: Trackable, ele2: Trackable) => {
    return ele1.label.toLowerCase() > ele2.label.toLowerCase() ? 1 : -1
  })

  /**
   * Setup the Filter and Sort
   * WHy Filter/Sort? We have a huge list of Trackables
   * - 400+ for some users. instead of compiling a new array each time.
   * we load up the full array, and then just
   * use .filter().sort() to reduce the items for what should be shown
   *
   * @param board
   */
  const setBoardFilters = async (board: UniboardType) => {
    if (board) {
      trackableSort = (a: Trackable, b: Trackable) => {
        return board.elements.indexOf(a.tag) > board.elements.indexOf(b.tag) ? 1 : -1
      }

      // Create the Filter for the View
      trackableFilter = (t: any): any => {
        return board.elements.indexOf(t.tag) > -1
      }
    }
  }

  // let showCouchWarning: boolean = false

  const saveBoardEdits = async () => {
    const savingBoard = { ...edittedUniboard }
    await saveBoard(savingBoard)
    edittedUniboard = undefined
    disableBoardEditMode()
    showToast({ message: `${savingBoard.label} updated` })
  }
</script>

<Layout pageTitle={`${$ActiveBoard?.label || ''} Track`}>
  <TrackHeader
    slot="header"
    showController={$TodayStore.showController}
    editMode={$UniboardStore.editMode}
    editingLabel={$ActiveBoard?.label}
    editedUniboard={edittedUniboard}
    onToggleEditMode={() => toggleBoardEditMode()}
    onSaveEdits={() => saveBoardEdits()}
    boardAddMenu={boardAddMenu}
    onBoardTabTap={async (evt) => {
      const newActiveBoard = evt.detail
      setActiveBoard(newActiveBoard)
      Device.scrollToTop()
    }}
    combinedBoards={$CombinedBoards}
    searchFor={searchFor}
    onSearchChange={(evt) => {
      searchFor = evt.detail
    }}
    onSearchClear={() => {
      searchFor = undefined
    }}
    trackableCount={Object.keys($TrackableStore.trackables).length}
    deviceWidth={$Device.width}
    runningTimers={$RunningTimers}
    onShowRunningTimers={() => showRunningTimersModal()}
    carouselIcon={CaretDownCircle}
    alarmIcon={AlarmOutline}
  />
  <!-- Include the Universial Board -->

  {#if !$UniboardStore.editMode && Object.keys($TrackableStore.trackables).length > 5 && $Device.width < 699}
    <SearchBar
      className=""
      compact
      on:clear={() => {
        searchFor = undefined
      }}
      on:change={(evt) => {
        searchFor = evt.detail
      }}
    >
      <Button icon slot="right-inside" on:click={() => openUnisearch(searchFor)}>
        <IonIcon icon={ExpandOutline} className="text-gray-500" size={18} />
      </Button>
    </SearchBar>
  {/if}

  <!-- Tracker Board -->
  <!-- {#if $Prefs.storageType === 'pouchdb'}
    <div class="bg-red-500 text-white py-2 px-4 text-xs mt-2">
      <p class="font-bold">
        CouchDB Deprecation Notice. <button
          class="underline"
          on:click={() => {
            showCouchWarning = !showCouchWarning
          }}>Learn more</button
        >
        </p>
      {#if showCouchWarning}
        <p class="opacity-90">
          CouchDB will be removed from Nomie in the next beta release. It will be replaced with an S3 compatiable
          storage engine. <a class="underline" href="mailto:support@happydata.org?subject=CouchDB">Questions?</a>
        </p>
      {/if}
    </div>
  {/if} -->
  <!-- {#key $UniboardStore.hash} -->
  <Uniboard
    searching={searchFor}
    on:editted={(evt) => {
      edittedUniboard = evt.detail
    }}
    bind:sort={trackableSort}
    bind:filter={trackableFilter}
  />

  <!-- <UsageStoreVisualizer /> -->

  <!-- Capture Log -->
</Layout>

<!-- <Board /> -->
