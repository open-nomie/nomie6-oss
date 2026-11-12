<svelte:options runes={true} />

<script lang="ts">
  import { saveLog } from '../ledger/LedgerStore'
  import { Trackable } from '../trackable/Trackable.class'

  import { ActiveLogStore } from '../capture-log/CaptureLogStore'
  import { InitTrackableStore, TrackableStore } from '../trackable/TrackableStore'
  import { onTrackerTap } from '../tracker/input/TrackerInputStore'
  import UniboardTrackableGrid from './UniboardTrackableGrid.svelte'
  import {
    browseLibraryButton,
    getAddExistingButton,
    getAddTrackerButton,
    showBoardAddOptions,
    showTrackablePopmenu,
  } from './boardActions'
  import { ActiveBoard, CombinedBoards, initUniboardStore, setActiveBoard, UniboardStore } from './UniboardStore'
  import { Lang } from '../../store/lang'
  import { toTrackableArray } from '../trackable/trackable-utils'
  import Spinner from '../../components/spinner/spinner.svelte'
  import Swiper from '../../components/swiper/swiper.svelte'
  import Menu from '../../components/menu/menu.svelte'
  import { Prefs } from '../preferences/Preferences'
  import { objectHash } from '../../modules/object-hash/object-hash'


  // import { openPersonModal } from '../people/usePersonModal'
  import UniboardEditorView from './uniboard-editor-view.svelte'
  import { createEventDispatcher } from 'svelte'
  import { Device } from '../../store/device-store'
  import Button from '../../components/button/button.svelte'
  import { openUnisearch } from '../search/UnisearchStore'
  import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'
  import TrackerClass from '../../modules/tracker/TrackerClass'
  import { PeopleStore } from '../people/PeopleStore'
  import { TrackerStore } from '../tracker/TrackerStore'
  import { onTrackerLongPress } from '../../modules/tracker/tracker-utils'
  import NLog from '../nomie-log/nomie-log'
  import { UsageStore } from '../usage/UsageStore'

  let { searching = $bindable(undefined), sort = $bindable(undefined), filter = $bindable((ele: Trackable) => true) } = $props<{
    searching?: string
    sort?: Function
    filter?: Function
  }>()

  const dispatch = createEventDispatcher()

  let trackables = $state<Array<Trackable>>([])

  // Elements whose trackable still exists; stale tags from deleted trackables don't count
  let liveElementCount = $derived(
    ($ActiveBoard?.elements || []).filter((tag) => Object.values($TrackableStore.trackables).some((t) => t.tag === tag)).length
  )

  $effect(() => {
    if ($TrackableStore.trackables) {
      const usage = $UsageStore
      const activeBoard = $ActiveBoard
      trackables = toTrackableArray($TrackableStore.trackables)
        .filter((trackable) => {
          return filter(trackable)
        })
        .map((trackable) => {
          return trackable
        })
        .sort((a, b) => {
          if ((activeBoard?.id || '').substring(0, 1) === '_') {
            let aUsage = usage[a.tag]?.last?.d ? new Date(usage[a.tag].last.d) : 1
            let bUsage = usage[b.tag]?.last?.d ? new Date(usage[b.tag].last.d) : 0
            return aUsage > bUsage ? -1 : 1
          } else if (sort) {
            return sort(a, b)
          } else {
            let aBoardIndex = activeBoard.elements.indexOf(a.tag)
            let bBoardIndex = activeBoard.elements.indexOf(b.tag)
            return aBoardIndex > bBoardIndex ? 1 : -1
          }
        })
    }
  })

  /**
   * On Trackable Tapped
   * @param trackable
   */
  const onTap = (trackable: Trackable) => {
    if (trackable.type === 'tracker') {
      onTrackerTap(trackable.tracker, $TrackableStore.trackables)
      // } else if (trackable.type === 'person') {
      //   openPersonModal(trackable.person)
    } else {
      ActiveLogStore.addElement(trackable.tag)
      ActiveLogStore.focus()
    }
  }

  /**
   * On More Tapped
   * @param trackable
   */
  const onMore = (trackable: Trackable) => {
    showTrackablePopmenu(trackable, {
      title: `${trackable.label}`,
    })
  }

  /**
   * On Long Press
   * @param trackable
   */
  const onLongpress = async (trackable: Trackable) => {
    if (trackable.type === 'tracker') {
      onTrackerLongPress(trackable.tracker, $TrackerStore)
    } else {
      ActiveLogStore.addElement(trackable.tag)
      await saveLog(new NLog($ActiveLogStore))
      ActiveLogStore.clear()
    }
  }

  /**
   * On Press of the Add Trackable Button
   */
  const onAdd = async () => {
    showBoardAddOptions(
      $UniboardStore.boards.find((b) => b.id == $UniboardStore.activeId),
      $TrackableStore.trackables
    )
  }

  const getEmptyBoardMenu = (): Array<any> => {
    const emptyBoardMenuButtons = [
      { ...browseLibraryButton, ...{ description: `Browse Nomie's pre-built tracker library` } },
      {
        ...getAddTrackerButton($ActiveBoard),
        ...{
          description: Lang.t(
            'general.create-a-tracker-description',
            'Create a custom tracker to monitor any aspect of your life'
          ),
          title: Lang.t('general.create-tracker', 'Create Custom Tracker'),
        },
      },
      // {
      //   ...getAddPersonButton($ActiveBoard),
      //   ...{
      //     description: Lang.t(
      //       'general.add-a-person-description',
      //       'Track when you intereact with your friends and family'
      //     ),
      //     title: `${Lang.t('general.add-a-person', 'Add New Person')}`,
      //   },
      // },
    ]

    //@ts-ignore
    emptyBoardMenuButtons.unshift(getAddExistingButton($ActiveBoard))
    return emptyBoardMenuButtons
  } // end get Empty Boad Menu

  // const getEmptyBoard

  let swiper = $state<Swiper | undefined>(undefined)
  let initialBoardActived = $state(false)
  let lastActiveId = $state('')

  $effect(() => {
    if (
      $UniboardStore.activeId &&
      $CombinedBoards.length &&
      $TrackableStore.ready &&
      !initialBoardActived &&
      !lastActiveId.length &&
      swiper
    ) {
      setActiveBoard($UniboardStore.activeId)
      initialBoardActived = true
    }
  })

  $effect(() => {
    if ($ActiveBoard && $ActiveBoard.id !== lastActiveId) {
      lastActiveId = $ActiveBoard.id

      setTimeout(() => {
        let ele = document.querySelector(`#uniboard-swiper .wrapper #b-${$ActiveBoard.id}`)
        if (ele) ele.scrollIntoView(false)
        Device.scrollToTop()
      }, 200)
    }
  })

  let lastTrackableHash = $state('')
  $effect(() => {
    if (objectHash($TrackableStore.trackables) !== lastTrackableHash) {
      if (Object.keys($TrackableStore.trackables).length > 0) {
        lastTrackableHash = objectHash($TrackableStore.trackables)
        initUniboardStore($TrackableStore.trackables)
      }
    }
  })

  let lastPeopleHash = $state('')
  $effect(() => {
    if (objectHash($PeopleStore) !== lastPeopleHash) {
      if (Object.keys($PeopleStore).length > 0) {
        lastPeopleHash = objectHash($PeopleStore)
        InitTrackableStore()
        setTimeout(() => {
          initUniboardStore($TrackableStore.trackables)
        }, 200)
      }
    }
  })
