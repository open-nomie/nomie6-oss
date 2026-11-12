<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type TrackerClass from '../../../modules/tracker/TrackerClass'
  import Toolbar from '../../../components/toolbar/toolbar.svelte';
  import ButtonGroup from '../../../components/button-group/button-group.svelte';

  const dispatch = createEventDispatcher()
  const { tracker, value } = $props()

  let tempValue = $state<number>(value)
  let habittrue = $state(tracker?.habitChoice?.[0] || "Missed")
  let habitfalse = $state(tracker?.habitChoice?.[1] || "Achieved")

  $effect(() => {
    tempValue = value
  })

  $effect(() => {
    if (tracker?.habitChoice) {
      habittrue = tracker.habitChoice[0] || "Missed"
      habitfalse = tracker.habitChoice[1] || "Achieved"
    }
  })

  $effect(() => {
    if (tempValue) {
      dispatch('change', tempValue)
    }
  })
</script>

<div class="picker-input-wrapper filler overflow-y-auto max-h-full min-h-0">
  <Toolbar>
    <ButtonGroup
      bind:value={tempValue}
      className="max-w-sm mx-auto"
      buttons={[
        { label: habittrue, value: 1 },
        { label: habitfalse, value: -1 },
      ]}
    />
  </Toolbar>
 
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
