<svelte:options runes={true} />

<script lang="ts">
  import { Prefs } from './../../preferences/Preferences'
  import MagnetSolid from './../../../n-icons/MagnetSolid.svelte'
  // Utils

  //Svelte
  import { onMount } from 'svelte'

  // Vendor
  // import dayjs from 'dayjs'

  // Modules
  import NomieLog, { NLog } from '../nomie-log'

  // Components

  // import HScroller from '../../components/h-scroller/h-scroller.svelte'
  // import NMap from '../../domains/map/map.svelte'

  import { Lang } from '../../../store/lang'

  import Button from '../../../components/button/button.svelte'

  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'

  import DatePicker from '../../../components/date-picker/date-picker.svelte'

  import math from '../../../utils/math/math'
  import { Interact } from '../../../store/interact'
  import type Location from '../../locations/LocationClass'

  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'

  import { getEmojiFromScore } from '../../../utils/positivity/positivity'

  import { LedgerStore } from '../../ledger/LedgerStore'
  import { showToast } from '../../../components/toast/ToastStore'
  import { ActiveLogStore } from '../../capture-log/CaptureLogStore'
  import MenuInline from '../../../components/menu/menu-inline.svelte'

  import { getPositivityButtons } from '../../board/boardActions'

  import { wait } from '../../../utils/tick/tick'
  import CaptureTextarea from '../../capture-log/capture-textarea.svelte'
  import IonIcon from '../../../components/icon/ion-icon.svelte'

  import MagnetOutline from '../../../n-icons/MagnetOutline.svelte'
  import locate from '../../../modules/locate/locate'
  import { findNearestLocationHeavy } from '../../locations/LocationStore'
  import CloseOutline from '../../../n-icons/CloseOutline.svelte'

  // Props
  const { log = undefined, id } = $props<{ log?: NLog; id?: string }>()

  let textarea
  // consts

  interface LogEditorState {
    log: NLog | undefined
    saving: boolean
    mapReady: boolean
  }

  // Setup state with mutable log
  let workingLog = $state<NLog | undefined>(log ? new NomieLog(log) : undefined)
  let updateTrigger = $state(0)

  let state = $state<LogEditorState>({
    saving: false,
    mapReady: false,
    log: undefined,
  })

  // Sync working log to state
  $effect(() => {
    state.log = workingLog
  })

  // Derive positivity buttons so they update when score changes
  let positivityButtons = $derived(
    workingLog && updateTrigger >= 0
      ? getPositivityButtons(workingLog.score, (pos) => {
          workingLog.score = pos.score
          updateTrigger++
        })
      : []
  )

  // Set up Methods
  const methods = {
    async init() {
      if (!workingLog) return
      let getLocation: boolean = $Prefs.alwaysLocate
      if (workingLog.lat && $Prefs.alwaysLocate) {
        getLocation = false
      }
      if (getLocation) {
        const geo = await locate()
        if (geo.latitude) {
          workingLog.lat = geo.latitude
          workingLog.lng = geo.longitude
          let location = await findNearestLocationHeavy({ lat: geo.latitude, lng: geo.longitude })
          if (location && location.name) {
            workingLog.location = location.name
          }
        }
      }
      state.mapReady = true
    },
    getLocations() {
      let locations = []
      if (workingLog?.lat) {
        locations.push({
          lat: workingLog.lat,
          lng: workingLog.lng,
          name: workingLog.location,
        })
      }
      return locations
    },
    async save() {
      try {
        state.saving = true
        await LedgerStore.updateLog(workingLog, log.end)
        ActiveLogStore.clear()
        showToast({
          message: `Saved: ${workingLog.note.substring(0, 100)}`,
        })
        close()
      } catch (e) {
        Interact.error(e.message)
      }
      // dispatch("close");
    },
  }

  async function selectLocation() {
    // let location = await Locations.selectLocation();
    let _location: any = await Interact.pickLocation()

    if (_location) {
      let location: Location = _location
      workingLog.lat = location.lat
      workingLog.lng = location.lng
      workingLog.location = location.name
    }
  }

  const removeLocation = async () => {
    workingLog.lat = undefined
    workingLog.lng = undefined
    workingLog.location = undefined
  }

  const close = () => {
    closeModal(id)
  }

  onMount(async () => {
    methods.init()
    await wait(200)
    textarea?.focus()
  })
