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
  import { trackEvent } from '../../usage/stat-ping'

  import { wait } from '../../../utils/tick/tick'
  import CaptureTextarea from '../../capture-log/capture-textarea.svelte'
  import IonIcon from '../../../components/icon/ion-icon.svelte'

  import MagnetOutline from '../../../n-icons/MagnetOutline.svelte'
  import locate from '../../../modules/locate/locate'
  import { findNearestLocationHeavy } from '../../locations/LocationStore'
  import CloseOutline from '../../../n-icons/CloseOutline.svelte'

  // Props
  export let log: NLog
  export let id: string

  let textarea
  // consts

  interface LogEditorState {
    log: NLog | undefined
    saving: boolean
    mapReady: boolean
  }

  // Setup state
  let state: LogEditorState = {
    saving: false,
    mapReady: false,
    log: log as undefined | NLog,
  }

  // Watch for Log
  // $: if (log) {
  //   state.log = new NomieLog(log);
  // }

  // Set up Methods
  const methods = {
    async init() {
      let getLocation: boolean = $Prefs.alwaysLocate
      if (log) {
        state.log = new NomieLog(log)
        state.log.note = `${state.log.note} `
        if (state.log.lat && $Prefs.alwaysLocate) {
          getLocation = false
        }
      }
      if (getLocation) {
        const geo = await locate()
        if (geo.latitude) {
          state.log.lat = geo.latitude
          state.log.lng = geo.longitude
          let location = await findNearestLocationHeavy({ lat: geo.latitude, lng: geo.longitude })
          if (location && location.name) {
            state.log.location = location.name
          }
        }
      }
      state.mapReady = true
    },
    getLocations() {
      let locations = []
      if (state.log.lat) {
        locations.push({
          lat: state.log.lat,
          lng: state.log.lng,
          name: state.log.location,
        })
      }
      return locations
    },
    async save() {
      try {
        state.saving = true
        await LedgerStore.updateLog(state.log, log.end)
        ActiveLogStore.clear()
        showToast({
          message: `Saved: ${state.log.note.substring(0, 100)}`,
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
      state.log.lat = location.lat
      state.log.lng = location.lng
      state.log.location = location.name
    }
  }

  const removeLocation = async () => {
    state.log.lat = undefined
    state.log.lng = undefined
    state.log.location = undefined
  }

  const close = () => {
    closeModal(id)
  }

  onMount(async () => {
    methods.init()
    trackEvent('journal-editor')
    await wait(200)
    textarea?.focus()
  })
</script>

<BackdropModal mainClass="bg-white dark:bg-black filler" className="h-full bg-white dark:bg-gray-800">
  <div slot="header" class="shadow-md z-40 relative">
    <ToolbarGrid>
      <Button slot="left" clear primary on:click={close}>
        {Lang.t('general.close', 'Close')}
      </Button>

      <div class="line-clamp-1 text-sm w-full min-w-0 text-black dark:text-white">
        {state.log.note}
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
        menuButtons={[
          ...getPositivityButtons(state.log.score, (pos) => {
            state.log.score = pos.score
          }),
        ]}
      >
        <div title="Select Score for this note" class="w-full text-center" style="width:100%;">
          <div class="value w-10">
            {getEmojiFromScore(state.log.score).emoji}
          </div>
        </div>
      </MenuInline>

      <DatePicker
        size="sm"
        on:change={(evt) => {
          state.log.end = evt.detail
        }}
        time={state.log.end}
        date={state.log.end}
      />

      <Button
        title="Pin/Unpin Entry to top of Day"
        slot="right"
        clear
        icon
        on:click={() => {
          state.log.pinned = !state.log.pinned
        }}
      >
        {#if state.log.pinned}
          <IonIcon icon={MagnetSolid} className="text-green-500 dark:text-green-400" />
        {:else}
          <IonIcon icon={MagnetOutline} className="text-primary opacity-80" />
        {/if}
      </Button>
    </ToolbarGrid>
  </div>

  {#if state.log}
    <!-- Score and Date -->

    <div class="w-full flex items-center px-4 py-3 space-x-2 text-sm justify-center">
      <button
        class="control"
        on:click={() => {
          selectLocation()
        }}
      >
        {#if state.log?.lat}
          <span class="text-green-500"
            >{state.log.location || `${math.round(state.log.lat, 100)},${math.round(state.log.lng, 100)}`}</span
          >
        {:else}
          <span class="text-gray-500">{Lang.t('general.no-location', 'No Location Set')}</span>
        {/if}
      </button>
      {#if state.log?.lat}
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
        bind:value={state.log.note}
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
