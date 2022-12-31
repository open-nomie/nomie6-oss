<script lang="ts">
  /**
   * Jun 12 2020 - Good god this file has turned into a nightmare.
   */

  // vendors

  //modules
  // import Tracker from '../../modules/tracker/TrackerClass'

  // utils

  // Components
  // import Toast from '../../components/toast/toast.svelte'

  // import NShareImage from '../../components/share-image/share-image.svelte'

  // import NLocationModal from '../../domains/map/location-modal.svelte'

  // import NCamera from "../../components/camera/camera.svelte";
  // Containers

  // Store
  import { Interact } from '../../store/interact'

  // import LocationViewerModal from '../map/location-viewer-modal.svelte'

  // let promptInput

  // $: if ($Interact.prompt.show && promptInput) {
  //   promptInput.focus()
  // }
</script>

<!-- <NPopMenu
  title={$Interact.popmenu.title}
  description={$Interact.popmenu.description}
  show={$Interact.popmenu.show}
  buttons={$Interact.popmenu.buttons}
  on:close={() => {
    Interact.dismiss()
  }}
>
  {#if $Interact.popmenu.component}
    Componete here
  {/if}
</NPopMenu> -->

<!-- <NAlertBox
  show={$Interact.alert.show}
  title={$Interact.alert.title}
  message={$Interact.alert.message}
  ok={$Interact.alert.ok}
  cancel={$Interact.alert.cancel}
  onInteract={(answer) => {
    $Interact.alert.onInteract(answer)
    Interact.dismiss()
  }}
/> -->

<!-- <NCamera
  show={$Interact.camera.show}
  on:photo={event => {
    methods.onCameraPhoto(event.detail);
  }}
  on:close={Interact.closeCamera} /> -->

<!-- <NAlertBox
  show={$Interact.prompt.show}
  title={$Interact.prompt.title}
  message={$Interact.prompt.message}
  cancel={$Interact.prompt.cancel}
  onInteract={(answer) => {
    if (answer) {
      if ($Interact.prompt.onInteract) {
        $Interact.prompt.onInteract($Interact.prompt.value)
      }
    } else {
      $Interact.prompt.onInteract(undefined)
    }
    Interact.dismiss()
  }}
>
  {#if $Interact.prompt.valueType == 'textarea'}
    <textarea
      name="value"
      title="input value"
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      class="mt-2 form-control"
      style="min-height:200px;"
    />
  {:else if $Interact.prompt.valueType == 'number'}
    <input
      name="value"
      pattern="[0-9]*"
      inputmode="numeric"
      title="input value "
      bind:this={promptInput}
      on:keypress={(evt) => {
        ifOnEnter(evt, () => {
          $Interact.prompt.onInteract(evt.detail.target.value)
        })
      }}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      on:focus={this.select}
      type="number"
      class="h-10 mt-2 form-control stiff"
    />
  {:else if $Interact.prompt.valueType == 'datetime'}
    <DateTimeBar
      opened
      calendarPosition="top"
      bind:date={$Interact.prompt.value}
      on:change={(evt) => {
        Interact.update((state) => {
          state.prompt.value = evt.detail.toDate()
          return state
        })
      }}
    />
  {:else}
    <input
      title="input value"
      on:keypress={(evt) => {
        ifOnEnter(evt, () => {
          $Interact.prompt.onInteract(evt.target.value)
          Interact.dismiss()
        })
      }}
      name="value"
      bind:this={promptInput}
      placeholder={$Interact.prompt.placeholder}
      bind:value={$Interact.prompt.value}
      class="h-10 mt-2 form-control"
    />
  {/if}
</NAlertBox> -->

<!-- <Toast /> -->

<!-- {#if $Interact.locationFinder.show}
  <NLocationModal />
{/if} -->
<!-- Tracker Editor -->

<!-- <NTrackerEditor
  tracker={new Tracker($Interact.trackerEditor.tracker)}
  on:save={(tracker) => {
    $Interact.trackerEditor.show = false
    $Interact.trackerEditor.tracker = null
    if ($Interact.trackerEditor.onInteract) {
      $Interact.trackerEditor.onInteract(tracker)
    }
  }}
  on:close={() => {
    Interact.dismissEditTracker()
  }}
/> -->

<!-- Tracker Selector -->

<!-- Share Image -->
<!-- {#if $Interact.shareImage.log}
  <NShareImage />
{/if} -->

<!-- {#if $Interact.locationViewer.show}
  <LocationViewerModal on:close={Interact.dismissLocations} />
{/if} -->
{#if $Interact.logEditor.show}
  <!-- <LogEditor
    log={$Interact.logEditor.log}
    on:close={() => {
      Interact.dismissEditLog()
    }}
    on:save={async (evt) => {
      try {
        let log = evt.detail
        await LedgerStore.updateLog(log, $Interact.logEditor.log.end)
        if ($Interact.logEditor.onInteract) {
          $Interact.logEditor.onInteract(log)
        }
        Interact.dismissEditLog()
      } catch (e) {
        Interact.alert(e.message)
      }
    }}
  /> -->
{/if}
