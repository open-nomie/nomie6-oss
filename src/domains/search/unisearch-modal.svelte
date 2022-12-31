<script lang="ts">
  import dayjs from 'dayjs'
  import escapeRegExp from 'lodash/escapeRegExp'
  import { onMount } from 'svelte'

  import TrackableAvatar from '../../components/avatar/trackable-avatar.svelte'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { BackdropStore } from '../../components/backdrop/backdrop-store'

  import { ActiveBackdropId, closeModal } from '../../components/backdrop/BackdropStore2'
  import Divider from '../../components/divider/divider.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import List from '../../components/list/list.svelte'
  import type { PopMenuButton } from '../../components/pop-menu/usePopmenu'

  import KeyDown from '../../modules/keyDown/keyDown.svelte'
  import TrackerClass from '../../modules/tracker/TrackerClass'
  import AppsOutline from '../../n-icons/AppsOutline.svelte'

  import CloseOutline from '../../n-icons/CloseOutline.svelte'
  import CreateOutline from '../../n-icons/CreateOutline.svelte'

  import PulseOutline from '../../n-icons/PulseOutline.svelte'
  import SearchIcon from '../../n-icons/SearchIcon.svelte'

  import { SearchStore } from './search-store'

  import { addNewPerson, showTrackablePopmenu } from '../board/boardActions'

  import { ActiveLogStore } from '../capture-log/CaptureLogStore'

  import { LedgerStore, saveLog } from '../ledger/LedgerStore'
  import { openLogDisplay } from '../nomie-log/log-display-modal/LogDisplayStore'
  import NLog from '../nomie-log/nomie-log'
  import { getDateFormats } from '../preferences/Preferences'
  import { openStats2 } from '../stats2/Stats2Store'
  import { openTrackableEditor } from '../trackable/trackable-editor/TrackableEditorStore'
  import { TrackableStore } from '../trackable/TrackableStore'

  import { onTrackerTap } from '../tracker/input/TrackerInputStore'

  import { getUnisearchResults, UnisearchResultsType, UnisearchStore } from './UnisearchStore'
import { openTimelineModal } from '../timeline/timeline-helpers';

  export let searchTerm: string
  export let id: string

  let results: UnisearchResultsType | undefined
  let exactMatchOptions: Array<PopMenuButton> = []

  let currentIndex: number = -1

  let dateFormats = getDateFormats()

  let showLogs = true
  let showTrackables = true
  let showCommands = true

  $: if (searchTerm?.length === 0) {
    results = undefined
  }

  onMount(() => {
    document.getElementById('search-field').focus()
    if ($UnisearchStore.term) {
      debounceSearch($UnisearchStore.term)
    }
  })

  let searchInitialized = false

  const close = async () => {
    closeModal(id)
  }

  let searchTimeout
  const debounceSearch = async (term: string) => {
    searchTerm = term
    clearTimeout(searchTimeout)
    if (searchTerm.length > 1) {
      searchTimeout = setTimeout(async () => {
        const newResults = await getUnisearchResults(term)

        results = results || { commands: [], trackables: [], exactTrackable: undefined, logs: [] }
        results.commands = newResults.commands || []
        results.trackables = newResults.trackables || []
        results.exactTrackable = newResults.exactTrackable
        results.logs = await LedgerStore.query({ search: escapeRegExp(searchTerm), start: dayjs().subtract(30, 'day') })

        exactMatchOptions = getExactMatchButtons()

        focusElement(0)
      }, 400)
    }
  }

  $: if (!searchTerm && $UnisearchStore.term && !searchInitialized) {
    searchInitialized = true
    searchTerm = $UnisearchStore.term
  }
  $: if (searchTerm && !searchInitialized) {
    searchInitialized = true
    debounceSearch(searchTerm)
  }

  const clickSelected = () => {
    const selectable = document.querySelectorAll('.unisearch .selectable')[currentIndex]
    if (selectable) {
      //@ts-ignore
      selectable.click()
    }
  }

  function focusElement(dir: number) {
    const selectables = document.querySelectorAll('.unisearch .selectable')
    if (dir < 0 && currentIndex < selectables.length && currentIndex > -2) {
      currentIndex = currentIndex - 1
    } else if (dir > 0 && currentIndex > -2) {
      currentIndex = currentIndex + 1
    } else {
      currentIndex = 0
    }

    if (currentIndex < -1) currentIndex = 0
    if (currentIndex > selectables.length) currentIndex = 0

    selectables.forEach((v, index) => {
      if (index != currentIndex) {
        v.classList.remove('selected')
      } else {
        v.classList.add('selected')
        if (index !== 0) {
          v.scrollIntoView({ behavior: 'smooth' })
        } else {
          document.getElementById('unisearch-scroll-point').scrollIntoView({ behavior: 'smooth' })
        }
      }
    })
  }

  const getExactMatchButtons = (): Array<PopMenuButton> => {
    return [
      {
        title: `${results?.exactTrackable?.label} Stats`,
        icon: PulseOutline,
        click() {
          openStats2(results?.exactTrackable, { date: new Date(), known: $TrackableStore.trackables })
        },
      },
      {
        title: `Track ${results?.exactTrackable?.tag}`,
        icon: AppsOutline,
        click() {
          if (results.exactTrackable?.type === 'tracker') {
            onTrackerTap(results.exactTrackable.tracker, $TrackableStore.trackables)
            // } else if (trackable.type === 'person') {
            //   openPersonModal(trackable.person)
          } else {
            close()
            ActiveLogStore.addElement(results?.exactTrackable?.tag)
            ActiveLogStore.focus()
          }
        },
      },
      {
        title: `Edit ${results?.exactTrackable?.label}`,
        icon: CreateOutline,
        click() {
          if (results.exactTrackable.type == 'tracker') {
            openTrackableEditor(results.exactTrackable.tracker.toTrackable())
          }
        },
      },
    ]
  }

  $: if ($BackdropStore[$BackdropStore.length - 1] === 'unisearch') {
    //@ts-ignore
    document.querySelector('.unisearch input')?.focus()
  } else {
    //@ts-ignore
    document.querySelector('.unisearch input')?.blur()
  }