</script>

<BackdropModal mainClass="bg-white dark:bg-black filler" className="h-full bg-white dark:bg-gray-800">
  <div slot="header" class="shadow-md z-40 relative">
    {#if workingLog}
      <ToolbarGrid>
        <Button slot="left" clear primary on:click={close}>
          {Lang.t('general.close', 'Close')}
        </Button>

        <div class="line-clamp-1 text-sm w-full min-w-0 text-black dark:text-white">
          {workingLog.note}
        </div>

        <Button clear primary on:click={methods.save} slot="right">
          {Lang.t('general.save', 'Save')}
        </Button>
      </ToolbarGrid>
      <!-- <div class="w-full flex items-center relative pl-4 h-10 border-t border-gray-500 border-opacity-20">

      </div> -->

      <ToolbarGrid>
        <MenuInline
          slot="left"
          id="log-editor-options"
          x="left"
          title="Select Score for this note"
          buttonClass="text-lg "
          menuButtons={positivityButtons}
        >
          <div title="Select Score for this note" class="w-full text-center" style="width:100%;">
            <div class="value w-10">
              {updateTrigger >= 0 ? getEmojiFromScore(workingLog.score).emoji : ''}
            </div>
          </div>
        </MenuInline>

        <DatePicker
          size="sm"
          on:change={(evt) => {
            workingLog.end = evt.detail
          }}
          time={workingLog.end}
          date={workingLog.end}
        />

        <Button
          title="Pin/Unpin Entry to top of Day"
          slot="right"
          clear
          icon
          on:click={() => {
            workingLog.pinned = !workingLog.pinned
            updateTrigger++
          }}
        >
          {#if updateTrigger >= 0 && workingLog.pinned}
            <IonIcon icon={MagnetSolid} className="text-green-500 dark:text-green-400" />
          {:else if updateTrigger >= 0}
            <IonIcon icon={MagnetOutline} className="text-primary opacity-80" />
          {/if}
        </Button>
      </ToolbarGrid>
    {/if}
  </div>

  {#if workingLog}
    <!-- Score and Date -->

    <div class="w-full flex items-center px-4 py-3 space-x-2 text-sm justify-center">
      <button
        class="control"
        on:click={() => {
          selectLocation()
        }}
      >
        {#if workingLog?.lat}
          <span class="text-green-500"
            >{workingLog.location || `${math.round(workingLog.lat, 100)},${math.round(workingLog.lng, 100)}`}</span
          >
        {:else}
          <span class="text-gray-500">{Lang.t('general.no-location', 'No Location Set')}</span>
        {/if}
      </button>
      {#if workingLog?.lat}
        <button class="flex items-center px-1 rounded-md" on:click={() => removeLocation()}
          ><IonIcon icon={CloseOutline} size={16} className="text-red-500" /></button
        >
      {/if}
    </div>

    <div class="filler h-full">
      <CaptureTextarea
        autofocus
        id="editor"
        placeholder="What's up?"
        class="p-4 pt-2 w-full focus:outline-none dark:text-gray-200 placeholder-gray-500 focus:ring ring-inset ring-primary-500 ring-opacity-20 bg-transparent"
        bind:value={workingLog.note}
        style="min-height:300px;"
      />
    </div>
  {/if}
</BackdropModal>

<style lang="postcss" global>
  .log-editor {
    z-index: 1301 !important;
  }
  .log-editor .n-map-container {
    height: 300px;
  }

  .log-editor .view-port .date-time {
    height: 350px;
    width: 100vw;
    max-width: 320px;
  }
  .meta-bar {
    @apply flex items-center justify-items-stretch;
    @apply space-x-2;
    @apply p-2;
  }
  .meta-bar > * {
    @apply border border-gray-500 border-opacity-20;
    @apply rounded-lg;
    @apply py-2 px-1;
    @apply w-full;
  }
  .meta-bar .label {
    @apply text-xs;
    @apply text-gray-800 dark:text-gray-200;
  }
  .meta-bar .value {
    @apply text-lg text-black dark:text-white;
    @apply line-clamp-1;
  }
</style>
