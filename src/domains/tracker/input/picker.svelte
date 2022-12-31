<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  // import ListItem from '../../../components/list-item/list-item.svelte'
  import PickerListEditor from '../../../components/picker-list/picker-editor.svelte'
  import PickerSelect from '../../../components/picker-list/picker-select.svelte'
  // import { objectHash } from '../../../modules/object-hash/object-hash'
  import type TrackerClass from '../../../modules/tracker/TrackerClass'
  // import { PermissionsStore } from '../../my-account/PermissionsStore'

  // import { saveTrackable, TrackableStore } from '../../trackable/TrackableStore'

  const dispatch = createEventDispatcher()

  export let tracker: TrackerClass

  let selected = []
  let mode: 'view' | 'edit' = 'view'

  function fireChange(evt) {
    dispatch('change', evt.detail)
  }

  // let lastHash: string = objectHash(tracker.asObject)

  // function toggleMode() {
  //   if (mode === 'edit') {
  //     let newHash = objectHash(tracker.asObject)
  //     if (newHash !== lastHash) {
  //       lastHash = newHash
  //       saveTrackable({
  //         trackable: tracker.toTrackable(),
  //         known: $TrackableStore.trackables,
  //         permissions: $PermissionsStore,
  //         prompt: false,
  //         saveToActiveBoard: false,
  //       })
  //     }
  //     mode = 'view'
  //     dispatch('enterView')
  //   } else {
  //     dispatch('enterEdit')
  //     mode = 'edit'
  //   }
  // }
</script>

<div class="picker-input-wrapper filler overflow-y-auto max-h-full min-h-0">
  {#if mode == 'edit'}
    <PickerListEditor
      className="mx-3 mt-3"
      list={tracker.picks}
      on:change={(evt) => {
        tracker.picks = evt.detail
      }}
      showHeaderContent={false}
    />
  {:else}
    <PickerSelect {tracker} active={selected} on:change={fireChange} />
  {/if}
  <!-- <ListItem
    className="{mode == 'view' ? 'text-primary-500' : 'text-red-500'} justify-center text-center"
    on:click={toggleMode}
  >
    <div class="text-center w-full font-bold text-sm">
      {#if mode == 'view'}
        Edit List
      {:else}
        Done
      {/if}
    </div>
  </ListItem> -->
</div>

<style lang="postcss" global>
  .tracker-input.picker {
  }

  .input-modal.type-picker {
    @apply overflow-y-auto;
    max-height: 75vh;
  }
  .picker-toggle {
    position: absolute !important;
    top: 0;
    left: 10px;
    z-index: 2000;
  }
  .n-picker-list .n-input-container {
    @apply bg-white dark:bg-black;
    @apply rounded-lg;
  }
</style>
