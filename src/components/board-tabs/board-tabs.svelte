<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  // components
  import NHScroller from '../h-scroller/h-scroller.svelte'

  import './board-tabs.css'
  import IonIcon from '../icon/ion-icon.svelte'
  import { ActiveBoard, CombinedBoards, deleteUniboard, saveSortedBoards } from '../../domains/board/UniboardStore'
  import type { UniboardType } from '../../domains/board/UniboardStore'
  import SortableList2 from '../sortable-list/sortable-list2.svelte'
  import CloseOutline from '../../n-icons/CloseOutline.svelte'

  import { Interact } from '../../store/interact'
  import { showToast } from '../toast/ToastStore'
  import { Prefs } from '../../domains/preferences/Preferences'

  export let boards: Array<UniboardType> = []

  export let className: string = ''

  export let editMode: boolean = false

  const dispatch = createEventDispatcher()

  const state = {
    active: null,
    activeIndex: 0,
    hasTimers: false,
    editMode: false,
  }
  let ready: boolean = true
  let localBoards: Array<UniboardType> = []
  let active: UniboardType

  $: if ($CombinedBoards && $Prefs) {
    localBoards = $CombinedBoards || []
    active = $ActiveBoard
    localBoards = localBoards
  }

  $: if (editMode === true) {
    state.editMode = true
  } else if (editMode === false) {
    state.editMode = false
  }
  // When board size changes
  $: if (boards.length && active) {
    boards.forEach((b, index) => {
      if (b.id == active.id && b.id !== '_all' && b.id !== '_timers') {
        state.activeIndex = index // all
      }
    })
  }

  async function deleteBoard(board) {
    let confirmed = await Interact.confirm(
      'Delete ' + board.label + ' tab?',
      "You can recreate it later, but it's not super easy."
    )
    if (confirmed === true) {
      ready = false
      await deleteUniboard(board)
      ready = true
      showToast({ message: 'Deleted' })
    }
  }
</script>

{#if $CombinedBoards && $CombinedBoards.length === 1}
  <div
    class="flex items-center flex-grow flex-shrink n-board-tabs min-h-14 max-h-14 h-14 {className}"
    data-scroll="0"
  />
{:else if $CombinedBoards && $CombinedBoards.length > 1}
  <div class="n-board-tabs {className}">
    {#if !state.editMode}
      <NHScroller activeIndex={state.activeIndex} wrapperClass="space-x-2" className="n-board-tabs overflow-y-hidden">
        {#each localBoards as board}
          <button
            title={`${board.label} board tab`}
            type="menu"
            class="tab board-{board.id}  {board == active ? 'selected' : 'inactive'}"
            on:click={() => {
              dispatch('tabTap', board)
            }}
          >
            {#if board.icon}
              <IonIcon icon={board.icon} size={22} />
            {:else}{board.label}{/if}
          </button>
        {/each}
        <slot />
        <slot name="right" />
      </NHScroller>
    {:else if ready}
      <SortableList2
        containerClass="w-full items-center flex-nowrap flex overflow-x-auto overflow-y-hidden mx-auto max-w-screen-xl border-2 border-gray-500 border-opacity-20 rounded-full"
        className="items-center h-10"
        bind:items={localBoards}
        handleClass="board-tab"
        key="id"
        direction="x"
        on:update={(evt) => {
          saveSortedBoards(evt.detail)
        }}
        let:item
      >
        <div class="px-1">
          <button
            on:click|preventDefault={() => {
              deleteBoard(item)
            }}
            class="rounded-full h-4 w-4 absolute z-50 -right-2 bg-red-500 text-white"
          >
            <IonIcon className="text-white" icon={CloseOutline} size={10} />
          </button>
          <button
            class="tab animate-shake-big board-tab mt-1 board-{item.id} {item == active ? 'selected ' : 'inactive'}"
          >
            {#if item.icon}
              <IonIcon icon={item.icon} size={22} />
            {:else}{item.label}{/if}
          </button>
        </div>
      </SortableList2>
    {/if}
  </div>
{/if}

<style lang="postcss" global>
  .add-board:before {
    display: none;
  }
  button.inactive {
    opacity: 0.8;
  }
</style>