</script>

<section class="nomie-board-tab  py-2" style="min-height:45vh">
  {#if $CombinedBoards}
    <Swiper
      id="uniboard-swiper"
      bind:this={swiper}
      on:index={(evt) => {
        let index = evt.detail
        if (initialBoardActived) {
          setActiveBoard($CombinedBoards[index])
        } else {
          initialBoardActived = true
        }
      }}
    >
      {#each $CombinedBoards.filter((t) => t) as board}
        <section class="min-w-full w-full  text-white" id={`b-${board?.id}`} style="min-height:45vh">
          {#if $ActiveBoard && $ActiveBoard.id === board?.id}
            {#if !$UniboardStore.editMode}
              <UniboardTrackableGrid
                searching={searching ? true : false}
                on:tap={(evt) => onTap(evt.detail)}
                on:more={(evt) => onMore(evt.detail)}
                on:add={(evt) => onAdd()}
                on:longpress={(evt) => onLongpress(evt.detail)}
                hideAdd={!liveElementCount}
                {trackables}
              >
                <div slot="no-results">
                  {#if searching}
                    <div class="text-center px-4 py-1 flex flex-col space-y-2 max-w-lg mx-auto">
                      <span class="text-gray-500">No trackables found for '{searching}'</span>
                      <Button
                        on:click={() => {
                          openUnisearch(searching)
                        }}
                        size="sm"
                        clear
                        primary>Search Everything →</Button
                      >
                      <Button
                        size="sm"
                        clear
                        primary
                        on:click={() => {
                          let trackable = new Trackable({
                            type: 'tracker',
                            tracker: new TrackerClass({ label: searching }),
                          })
                          openTrackableEditor(trackable)
                        }}>Create new "{searching}" tracker →</Button
                      >
                    </div>
                  {/if}
                </div>
              </UniboardTrackableGrid>
            {:else if $UniboardStore.editMode}
              <UniboardEditorView
                on:updated={(evt) => {
                  dispatch('editted', evt.detail)
                }}
                board={$ActiveBoard}
              />
            {/if}

            {#if liveElementCount === 0}
              <div class="px-4 max-w-md mx-auto pb-10">
                <div class="text-center py-4">
                  <!-- <div class="text-6xl text-center lg:mt-10">👋</div> -->
                  <!-- <h1 class="font-bold mb-2 text-xl text-black dark:text-white leading-tight">
                    {Lang.t('general.get-started', 'Get Started!')}
                  </h1> -->
                  <div class="text-center  text-gray-500 dark:text-gray-400 leading-snug px-6 mb-6 lg:mb-10 flex-fill ">
                    <h1 class="text-black dark:text-white font-bold mb-1">Empty.</h1>
                    <p class="text-xs">
                      This is your {board.label} board; used to display your trackable buttons. Get started by adding a trackable
                      below.
                    </p>
                  </div>
                </div>

                <!-- <p class="max-w-screen-md text-xl text-black dark:text-white text-center">
                  Your {board.label} board is empty!
                  <span class="text-primary-600 dark:text-primary-400 underline inline">browse the library</span> or

                  <span class="text-primary-600 dark:text-primary-400 underline inline">create your own</span> from scratch.
                </p> -->

                <Menu
                  size="sm"
                  buttons={getEmptyBoardMenu()}
                  className="max-w-xs mx-auto rounded-2xl border border-gray-500 border-opacity-30"
                />
              </div>
            {/if}
          {:else}
            <div class="item-grid mock">
              {#each [1, 2, 3, 4, 5, 6] as count}
                <div
                  class="mock shortcut h-3 rounded-xl {$Prefs.compactTrackers
                    ? 'h-14'
                    : 'h-28 lg:h-32'} bg-gray-300 opacity-30 animate-pulse dark:bg-gray-700"
                />
              {/each}
            </div>
          {/if}
        </section>
      {/each}
    </Swiper>
  {:else if !$TrackableStore.ready && !$CombinedBoards}
    <div class="loading-box"><Spinner size={32} /></div>
  {/if}
</section>