</script>

<BackdropModal
  className="unisearch"
  mainClass="transition-all duration-200 h-50vh relative filler overflow-y-auto w-full"
>
  {#if $ActiveBackdropId === id}
    <KeyDown
      on:Escape={() => {
        closeModal(id)
      }}
      on:key={(key) => {
        key.preventDefault()
        key.stopPropagation()
        key.stopImmediatePropagation()
        if (key.detail == 'ArrowDown') {
          focusElement(1)
        } else if (key.detail == 'ArrowUp') {
          focusElement(-1)
        } else if (key.detail == 'Enter') {
          clickSelected()
        }
      }}
    />
  {/if}

  <header
    slot="header"
    class="input-wrapper w-full stuff flex items-stretch justify-items-stretch relative border-b border-gray-500 border-opacity-20"
  >
    <IonIcon
      size={28}
      icon={SearchIcon}
      className="text-gray-600 dark:text-gray-400  text-opacity-50 absolute top-3 left-2"
    />
    <!-- svelte-ignore a11y-autofocus -->
    <input
      id="search-field"
      autofocus
      bind:value={searchTerm}
      on:input={(evt) => {
        //@ts-ignore
        debounceSearch(evt.target.value)
      }}
      type="text"
      placeholder="Search your Nomie"
      class="search-input rounded-t-2xl w-full"
    />
    <button on:click={close} class="absolute top-3 rounded-full right-3 h-7 w-7 flex items-center justify-center">
      <IonIcon size={28} icon={CloseOutline} className="text-gray-500" />
    </button>
  </header>
  <main class="">
    <div id="unisearch-scroll-point" />
    {#if results}
      {#if results.exactTrackable}
        <header on:click={() => {}} class="list-header">{results.exactTrackable.label}</header>
        <List>
          {#each exactMatchOptions as button, index}
            <button
              class="selectable capitalize"
              on:click={() => {
                button.click()
              }}
            >
              <TrackableAvatar trackable={results.exactTrackable} size={22} />
              <main>{button.title}</main>
              <IonIcon icon={button.icon} />
            </button>
            {#if index < exactMatchOptions.length - 1}
              <Divider left={16} />
            {/if}
          {/each}
        </List>
        <Divider left={1} />
      {/if}

      {#if results.commands.length}
        <header
          on:click={() => {
            showCommands = !showCommands
          }}
          class="list-header {!showCommands ? 'opacity-50' : ''}"
        >
          Commands
        </header>
        <List className="rounded-none">
          {#if showCommands}
            {#each results.commands as command, index}
              <button
                class="selectable"
                on:click={() => {
                  command.click()
                }}
              >
                <main>{command.title}</main>
                {#if command.icon}
                  <IonIcon icon={command.icon} />
                {/if}
              </button>
              {#if index < results.commands.length - 1}
                <Divider left={16} />
              {/if}
            {/each}
          {/if}
        </List>
        <Divider left={1} />
      {/if}

      {#if results.trackables.length > 0 || searchTerm?.substring(0, 1) === '#' || searchTerm?.substring(0, 1) === '@' || searchTerm?.substring(0, 1) === '+'}
        <header
          on:click={() => {
            showTrackables = !showTrackables
          }}
          class="list-header {!showTrackables ? 'opacity-50' : ''}"
        >
          Trackables
        </header>
      {/if}
      <List>
        {#if showTrackables}
          {#each results.trackables as trackable, index}
            <button
              class="selectable"
              on:click={() => {
                showTrackablePopmenu(trackable)
              }}
            >
              <TrackableAvatar {trackable} size={22} />
              <main>{trackable.label}</main>
              <span class="action">Open</span>
            </button>
            {#if index < results.trackables.length - 1}
              <Divider left={48} />
            {/if}
          {/each}
          {#if searchTerm?.substring(0, 1) === '#' && results.trackables.length === 0}
            <button
              class="selectable"
              on:click={() => {
                openTrackableEditor(new TrackerClass({ label: searchTerm.replace('#', '') }).toTrackable())
              }}
            >
              <main>
                {searchTerm} doesn't exist
              </main>
              <div class="action">Create...</div>
            </button>
          {:else if searchTerm?.substring(0, 1) === '@' && results.trackables.length === 0}
            <button
              class="selectable"
              on:click={() => {
                addNewPerson(searchTerm.replace('@', ''))
              }}
            >
              <main>
                {searchTerm} not found
              </main>
              <div class="action">Create...</div>
            </button>
          {/if}
        {/if}
      </List>
      <Divider left={1} />
      <header
        on:click={() => {
          showLogs = !showLogs
        }}
        class="list-header {!showLogs ? 'opacity-50' : ''}"
      >
        Notes
      </header>

      <List>
        {#if showLogs}
          {#each results.logs as log, index}
            <button
              class="selectable log"
              on:click={() => {
                openLogDisplay(log)
              }}
            >
              <main>
                <div class="time text-xs text-gray-500">
                  {log.endDayjs().format(`${dateFormats.date} ${dateFormats.time}`)}
                </div>
                <p class="text-sm line-clamp-2 ">{log.note}</p>
              </main>
            </button>
            <Divider left={1} />
          {/each}
          <button
            class="selectable"
            on:click={() => {
              openTimelineModal({
                  search: searchTerm,
                  notes: true
                })
              // SearchStore.view('history', escapeRegExp(searchTerm))
            }}
          >
            <main class="text-sm leading-tight">Search all notes for: {searchTerm}</main>
            <div class="action">Search...</div>
          </button>
        {/if}
      </List>
    {/if}

    {#if searchTerm && searchTerm.length > 9}
      <button
        class="selectable"
        on:click={() => {
          saveLog(
            new NLog({
              note: searchTerm,
            })
          )
        }}
      >
        <main class="line-clamp-2">"{searchTerm}"</main>
        <span class="stiff action">Save as Note</span>
      </button>
    {/if}
  </main>

  {#if results}
    <div
      class="hidden dark:text-gray-500 xl:flex px-4 w-full items-center border-t border-gray-500 border-opacity-20 py-2 stiff space-x-4"
    >
      <div class="text-sm">↑↓ <span class="text-gray-400 text-sm">Select</span></div>
      <div class="text-xs">⮐ <span class="text-gray-400 text-sm">Open</span></div>
      <div class="filler" />
      <div class="text-xs">esc <span class="text-gray-400 text-sm">Close</span></div>
    </div>
  {:else}
    <div
      class="text-opacity-80 dark:bg-gray-900 text-gray-500 flex px-4 w-full items-center border-t text-xs leading-tight border-gray-500 border-opacity-20 py-2 pb-3 stiff space-x-4"
    >
      Search notes, trackables, and trigger commands (like Create...)
    </div>
  {/if}
  <!-- </section> -->
</BackdropModal>

<style lang="postcss" global>
  .unisearch-desktop {
    max-height: 75vh;
    min-height: 100px;
  }
  .unisearch-mobile {
    height: 99vh;
    width: 100vw;
  }

  .unisearch .search-input {
    @apply bg-white dark:bg-black dark:text-white;
    @apply text-lg py-3 pr-8 pl-10 focus:outline-none focus:ring-2 ring-inset ring-primary-500;
  }

  .unisearch .selectable .action {
    @apply inline-flex;
    @apply text-sm;
    @apply py-1 px-3 rounded-full;
    @apply bg-primary-50 text-primary-600;
    @apply dark:bg-primary-800 dark:text-primary-400;
  }

  .unisearch .selectable:focus .action,
  .unisearch .selectable.selected .action {
    @apply bg-primary-600 text-white;
  }
  .unisearch .selectable:focus,
  .unisearch .selectable.selected {
    @apply bg-primary-500 bg-opacity-20 dark:bg-primary-500 text-black dark:text-black;
    @apply outline-none;
  }
  .unisearch button.selectable {
    @apply w-full;
    @apply text-left;
    @apply px-4 py-3;
    @apply space-x-2;
    @apply flex items-center justify-items-stretch;
    @apply bg-white dark:bg-gray-800;
    @apply text-black dark:text-white;
  }

  .unisearch .list-header {
    @apply transition-all duration-100 ease-in-out;
    @apply bg-gray-50 dark:bg-gray-900;
    @apply z-20;
    @apply text-sm px-4 py-1 text-gray-500;
  }
  .unisearch .n-list .list-header:hover {
    @apply bg-gray-200 dark:bg-gray-600;
  }

  .unisearch button.selectable main {
    @apply flex-grow flex-shrink;
    @apply w-full;
  }
</style>
